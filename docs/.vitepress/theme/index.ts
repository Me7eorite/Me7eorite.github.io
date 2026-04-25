import BlogTheme from '@sugarat/theme'
import { h } from 'vue'

// 自定义组件
import QuietOutline from './components/QuietOutline.vue'
import OutlineToggle from './components/OutlineToggle.vue'
import AsideResizer from './components/AsideResizer.vue'

// 自定义样式重载
import './sidebar.css'
import './custom.css'

export default {
  extends: BlogTheme,
  Layout() {
    return h(BlogTheme.Layout, null, {
      'aside-outline-before': () => h(AsideResizer),  // 拖动调整手柄
      'aside-outline-after': () => h(QuietOutline),   // 本页目录
      'nav-bar-content-after': () => h(OutlineToggle),
    })
  }
}