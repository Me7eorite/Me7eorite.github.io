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

// 净化 markdown 语法的工具函数
function sanitizeDescription(text: string): string {
  if (!text) return ''

  return text
    // 1. 解码 HTML 实体（&gt; → >, &lt; → <, &amp; → &, &quot; → ")
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')

    // 2. 移除引用块标记（行首的 > 符号）
    .replace(/^\s*>+\s*/gm, '')

    // 3. 移除行内代码反引号（保留内容）
    .replace(/`([^`]+)`/g, '$1')

    // 4. 移除代码块标记 ```
    .replace(/```[\s\S]*?```/g, '')
    .replace(/```\w*/g, '')

    // 5. 移除标题井号（# / ## / ###）
    .replace(/^#{1,6}\s+/gm, '')

    // 6. 移除图片语法 ![alt](url) 和 ![[xxx]]（Obsidian 双链图片）
    .replace(/!\[\[.*?\]\]/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')

    // 7. 移除链接语法 [text](url)，保留 text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

    // 8. 移除 Obsidian 双链 [[xxx]]，保留 xxx
    .replace(/\[\[([^\]|]+)(\|[^\]]+)?\]\]/g, '$1')

    // 9. 移除粗体/斜体标记 **text** / *text* / __text__ / _text_
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/(?<![a-zA-Z0-9])_([^_]+)_(?![a-zA-Z0-9])/g, '$1')

    // 10. 移除删除线 ~~text~~
    .replace(/~~([^~]+)~~/g, '$1')

    // 11. 移除列表标记（- / * / 1. 等）
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')

    // 12. 移除水平分割线 --- / ***
    .replace(/^[-*_]{3,}$/gm, '')

    // 13. 移除 HTML 标签
    .replace(/<[^>]+>/g, '')

    // 14. 压缩多余空白和换行
    .replace(/\n{2,}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
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

  // 文章预览 description 净化处理
  transformPageData(pageData) {
    // 优先级 1：frontmatter 里手写了 description → 直接使用，不做净化
    if (pageData.frontmatter.description) {
      return
    }

    // 优先级 2：从 description 自动生成的内容做净化
    if (pageData.description) {
      pageData.description = sanitizeDescription(pageData.description)
    }

    // 优先级 3：如果主题用 frontmatter.summary 字段存预览，也清理
    if (pageData.frontmatter.summary) {
      pageData.frontmatter.summary = sanitizeDescription(pageData.frontmatter.summary as string)
    }

    // 优先级 4：excerpt 字段（部分主题使用）
    if (pageData.frontmatter.excerpt) {
      pageData.frontmatter.excerpt = sanitizeDescription(pageData.frontmatter.excerpt as string)
    }
  },

  themeConfig: {
    sidebar: {
      '/Java-Learning/': withLinkPrefix(
        generateSidebar({
          documentRootPath: 'docs',
          scanStartPath: 'Java-Learning',
          useTitleFromFileHeading: true,
          collapsed: true,
        }) as SidebarNode[],
        '/Java-Learning/'
      ),
      '/AI-Learning/': generateSidebar({
        documentRootPath: 'docs',
        collapsed: true,
        scanStartPath: 'AI-Learning'
      })
    },
    outline: {
      level: [1, 4],
      label: '本页目录'
    },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '相关文章',
    lastUpdatedText: '最后更新',

    logo: '/logo.png',

    nav: [
      { text: '首页', link: '/' },
      { text: '🤖 AI', link: '/AI-Learning/' },
      { text: '☕ Java', link: '/Java-Learning/' },
      { text: '⛓️ Web3', link: '/Web3-Learning/' },
      { text: '☁️ 云原生', link: '/Cloud-Learning/' },
    ],

    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/Me7eorite/Me7eorite.github.io'
      }
    ]
  }
})