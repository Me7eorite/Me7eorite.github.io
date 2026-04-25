import { defineConfig } from 'vitepress'

// 导入主题的配置
import { blogTheme } from './blog-theme'

// Vitepress 默认配置
// 详见文档：https://vitepress.dev/reference/site-config
export default defineConfig({
  // 继承博客主题(@sugarat/theme)
  extends: blogTheme,
  lang: 'zh-cn',
  title: 'M7 Lab',
  description: 'me7eorite 的网络安全研究笔记 · Java · AI · Web3 · 云原生',
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],
  themeConfig: {
    outline: {
      level: [2, 3],
      label: '本页目录'
    },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '相关文章',
    lastUpdatedText: '最后更新',

    // 暂时不配 logo，等你有 logo 图再加
    // logo: '/logo.png',

    nav: [
      { text: '首页', link: '/' },
      { text: '🤖 AI', link: '/ai/' },
      { text: '☕ Java', link: '/java/' },
      { text: '⛓️ Web3', link: '/web3/' },
      { text: '☁️ 云原生', link: '/cloud/' },
      { text: '关于', link: '/about' }
    ],

    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/Me7eorite/Me7eorite.github.io'
      }
    ]
  }
})