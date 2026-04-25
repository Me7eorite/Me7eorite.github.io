<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const MIN_WIDTH = 180
const MAX_WIDTH = 480
const DEFAULT_WIDTH = 240
const STORAGE_KEY = 'aside-width'

const isDragging = ref(false)
const handleLeft = ref(0)
let startX = 0
let startWidth = 0

function applyWidth(w: number) {
  const clamped = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, w))
  document.documentElement.style.setProperty('--aside-width', `${clamped}px`)
  updateHandlePosition()
}

function updateHandlePosition() {
  const aside = document.querySelector('.aside') as HTMLElement
  if (aside) {
    const rect = aside.getBoundingClientRect()
    handleLeft.value = rect.left - 4   // 让手柄中心落在 aside 左边缘
  }
}

function onMouseDown(e: MouseEvent) {
  isDragging.value = true
  startX = e.clientX
  const aside = document.querySelector('.aside') as HTMLElement
  startWidth = aside ? aside.getBoundingClientRect().width : DEFAULT_WIDTH
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  e.preventDefault()
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging.value) return
  const delta = startX - e.clientX
  applyWidth(startWidth + delta)
}

function onMouseUp() {
  if (!isDragging.value) return
  isDragging.value = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
  const aside = document.querySelector('.aside') as HTMLElement
  if (aside) {
    const w = aside.getBoundingClientRect().width
    try { localStorage.setItem(STORAGE_KEY, String(Math.round(w))) } catch {}
  }
}

onMounted(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) applyWidth(parseInt(saved))
    else applyWidth(DEFAULT_WIDTH)
  } catch {
    applyWidth(DEFAULT_WIDTH)
  }
  // 初始定位 + 窗口 resize 时重新定位
  setTimeout(updateHandlePosition, 100)
  window.addEventListener('resize', updateHandlePosition)
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateHandlePosition)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
})
</script>

<template>
  <div
    class="aside-resizer"
    :class="{ dragging: isDragging }"
    :style="{ left: handleLeft + 'px' }"
    @mousedown="onMouseDown"
    title="拖动调整目录宽度"
  >
    <div class="resizer-line"></div>
  </div>
</template>

<style scoped>
.aside-resizer {
  position: fixed;             /* 改为 fixed，独立定位 */
  top: 100px;                  /* 从导航栏下方开始 */
  bottom: 40px;                /* 距底部留白 */
  width: 8px;
  cursor: col-resize;
  z-index: 50;                 /* 比导航栏低，避免遮挡 */
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
}

.resizer-line {
  width: 2px;
  height: 60px;                /* 关键：只显示一小段，macOS 风格 */
  background: var(--vp-c-divider);
  border-radius: 2px;
  opacity: 0;
  transition: opacity 0.2s, background 0.15s, height 0.2s;
}

.aside-resizer:hover .resizer-line {
  opacity: 0.6;
  background: var(--vp-c-brand-1);
}

.aside-resizer.dragging .resizer-line {
  opacity: 1;
  background: var(--vp-c-brand-1);
  height: 100%;                /* 拖动时延伸为全长，反馈状态 */
}
</style>