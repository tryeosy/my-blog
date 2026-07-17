import fs from 'fs';
import path from 'path';

// 直接写死你的用户名和仓库名
const REPO = 'tryeasy/my-blog'; 
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function fetchIssues() {
  const url = 'https://github.com';
  
  const headers = {
    'User-Agent': 'VitePress-Blog-Bot',
    'Accept': 'application/vnd.github+json',
    ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {})
  };
  
  // 【超级防护 1】：无论请求成功还是失败，在最开始就强行把基础目录建立好
  const postsDir = path.resolve('posts');
  if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir);
  
  const vpDir = path.resolve('.vitepress');
  if (!fs.existsSync(vpDir)) fs.mkdirSync(vpDir);

  const postsMetadata = [];

  try {
    const res = await fetch(url, { headers });
    const issues = await res.json();

    if (Array.isArray(issues)) {
      issues.forEach(issue => {
        if (issue.pull_request) return;
        const tags = issue.labels ? issue.labels.map(l => l.name) : [];
        const date = issue.created_at ? issue.created_at.split('T')[0] : '';
        
        const frontMatter = `---\ntitle: ${JSON.stringify(issue.title)}\ndate: "${date}"\ntags: ${JSON.stringify(tags)}\n---\n`;
        fs.writeFileSync(path.join(postsDir, `${issue.number}.md`), frontMatter + (issue.body || ''));

        postsMetadata.push({ title: issue.title, path: `/posts/${issue.number}`, date, tags });
      });
    } else {
      console.warn('警告：未能从 GitHub 接口抓取到数组格式的数据，可能目前没有公开的 Issues。');
    }
  } catch (error) {
    console.error('网络请求捕获到错误，将使用空数据进行兜底打包:', error);
  } finally {
    // 【超级防护 2】：终极兜底！无论如何都强行写入一个合法的 JSON 文件（哪怕里面是空的 []）
    // 这样前端编译打包时就绝对不会因为“找不到文件”而崩溃报错了！
    fs.writeFileSync(path.join(vpDir, 'posts-data.json'), JSON.stringify(postsMetadata, null, 2));
    console.log(`[完成] 本次打包基础数据准备完毕，共包含 ${postsMetadata.length} 篇文章。`);
  }
}

fetchIssues();
