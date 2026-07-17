import fs from 'fs';
import path from 'path';

// GitHub 用户名和仓库名
// 你的用户名从截图看是 tryeosy，不是 tryeasy
const REPO = 'tryeosy/my-blog';

// GitHub Actions 中可以自动读取 GITHUB_TOKEN
// 公开仓库即使没有 Token，通常也能正常获取 Issues
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function fetchIssues() {
  // 正确的 GitHub Issues API 地址
  const url =
    `https://api.github.com/repos/${REPO}/issues?state=open&per_page=100`;

  const headers = {
    'User-Agent': 'VitePress-Blog-Bot',
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(GITHUB_TOKEN
      ? { Authorization: `Bearer ${GITHUB_TOKEN}` }
      : {})
  };

  // 创建文章目录
  const postsDir = path.resolve('posts');
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }

  // 创建 VitePress 配置目录
  const vpDir = path.resolve('.vitepress');
  if (!fs.existsSync(vpDir)) {
    fs.mkdirSync(vpDir, { recursive: true });
  }

  // 保存所有文章的元数据
  const postsMetadata = [];

  try {
    console.log(`[开始] 正在从 ${REPO} 获取 GitHub Issues...`);
    console.log(`[接口] ${url}`);

    const res = await fetch(url, { headers });

    // GitHub API 返回非正常状态码时，主动抛出错误
    if (!res.ok) {
      const errorText = await res.text();

      throw new Error(
        `GitHub API 请求失败：${res.status} ${res.statusText}\n${errorText}`
      );
    }

    const issues = await res.json();

    if (!Array.isArray(issues)) {
      throw new Error('GitHub API 返回的数据不是 Issues 数组。');
    }

    issues.forEach((issue) => {
      // GitHub 的 Pull Request 也可能出现在 Issues API 中，需要排除
      if (issue.pull_request) {
        return;
      }

      // 提取标签
      const tags = Array.isArray(issue.labels)
        ? issue.labels
            .map((label) => {
              if (typeof label === 'string') {
                return label;
              }

              return label.name;
            })
            .filter(Boolean)
        : [];

      // 提取创建日期
      const date = issue.created_at
        ? issue.created_at.split('T')[0]
        : '';

      // 生成 Markdown 文件的 Front Matter
      const frontMatter = [
        '---',
        `title: ${JSON.stringify(issue.title || '未命名文章')}`,
        `date: ${JSON.stringify(date)}`,
        `tags: ${JSON.stringify(tags)}`,
        '---',
        ''
      ].join('\n');

      // 每一个 Issue 生成一个 Markdown 文件
      const markdownPath = path.join(
        postsDir,
        `${issue.number}.md`
      );

      fs.writeFileSync(
        markdownPath,
        `${frontMatter}\n${issue.body || ''}\n`,
        'utf-8'
      );

      // 添加到博客文章列表
      postsMetadata.push({
        title: issue.title || '未命名文章',
        path: `/posts/${issue.number}`,
        date,
        tags,
        number: issue.number
      });

      console.log(
        `[文章] 已生成 posts/${issue.number}.md：${issue.title}`
      );
    });

    // 按发布时间从新到旧排列
    postsMetadata.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    if (postsMetadata.length === 0) {
      console.warn(
        '警告：没有找到可以生成博客的公开 Issue。请确认 Issue 处于 Open 状态。'
      );
    }
  } catch (error) {
    console.error(
      '网络请求或文章生成发生错误，将使用空数据进行兜底打包：'
    );

    console.error(error);
  } finally {
    // 无论请求是否成功，都生成 posts-data.json
    // 防止 VitePress 因文件不存在而打包失败
    const metadataPath = path.join(
      vpDir,
      'posts-data.json'
    );

    fs.writeFileSync(
      metadataPath,
      JSON.stringify(postsMetadata, null, 2),
      'utf-8'
    );

    console.log(
      `[完成] 本次数据准备完毕，共包含 ${postsMetadata.length} 篇文章。`
    );

    console.log(
      `[完成] 文章索引已写入：${metadataPath}`
    );
  }
}

fetchIssues().catch((error) => {
  console.error('脚本执行失败：', error);
  process.exitCode = 1;
});
