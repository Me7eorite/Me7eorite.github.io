<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useData, useRoute } from 'vitepress'

interface Header {
  level: number
  title: string
  link: string
  children?: Header[]
}

const route = useRoute()
const { frontmatter, theme } = useData()

const headers = ref<Header[]>([])
const expandedKeys = ref<Set<string>>(new Set())
const activeLink = ref('')

const storageKey = computed(() => `quiet-outline:${route.path}`)

function collectHeaders(): any[] {
  const main = document.querySelector('.VPDoc .vp-doc') || document.querySelector('.vp-doc')
  if (!main) return []
  const nodes = main.querySelectorAll('h1, h2, h3, h4')
  const list: any[] = []
  nodes.forEach((el) => {
    const id = el.id
    if (!id) return
    list.push({
      level: parseInt(el.tagName.substring(1)),
      title: (el.textContent || '').replace(/#$/, '').trim(),
      link: '#' + id
    })
  })
  return list
}

function buildTree(flat: any[]): Header[] {
  const result: Header[] = []
  let curH1: Header | null = null
  let curH2: Header | null = null
  let curH3: Header | null = null

  for (const h of flat) {
    const node: Header = { ...h, children: [] }
    if (h.level === 1) {
      curH1 = node; curH2 = null; curH3 = null
      result.push(node)
    } else if (h.level === 2) {
      curH2 = node; curH3 = null
      if (curH1) curH1.children!.push(node)
      else result.push(node)
    } else if (h.level === 3) {
      curH3 = node
      if (curH2) curH2.children!.push(node)
      else if (curH1) curH1.children!.push(node)
    } else if (h.level === 4) {
      if (curH3) curH3.children!.push(node)
      else if (curH2) curH2.children!.push(node)
      else if (curH1) curH1.children!.push(node)
    }
  }
  return result
}

function refresh() {
  headers.value = buildTree(collectHeaders())
  try {
    const saved = sessionStorage.getItem(storageKey.value)
    if (saved) {
      expandedKeys.value = new Set(JSON.parse(saved))
    } else {
      expandedKeys.value.clear()
    }
  } catch {}
}

function persist() {
  try {
    sessionStorage.setItem(storageKey.value, JSON.stringify([...expandedKeys.value]))
  } catch {}
}

function toggle(link: string) {
  if (expandedKeys.value.has(link)) expandedKeys.value.delete(link)
  else expandedKeys.value.add(link)
  expandedKeys.value = new Set(expandedKeys.value)
  persist()
}

function onScroll() {
  const headings = document.querySelectorAll('.VPDoc .vp-doc :is(h1, h2, h3, h4)')
  let current = ''
  headings.forEach((h) => {
    const rect = h.getBoundingClientRect()
    if (rect.top < 120) current = '#' + h.id
  })
  activeLink.value = current
}

watch(() => route.path, () => {
  setTimeout(refresh, 100)
})

onMounted(() => {
  setTimeout(refresh, 100)
  window.addEventListener('scroll', onScroll, { passive: true })
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

const label = computed(() => {
  return frontmatter.value.outline?.label || theme.value.outline?.label || '本页目录'
})
</script>

<template>
  <div class="quiet-outline" v-if="headers.length > 0">
    <div class="qo-title">{{ label }}</div>

    <ul class="qo-list">
      <li v-for="h in headers" :key="h.link" class="qo-item level-1">
        <div class="qo-row top" :class="{ active: activeLink === h.link }">
          <span
            v-if="h.children && h.children.length > 0"
            class="qo-caret"
            :class="{ expanded: expandedKeys.has(h.link) }"
            @click.stop.prevent="toggle(h.link)"
          >▶</span>
          <span v-else class="qo-caret-placeholder"></span>
          <a :href="h.link" class="qo-link">{{ h.title }}</a>
        </div>

        <ul v-if="h.children?.length && expandedKeys.has(h.link)" class="qo-sublist">
          <li v-for="c in h.children" :key="c.link" :class="`qo-item level-${c.level}`">
            <div class="qo-row" :class="{ active: activeLink === c.link }">
              <span
                v-if="c.children?.length"
                class="qo-caret"
                :class="{ expanded: expandedKeys.has(c.link) }"
                @click.stop.prevent="toggle(c.link)"
              >▶</span>
              <span v-else class="qo-caret-placeholder"></span>
              <a :href="c.link" class="qo-link">{{ c.title }}</a>
            </div>
            <ul v-if="c.children?.length && expandedKeys.has(c.link)" class="qo-sublist">
              <li v-for="d in c.children" :key="d.link" :class="`qo-item level-${d.level}`">
                <div class="qo-row" :class="{ active: activeLink === d.link }">
                  <span
                    v-if="d.children?.length"
                    class="qo-caret"
                    :class="{ expanded: expandedKeys.has(d.link) }"
                    @click.stop.prevent="toggle(d.link)"
                  >▶</span>
                  <span v-else class="qo-caret-placeholder"></span>
                  <a :href="d.link" class="qo-link">{{ d.title }}</a>
                </div>
                <ul v-if="d.children?.length && expandedKeys.has(d.link)" class="qo-sublist">
                  <li v-for="e in d.children" :key="e.link" class="qo-item level-4">
                    <div class="qo-row" :class="{ active: activeLink === e.link }">
                      <span class="qo-caret-placeholder"></span>
                      <a :href="e.link" class="qo-link" :class="{ active: activeLink === e.link }">{{ e.title }}</a>
                    </div>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.quiet-outline {
  font-size: 14px;
  padding: 4px 0;
  font-family: 'JetBrains Mono', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  overflow: visible !important;    /* 关键：允许内容溢出 */
}

.qo-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 14px;
  color: var(--vp-c-text-1);
}

.qo-list, .qo-sublist {
  list-style: none;
  padding: 0;
  margin: 0;
}

.qo-row {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 6px 4px;       /* 横向也加点 padding，配合 hover 背景 */
  width: 100%;
  min-width: 0;
  overflow: visible;
  border-radius: 4px;
  transition: background 0.15s;
}

.qo-row:hover {
  background: color-mix(in srgb, var(--vp-c-brand-1) 6%, transparent);
}

.qo-row.active {
  background: color-mix(in srgb, var(--vp-c-brand-1) 10%, transparent);
}

/* 项之间分隔线 */
.qo-item {
  margin: 0;
  padding: 4px 0;
  border-bottom: 1px solid var(--vp-c-divider);
}

/* 最后一项不要分隔线 */
.qo-item:last-child {
  border-bottom: none;
}

/* 子级不需要分隔线 */
.qo-sublist .qo-item {
  border-bottom: none;
  padding: 2px 0;
}

/* 暗色模式分隔线更柔和 */
.dark .qo-item {
  border-bottom-color: rgba(255, 255, 255, 0.06);
}

/* 关键：箭头和占位符必须完全一致的尺寸 */
.qo-caret,
.qo-caret-placeholder {
  display: inline-block !important;
  width: 16px !important;
  height: 16px !important;
  flex-shrink: 0 !important;
  flex-grow: 0 !important;
  margin-top: 4px;
  text-align: center;
  line-height: 16px;
}

.qo-caret {
  font-size: 10px;
  color: var(--vp-c-text-3);
  cursor: pointer;
  user-select: none;
  transition: transform 0.15s;
}

.qo-caret.expanded {
  transform: rotate(90deg);
}

.qo-caret-placeholder {
  /* 显示小圆点（无子项时） */
  visibility: visible;
  position: relative;
}

.qo-caret-placeholder::before {
  content: "•";
  font-size: 14px;
  color: var(--vp-c-text-3);
  opacity: 0.5;
}

.qo-link {
  color: var(--vp-c-text-1);
  text-decoration: none;
  line-height: 1.6;
  font-size: 14px;
  display: block;
  width: 100%;
  min-width: 0;
  flex: 1 1 auto;

  /* 关键：允许换行但不强制断词 */
  white-space: normal !important;
  word-break: normal !important;          /* 改回 normal，不再到处断 */
  overflow-wrap: break-word !important;   /* 只在长单词无法放下时才断 */
  hyphens: auto;

  overflow: visible !important;
  text-overflow: clip !important;

  /* 新特性：优化排版，避免末行只有一两个字符 */
  text-wrap: pretty;
}

.qo-link:hover,
.qo-link.active,
.qo-row.active .qo-link {
  color: var(--vp-c-brand-1);
}
.qo-row.active .qo-link {
  font-weight: 600;
}

.qo-sublist {
  padding-left: 14px;
  margin-top: 2px;
  border-left: 1px solid var(--vp-c-divider);
}

/* 各层级字号（整体加大） */
.qo-item.level-1 > .qo-row.top .qo-link {
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.qo-item.level-2 > .qo-row .qo-link {
  font-size: 14px;
  color: var(--vp-c-text-1);
}
.qo-item.level-3 .qo-link {
  font-size: 13.5px;
}
.qo-item.level-4 .qo-link {
  font-size: 13px;
  color: var(--vp-c-text-2);
}
</style>