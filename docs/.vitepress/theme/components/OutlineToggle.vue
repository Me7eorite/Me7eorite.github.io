<script setup lang="ts">
import { ref, onMounted } from 'vue'

const visible = ref(true)

function toggle() {
  visible.value = !visible.value
  document.body.classList.toggle('outline-hidden', !visible.value)
  try {
    localStorage.setItem('outline-visible', String(visible.value))
  } catch {}
}

onMounted(() => {
  try {
    const saved = localStorage.getItem('outline-visible')
    if (saved === 'false') {
      visible.value = false
      document.body.classList.add('outline-hidden')
    }
  } catch {}
})
</script>

<template>
  <button class="outline-toggle-btn" @click="toggle" :title="visible ? '隐藏目录' : '显示目录'">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="8" y1="6" x2="21" y2="6"/>
      <line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/>
      <line x1="3" y1="12" x2="3.01" y2="12"/>
      <line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  </button>
</template>

<style scoped>
.outline-toggle-btn {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; padding: 0; cursor: pointer;
  background: transparent; border: none; color: var(--vp-c-text-2);
  border-radius: 6px; transition: all 0.15s;
}
.outline-toggle-btn:hover {
  background: var(--vp-c-bg-soft); color: var(--vp-c-text-1);
}
</style>