import fs from 'fs'
import path from 'path'

const REPO = 'tryeosy/my-blog'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN

const SITE_URL = (
  process.env.SITE_URL?.trim() ||
  'https://tryeosy.github.io/my-blog'
).replace(/\/+$/, '')

const postsDir = path.resolve('posts')
const vpDir = path.resolve('.vitepress')
const publicDir = path.resolve('public')

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function escapeXml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function stripMarkdown(value = '') {
  return String(value)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~>|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function makeExcerpt(body, maxLength = 180) {
  const text = stripMarkdown(body)

  if (text.length <= maxLength) {
    return text || '暂无摘要'
  }

  return `${text.slice(0, maxLength).trim()}……`
}

function postUrl(issueNumber) {
  return `${SITE_URL}/posts/${issueNumber}.html`
}

async function fetchAllOpenIssues(headers) {
  const allIssues = []
  let page = 1

  while (true) {
    const url =
      `https://api.github.com/repos/${REPO}/issues` +
      `?state=open&per_page=100&page=${page}`

    console.log(`[接口] ${url}`)

    const res = await fetch(url, { headers })

    if (!res.ok) {
      const message = await res.text()
      throw new Error(
        `GitHub API 请求失败：${res.status} ${res.statusText}\n${message}`
      )
    }

    const batch = await res.json()

    if (!Array.isArray(batch)) {
      throw new Error('GitHub API 返回的数据不是数组。')
    }

    allIssues.push(...batch)

    if (batch.length < 100) {
      break
    }

    page += 1
  }

  return allIssues
}

function createRss(postsMetadata) {
  const buildDate = new Date().toUTCString()
  const items = postsMetadata
    .map((post) => {
      const tags = post.tags
        .map((tag) => `    <category>${escapeXml(tag)}</category>`)
        .join('\n')

      return `  <item>
    <title>${escapeXml(post.title)}</title>
    <link>${escapeXml(post.url)}</link>
    <guid isPermaLink="true">${escapeXml(post.url)}</guid>
    <pubDate>${escapeXml(post.pubDate)}</pubDate>
    <description>${escapeXml(post.description)}</description>
${tags}
  </item>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>我的个人博客</title>
  <link>${escapeXml(SITE_URL)}</link>
  <description>记录学习、技术与生活中的点滴。</description>
  <language>zh-CN</language>
  <lastBuildDate>${escapeXml(buildDate)}</lastBuildDate>
  <atom:link href="${escapeXml(`${SITE_URL}/rss.xml`)}" rel="self" type="application/rss+xml" />
${items}
</channel>
</rss>
`
}

async function fetchIssues() {
  const headers = {
    'User-Agent': 'VitePress-Blog-Bot',
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(GITHUB_TOKEN
      ? { Authorization: `Bearer ${GITHUB_TOKEN}` }
      : {})
  }

  ensureDir(postsDir)
  ensureDir(vpDir)
  ensureDir(publicDir)

  const postsMetadata = []

  try {
    console.log(`[开始] 正在从 ${REPO} 获取 GitHub Issues……`)

    const issues = await fetchAllOpenIssues(headers)

    for (const issue of issues) {
      if (issue.pull_request) {
        continue
      }

      const tags = Array.isArray(issue.labels)
        ? issue.labels
            .map((label) =>
              typeof label === 'string'
                ? label
                : label?.name
            )
            .filter(Boolean)
        : []

      const title = issue.title || '未命名文章'
      const date = issue.created_at
        ? issue.created_at.split('T')[0]
        : ''
      const updated = issue.updated_at
        ? issue.updated_at.split('T')[0]
        : date
      const description = makeExcerpt(issue.body || '')
      const url = postUrl(issue.number)

      const frontMatter = [
        '---',
        `title: ${JSON.stringify(title)}`,
        `description: ${JSON.stringify(description)}`,
        `date: ${JSON.stringify(date)}`,
        `updated: ${JSON.stringify(updated)}`,
        `tags: ${JSON.stringify(tags)}`,
        `issueNumber: ${issue.number}`,
        `source: ${JSON.stringify(issue.html_url || '')}`,
        '---',
        ''
      ].join('\n')

      // 清理标题中的换行，避免破坏 Markdown 一级标题
const markdownTitle = title
  .replace(/[\r\n]+/g, ' ')
  .replace(/#/g, '\\#')
  .trim()

const markdownBody = issue.body || ''

// 将 Issue 标题真正写成文章的一级标题
const markdownContent = [
  frontMatter,
  `# ${markdownTitle}`,
  '',
  markdownBody,
  ''
].join('\n')

fs.writeFileSync(
  path.join(postsDir, `${issue.number}.md`),
  markdownContent,
  'utf-8'
)

      postsMetadata.push({
        title,
        path: `/posts/${issue.number}`,
        url,
        date,
        updated,
        tags,
        description,
        number: issue.number,
        pubDate: issue.created_at
          ? new Date(issue.created_at).toUTCString()
          : new Date().toUTCString()
      })

      console.log(
        `[文章] 已生成 posts/${issue.number}.md：${title}`
      )
    }

    postsMetadata.sort((a, b) => {
      return new Date(b.date).getTime() -
        new Date(a.date).getTime()
    })
  } catch (error) {
    console.error('抓取或生成文章时发生错误：')
    console.error(error)
    process.exitCode = 1
  } finally {
    fs.writeFileSync(
      path.join(vpDir, 'posts-data.json'),
      JSON.stringify(postsMetadata, null, 2),
      'utf-8'
    )

    fs.writeFileSync(
      path.join(publicDir, 'rss.xml'),
      createRss(postsMetadata),
      'utf-8'
    )

    fs.writeFileSync(
      path.join(publicDir, 'robots.txt'),
      [
        'User-agent: *',
        'Allow: /',
        `Sitemap: ${SITE_URL}/sitemap.xml`,
        ''
      ].join('\n'),
      'utf-8'
    )

    console.log(
      `[完成] 共生成 ${postsMetadata.length} 篇文章、RSS 和 robots.txt。`
    )
  }
}

fetchIssues().catch((error) => {
  console.error('脚本执行失败：', error)
  process.exitCode = 1
})
