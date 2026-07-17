import fs from 'fs';
import path from 'path';

// 直接写死你的用户名和仓库名，绝对不会解析出错
const REPO = 'tryeasy/my-blog'; 
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function fetchIssues() {
  // 严格写死官方 API 域名，确保不包含任何大括号 {}
  const url = 'https://github.com';
  
  const headers = {
    'User-Agent': 'VitePress-Blog-Bot',
    'Accept': 'application/vnd.github+json',
    ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {})
  };
  
  try {
    const res = await fetch(url, { headers });
    const issues = await res.json();

    if (!Array.isArray(issues)) {
      console.error('抓取失败，API 返回结果不是数组:', issues);
      return;
    }

    const postsDir = path.resolve('posts');
    if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir);

    const postsMetadata = [];

    issues.forEach(issue => {
      if (issue.pull_request) return;
      const tags = issue.labels.map(l => l.name);
      const date = issue.created_at.split('T')[0]; // 修复时间格式切割
      
      const frontMatter = `---\ntitle: ${JSON.stringify(issue.title)}\ndate: ${date}\ntags: ${JSON.stringify(tags)}\n---\n`;
      fs.writeFileSync(path.join(postsDir, `${issue.number}.md`), frontMatter + issue.body);

      postsMetadata.push({ title: issue.title, path: `/posts/${issue.number}`, date, tags });
    });

    const vpDir = path.resolve('.vitepress');
    if (!fs.existsSync(vpDir)) fs.mkdirSync(vpDir);
    fs.writeFileSync(path.join(vpDir, 'posts-data.json'), JSON.stringify(postsMetadata, null, 2));
    console.log(`成功同步 ${postsMetadata.length} 篇文章！`);
  } catch (error) {
    console.error('网络请求或解析时发生致命错误:', error);
  }
}

fetchIssues();
