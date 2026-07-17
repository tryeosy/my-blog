import { defineConfig } from 'vitepress'

export default defineConfig({
  // GitHub Pages 地址：
  // https://tryeosy.github.io/my-blog/
  base: '/my-blog/',

  lang: 'zh-CN',
  title: '我的个人博客',
  description: '基于 GitHub Issues + VitePress',

  themeConfig: {
    sidebar: false,

    nav: [
      {
        text: '首页',
        link: '/'
      }
    ]
  }
})
