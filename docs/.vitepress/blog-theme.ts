// 主题独有配置
import type { Theme } from '@sugarat/theme'
import { getThemeConfig } from '@sugarat/theme/node'


const baseUrl = 'https://me7.top'
const RSS: Theme.RSSOptions = {
  title: 'M7 Lab',
  baseUrl,
  copyright: 'Copyright (c) 2026-present, me7eorite',
}

// 所有配置项，详见文档: https://theme.sugarat.top/
const blogTheme = getThemeConfig({
  // 默认开启 pagefind 离线全文搜索
  search: false,  // 如想关闭，取消此行注释
  // mermaid: true,
  // 页脚
  footer: {
    version: false,
    copyright: 'MIT License | me7eorite',
  },

  // 主题色
  // 可选：vp-default / vp-green / el-blue / el-green
  themeColor: 'el-blue',

  // 文章默认作者
  author: 'me7eorite',

  // 主页博客流配置
  // homeArticleSize 配置首页文章列表显示数量

  // 友链
  friend: [
    {
      nickname: 'GitHub',
      des: 'me7eorite 的代码仓库',
      avatar: 'https://github.com/Me7eorite.png',
      url: 'https://github.com/Me7eorite',
    },
  ],
  RSS

  // 公告（首次访问会弹出）
  // 暂时关掉，等你想发公告再开
  // popover: {
  //   title: '公告',
  //   body: [
  //     { type: 'text', content: '欢迎来到 Meteor Strike！' }
  //   ],
  //   duration: 0
  // },
})

export { blogTheme }