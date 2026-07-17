import fs from 'fs';
import path from 'path';

const REPO = 'tryeasy/my-blog';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function fetchIssues() {
  const url = `https://github.com{REPO}/issues?state=open&per_page=100`;
  const headers = {
    'User-Agent': 'VitePress-Blog-Bot',
    ...(GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {})
  };

  const res = await fetch(url, { headers });
  const issues = await res.json();

  if (!Array.isArray(issues)) return console.error('抓取失败:', issues);

  const postsDir = path.resolve('posts');
  if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir);

  const postsMetadata = [];

  issues.forEach(issue => {
    if (issue.pull_request) return;
    const tags = issue.labels.map(l => l.name);
    const date = issue.created_at.split('T')[0];

    const frontMatter = `---\ntitle: ${JSON.stringify(issue.title)}\ndate: ${date}\ntags: ${JSON.stringify(tags)}\n---\n`;
    fs.writeFileSync(path.join(postsDir, `${issue.number}.md`), frontMatter + issue.body);

    postsMetadata.push({ title: issue.title, path: `/posts/${issue.number}`, date, tags });
  });

  const vpDir = path.resolve('.vitepress');
  if (!fs.existsSync(vpDir)) fs.mkdirSync(vpDir);
  fs.writeFileSync(path.join(vpDir, 'posts-data.json'), JSON.stringify(postsMetadata, null, 2));
  console.log(`成功同步 ${postsMetadata.length} 篇文章！`);
}

fetchIssues();
