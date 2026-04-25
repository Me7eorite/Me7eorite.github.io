import { defineConfig } from 'vitepress'
import { withSidebar } from 'vitepress-sidebar'

// VitePress 主配置（注意：不要在这里写 sidebar，让插件接管）
const vitePressConfig = {
  title: "Meteor Strike",
  description: "A CyberSecurity Notes",

  // Catppuccin 代码高亮
  markdown: {
    theme: {
      light: 'catppuccin-latte',
      dark: 'catppuccin-mocha',
    } as any,
  },

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: 'Examples', link: '/markdown-examples' }
    ],

    // sidebar 这里删掉，由 vitepress-sidebar 插件自动生成

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Me7eorite/Me7eorite.github.io' }
    ],

    outline: { label: '本页目录', level: [2, 3] },
    docFooter: { prev: '上一篇', next: '下一篇' },
    lastUpdatedText: '最后更新',
    returnToTopLabel: '返回顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
  },

  lang: 'zh-CN',
  lastUpdated: true,
  cleanUrls: true,
}

// vitepress-sidebar 配置
const vitePressSidebarOptions = {
  documentRootPath: 'docs',           // 扫描 docs/ 目录
  collapsed: false,                    // 默认展开所有分组
  collapseDepth: 2,                    // 第 2 层及以下默认折叠
  useTitleFromFileHeading: true,       // 用文章里的 # 一级标题做侧边栏名
  useTitleFromFrontmatter: true,       // 优先用 front-matter 的 title 字段
  useFolderTitleFromIndexFile: true,   // 文件夹用其 index.md 的标题做名字
  sortMenusByName: false,              // 按名字排序（true 字母序，false 文件系统序）
  sortMenusOrderByDescending: false,
  manualSortFileNameByPriority: ['index.md'],  // index.md 永远排第一
  excludePattern: ['README.md'],       // 排除 README
  capitalizeFirst: true,
}

// https://vitepress.dev/reference/site-config
export default defineConfig(withSidebar(vitePressConfig, vitePressSidebarOptions))