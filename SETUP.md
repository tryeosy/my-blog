# VitePress 博客增强包使用说明

这个增强包会增加：

- VitePress 内置本地全文搜索
- RSS 2.0 订阅
- Giscus 评论
- Sitemap、robots.txt、canonical、Open Graph、结构化数据等 SEO
- Google Analytics 4 访问统计
- 自定义域名的环境变量支持

## 一、上传文件

把压缩包中的文件按原目录上传到 `tryeosy/my-blog`：

- 替换 `.vitepress/config.js`
- 替换 `fetch-issues.js`
- 替换 `.github/workflows/deploy.yml`
- 新增 `.vitepress/theme/index.js`
- 新增 `.vitepress/theme/Layout.vue`
- 新增 `.vitepress/theme/GiscusComments.vue`
- 新增 `.vitepress/theme/custom.css`

`index.md` 不需要修改。

提交后，搜索、RSS、SEO 会立即生效。

当前 RSS 地址：

`https://tryeosy.github.io/my-blog/rss.xml`

## 二、开启 Giscus 评论

1. 在仓库 `Settings → General → Features` 中开启 Discussions。
2. 安装并授权 Giscus App 访问 `tryeosy/my-blog`。
3. 在 Giscus 配置页面选择：
   - Repository：`tryeosy/my-blog`
   - Page ↔ Discussions Mapping：`pathname`
   - Discussion Category：建议选择 `General`
4. 复制配置得到的 Repo ID 与 Category ID。
5. 进入仓库：
   `Settings → Secrets and variables → Actions → Variables`
6. 新增：

| Variable | Value |
|---|---|
| `VITE_GISCUS_REPO` | `tryeosy/my-blog` |
| `VITE_GISCUS_REPO_ID` | Giscus 生成的 Repo ID |
| `VITE_GISCUS_CATEGORY` | 选择的分类名，例如 `General` |
| `VITE_GISCUS_CATEGORY_ID` | Giscus 生成的 Category ID |

保存后手动运行一次工作流。

## 三、开启 Google Analytics 4

1. 在 Google Analytics 创建媒体资源与 Web 数据流。
2. 复制衡量 ID，格式类似 `G-XXXXXXXXXX`。
3. 在仓库 Actions Variables 中新增：

| Variable | Value |
|---|---|
| `VITE_GA_ID` | `G-XXXXXXXXXX` |

重新部署后即可统计首页和站内文章切换。

## 四、设置自定义域名

在购买域名并完成 GitHub Pages 的 DNS 配置后，在 Actions Variables 中新增：

| Variable | Value |
|---|---|
| `SITE_URL` | `https://你的域名` |
| `SITE_BASE` | `/` |

然后进入：

`Settings → Pages → Custom domain`

填写你的域名并保存，DNS 生效后启用 `Enforce HTTPS`。

未购买域名前不要添加这两个变量，代码会继续使用：

- `SITE_URL=https://tryeosy.github.io/my-blog`
- `SITE_BASE=/my-blog/`

## 五、检查结果

工作流成功后检查：

- 搜索按钮：顶部导航栏
- RSS：`/rss.xml`
- Sitemap：`/sitemap.xml`
- Robots：`/robots.txt`
- 评论：任意文章底部
- 统计：Google Analytics 实时报告
