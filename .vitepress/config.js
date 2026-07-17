import { defineConfig } from 'vitepress'

const rawSiteUrl =
  process.env.SITE_URL?.trim() ||
  'https://tryeosy.github.io/my-blog'

const siteUrl = rawSiteUrl.replace(/\/+$/, '')

const rawBase =
  process.env.SITE_BASE?.trim() ||
  '/my-blog/'

const base =
  rawBase === '/'
    ? '/'
    : `/${rawBase.replace(/^\/+|\/+$/g, '')}/`

const gaId = process.env.VITE_GA_ID?.trim() || ''

function pageUrl(relativePath) {
  const path = relativePath
    .replace(/(^|\/)index\.md$/, '$1')
    .replace(/\.md$/, '.html')

  return new URL(path, `${siteUrl}/`).href
}

const analyticsHead = gaId
  ? [
      [
        'script',
        {
          async: '',
          src: `https://www.googletagmanager.com/gtag/js?id=${gaId}`
        }
      ],
      [
        'script',
        {},
        `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${gaId}');`
      ]
    ]
  : []

export default defineConfig({
  base,
  lang: 'zh-CN',
  title: 'tryeosy的一隅',
  titleTemplate: ':title | tryeosy的一隅',
  description: '记录学习、技术与生活中的点滴。',

  sitemap: {
    hostname: siteUrl
  },

  head: [  [
    'link',
    {
      rel: 'icon',
      type: 'image/svg+xml',
      href: `${base}favicon.svg`
    }
  ],
    ['meta', { name: 'author', content: 'tryeosy' }],
    ['meta', { name: 'robots', content: 'index, follow' }],
    [
      'link',
      {
        rel: 'alternate',
        type: 'application/rss+xml',
        title: '我的个人博客 RSS',
        href: `${base}rss.xml`
      }
    ],
    ...analyticsHead
  ],

  transformHead({ pageData }) {
    const canonical = pageUrl(pageData.relativePath)
    const title = pageData.title || '我的个人博客'
    const description =
      pageData.frontmatter.description ||
      pageData.description ||
      '记录学习、技术与生活中的点滴。'

    const head = [
      ['link', { rel: 'canonical', href: canonical }],
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:locale', content: 'zh_CN' }],
      ['meta', { property: 'og:site_name', content: '我的个人博客' }],
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: description }],
      ['meta', { property: 'og:url', content: canonical }],
      ['meta', { name: 'twitter:card', content: 'summary' }],
      ['meta', { name: 'twitter:title', content: title }],
      ['meta', { name: 'twitter:description', content: description }]
    ]

    const tags = Array.isArray(pageData.frontmatter.tags)
      ? pageData.frontmatter.tags.filter(Boolean)
      : []

    if (tags.length > 0) {
      head.push([
        'meta',
        {
          name: 'keywords',
          content: tags.join(', ')
        }
      ])

      tags.forEach((tag) => {
        head.push([
          'meta',
          {
            property: 'article:tag',
            content: String(tag)
          }
        ])
      })
    }

    if (pageData.relativePath.startsWith('posts/')) {
      head.push(['meta', { property: 'og:type', content: 'article' }])

      if (pageData.frontmatter.date) {
        head.push([
          'meta',
          {
            property: 'article:published_time',
            content: String(pageData.frontmatter.date)
          }
        ])
      }

      if (pageData.frontmatter.updated) {
        head.push([
          'meta',
          {
            property: 'article:modified_time',
            content: String(pageData.frontmatter.updated)
          }
        ])
      }

      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: title,
        description,
        url: canonical,
        mainEntityOfPage: canonical,
        author: {
          '@type': 'Person',
          name: 'tryeosy'
        },
        publisher: {
          '@type': 'Person',
          name: 'tryeosy'
        },
        datePublished: pageData.frontmatter.date || undefined,
        dateModified:
          pageData.frontmatter.updated ||
          pageData.frontmatter.date ||
          undefined,
        keywords: tags.join(', ') || undefined
      }

      head.push([
        'script',
        { type: 'application/ld+json' },
        JSON.stringify(structuredData)
      ])
    }

    return head
  },

  themeConfig: {
    sidebar: false,

    nav: [
      { text: '首页', link: '/' },
      {
    text: 'RSS',
    link: 'https://tryeosy.github.io/my-blog/rss.xml'
  }
    ],

    search: {
       provider: 'local',

  options: {
    miniSearch: {
      searchOptions: {
        // 支持少量模糊匹配
        fuzzy: 0.2,

        // 输入部分文字也可以匹配
        prefix: true,

        // 文章标题的匹配权重高于正文
        boost: {
          title: 10,
          text: 2,
          titles: 4
        }
      }
    },

    // 将 Frontmatter 中的文章标题和正文一起加入搜索索引
    _render(src, env, md) {
      // VitePress 1.6.4 必须使用 md.render
      const html = md.render(src, env)

      // 排除设置了 search: false 的页面
      if (env.frontmatter?.search === false) {
        return ''
      }

      const title = env.frontmatter?.title

      // 只给自动生成的文章页面补充标题索引
      if (
        title &&
        env.relativePath.startsWith('posts/')
      ) {
        const safeTitle = String(title).replace(/\n/g, ' ')

        return md.render(`# ${safeTitle}`) + html
      }

      return html
    },

    locales: {
      root: {
        translations: {
          button: {
            buttonText: '搜索',
            buttonAriaLabel: '搜索'
          },

          modal: {
            displayDetails: '显示详细结果',
            resetButtonTitle: '清除搜索',
            backButtonTitle: '关闭搜索',
            noResultsText: '没有找到相关文章',

            footer: {
              selectText: '打开',
              selectKeyAriaLabel: '回车',
              navigateText: '选择',
              navigateUpKeyAriaLabel: '上箭头',
              navigateDownKeyAriaLabel: '下箭头',
              closeText: '关闭',
              closeKeyAriaLabel: 'ESC'
            }
          }
        }
      }
    }
  }
    },

    footer: {
      message: '基于 GitHub Issues、VitePress 与 GitHub Actions',
      copyright: 'Copyright © 2026 tryeosy'
    }
  }
})
