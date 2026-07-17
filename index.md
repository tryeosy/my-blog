---
layout: page
---

<script setup>
import { ref, computed } from 'vue'
import { withBase } from 'vitepress'
import postsData from './.vitepress/posts-data.json'

// 当前选中的标签
const selectedTag = ref('')

// 确保文章数据是数组
const posts = Array.isArray(postsData) ? postsData : []

// 获取全部不重复标签
const allTags = computed(() => {
  const tags = new Set()

  posts.forEach((post) => {
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

// 按标签筛选文章
const filteredPosts = computed(() => {
  if (!selectedTag.value) {
    return posts
  }

  return posts.filter((post) => {
    return (
      post &&
      Array.isArray(post.tags) &&
      post.tags.includes(selectedTag.value)
    )
  })
})

// 生成适用于 GitHub Pages 的文章地址
const getPostLink = (postPath) => {
  if (!postPath) {
    return withBase('/')
  }

  const path = postPath.endsWith('.html')
    ? postPath
    : `${postPath}.html`

  return withBase(path)
}
</script>

<main class="blog-page">

  <section class="blog-header">
    <h1>🚀 欢迎来到我的独立博客</h1>
    <p>记录学习、技术与生活中的点滴。</p>
  </section>

  <!-- 标签筛选 -->
  <nav
    v-if="allTags.length > 0"
    class="tag-container"
    aria-label="文章标签筛选"
  >
    <button
      type="button"
      :class="{ active: selectedTag === '' }"
      @click="selectedTag = ''"
    >
      全部文章
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
  </nav>

  <!-- 没有文章 -->
  <div
    v-if="filteredPosts.length === 0"
    class="no-posts"
  >
    🌟 暂时没有找到文章。请确认 GitHub Issue 处于 Open 状态，
    并等待 Actions 重新部署完成。
  </div>

  <!-- 文章列表 -->
  <section
    v-else
    class="post-list"
  >
    <article
      v-for="post in filteredPosts"
      :key="post.path"
      class="post-item"
    >
      <div class="post-date">
        📅 {{ post.date || '暂无日期' }}
      </div>

      <a
        :href="getPostLink(post.path)"
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
  </section>

</main>

<style>
.blog-page {
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  padding: 45px 24px 80px;
  box-sizing: border-box;
}

.blog-header {
  margin-bottom: 36px;
}

.blog-header h1 {
  margin: 0 0 12px;
  padding: 0;
  border: none;
  font-size: 38px;
  line-height: 1.35;
  font-weight: 800;
  color: var(--vp-c-text-1);
}

.blog-header p {
  margin: 0;
  font-size: 16px;
  color: var(--vp-c-text-2);
}

.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 28px 0 32px;
}

.tag-container button {
  padding: 7px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 20px;
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
  cursor: pointer;
  font-size: 14px;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease;
}

.tag-container button:hover {
  border-color: var(--vp-c-brand-1);
}

.tag-container button.active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-1);
  color: white;
}

.post-list {
  width: 100%;
}

.post-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 24px 0 28px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.post-date {
  color: var(--vp-c-text-2);
  font-size: 15px;
}

.post-title {
  display: inline-block;
  width: fit-content;
  color: var(--vp-c-text-1);
  font-size: 27px;
  line-height: 1.4;
  font-weight: 700;
  text-decoration: none;
  transition: color 0.2s ease;
}

.post-title:hover {
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-badge {
  padding: 5px 10px;
  border-radius: 5px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-size: 14px;
}

.no-posts {
  margin-top: 25px;
  padding: 30px 0;
  color: var(--vp-c-text-2);
  font-style: italic;
  line-height: 1.8;
}

@media (max-width: 640px) {
  .blog-page {
    padding: 30px 20px 60px;
  }

  .blog-header h1 {
    font-size: 30px;
  }

  .post-title {
    font-size: 23px;
  }
}
</style>
