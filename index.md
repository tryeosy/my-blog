---
layout: home
---

<script setup>
import { ref, computed } from 'vue'
import { withBase } from 'vitepress'

// 读取 fetch-issues.js 生成的文章数据
import postsData from './.vitepress/posts-data.json'

// 当前选中的标签
const selectedTag = ref('')

// 确保文章数据一定是数组
const posts = ref(
  Array.isArray(postsData) ? postsData : []
)

// 获取全部不重复标签
const allTags = computed(() => {
  const tags = new Set()

  posts.value.forEach((post) => {
    if (post && Array.isArray(post.tags)) {
      post.tags.forEach((tag) => {
        if (tag) {
          tags.add(tag)
        }
      })
    }
  })

  return Array.from(tags)
})

// 根据选中的标签过滤文章
const filteredPosts = computed(() => {
  if (!selectedTag.value) {
    return posts.value
  }

  return posts.value.filter((post) => {
    return (
      post &&
      Array.isArray(post.tags) &&
      post.tags.includes(selectedTag.value)
    )
  })
})
</script>

<div class="blog-page">

  <h1 class="blog-heading">
    🚀 欢迎来到我的独立博客
  </h1>

  <!-- 标签筛选导航栏 -->
  <div
    v-if="allTags.length > 0"
    class="tag-container"
  >
    <button
      type="button"
      :class="{ active: selectedTag === '' }"
      @click="selectedTag = ''"
    >
      <span>全部文章</span>
    </button>

    <button
      v-for="tag in allTags"
      :key="tag"
      type="button"
      :class="{ active: selectedTag === tag }"
      @click="selectedTag = tag"
    >
      <span># {{ tag }}</span>
    </button>
  </div>

  <!-- 文章列表 -->
  <div class="post-list">

    <!-- 没有文章时的提示 -->
    <div
      v-if="filteredPosts.length === 0"
      class="no-posts"
    >
      🌟 📋 提示：你目前还没有在 GitHub Issues
      中发布任何公开文章。快去你的仓库新建一个议题（Issue），
      随便写篇博客并打个标签试试吧！
    </div>

    <!-- 单篇文章 -->
    <article
      v-for="post in filteredPosts"
      :key="post.path"
      class="post-item"
    >
      <div class="post-meta">
        <span class="post-date">
          📅 {{ post.date || '暂无日期' }}
        </span>
      </div>

      <a
        :href="withBase(post.path)"
        class="post-title"
      >
        {{ post.title || '未命名文章' }}
      </a>

      <div
        v-if="Array.isArray(post.tags) && post.tags.length > 0"
        class="post-tags"
      >
        <span
          v-for="tag in post.tags"
          :key="tag"
          class="tag-badge"
        >
          # {{ tag }}
        </span>
      </div>
    </article>

  </div>

</div>

<style>
.blog-page {
  width: 100%;
}

/* 页面标题 */
.blog-heading {
  margin: 0 0 30px;
  padding: 0;
  border: 0;
  font-size: 2.2em;
  line-height: 1.3;
  color: var(--vp-c-text-1);
}

/* 标签筛选区域 */
.tag-container {
  margin: 30px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-container button {
  padding: 6px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 20px;
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.2s ease;
}

.tag-container button:hover {
  border-color: var(--vp-c-brand-1);
}

.tag-container button.active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-1);
  color: white;
}

/* 文章列表 */
.post-list {
  margin-top: 20px;
}

/* 无文章提示 */
.no-posts {
  padding: 40px 0;
  color: var(--vp-c-text-2);
  font-style: italic;
  line-height: 1.8;
}

/* 单篇文章 */
.post-item {
  padding: 20px 0;
  border-bottom: 1px solid var(--vp-c-divider);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 日期 */
.post-meta {
  font-size: 0.85em;
  color: var(--vp-c-text-2);
}

/* 文章标题 */
.post-title {
  display: inline-block;
  width: fit-content;
  font-size: 1.3em;
  font-weight: 600;
  text-decoration: none;
  color: var(--vp-c-text-1);
  transition: color 0.2s ease;
}

.post-title:hover {
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

/* 标签 */
.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-badge {
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--vp-c-brand-3);
  color: var(--vp-c-brand-1);
  font-size: 0.8em;
}

/* 手机适配 */
@media (max-width: 640px) {
  .blog-heading {
    font-size: 1.8em;
  }

  .post-title {
    font-size: 1.15em;
  }
}
</style>
