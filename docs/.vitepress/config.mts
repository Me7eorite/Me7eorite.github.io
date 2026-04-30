import { defineConfig } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar'

// 导入主题的配置
import { blogTheme } from './blog-theme'


type SidebarNode = {
  link?: string
  items?: SidebarNode[]
  [key: string]: unknown
}

function withLinkPrefix(items: SidebarNode[], prefix: string): SidebarNode[] {
  const normalizedPrefix = prefix.endsWith('/') ? prefix : `${prefix}/`

  return items.map((item) => {
    const next: SidebarNode = { ...item }

    if (typeof next.link === 'string' && !next.link.startsWith('/')) {
      next.link = `${normalizedPrefix}${next.link}`.replace(/\/{2,}/g, '/')
    }

    if (Array.isArray(next.items)) {
      next.items = withLinkPrefix(next.items, normalizedPrefix)
    }

    return next
  })
}

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
  markdown: {
    math: true
  },
  themeConfig: {
    sidebar: {
      '/JavaSec/': withLinkPrefix(
        generateSidebar({
          documentRootPath: 'docs',
          scanStartPath: 'JavaSec',
          useTitleFromFileHeading: true,
          collapsed: true,
        }) as SidebarNode[],
        '/JavaSec/'
      ),
      // '/AIHub/':  withLinkPrefix(generateSidebar({
      //   documentRootPath: 'docs',
      //   collapsed: true,
      //   scanStartPath: 'AIHub'
      // }) as SidebarNode[],
      //   '/AIHub/'
      // ),
      // '/Web3Lab/': withLinkPrefix(
      //   generateSidebar({
      //     documentRootPath: 'docs',
      //     scanStartPath: 'Web3Lab',
      //     useTitleFromFileHeading: true,
      //     collapsed: true,
      //   }) as SidebarNode[],
      //   '/Web3Lab/'
      // ),
      // '/CloudOps/': withLinkPrefix(
      //   generateSidebar({
      //     documentRootPath: 'docs',
      //     scanStartPath: 'CloudOps',
      //     useTitleFromFileHeading: true,
      //     collapsed: true,
      //   }) as SidebarNode[],
      //   '/CloudOps/'
      // ),
    },
    outline: {
      level: [1, 6],
      label: '本页目录'
    },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '相关文章',
    lastUpdatedText: '最后更新',

    logo: '/logo.png',

    nav: [
      { text: '首页', link: '/' },
      // { text: '🤖 AI', link: '/AIHub/' },
      { text: '☕ Java', link: '/JavaSec/' },
      // { text: '⛓️ Web3', link: '/Web3Lab/' },
      // { text: '☁️ 云原生', link: '/CloudOps/' },
    ],

    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/Me7eorite/Me7eorite.github.io'
      }
    ]
  }
})