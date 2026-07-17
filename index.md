---
layout: page
title: Tryeosy的一隅
titleTemplate: false
---

<script setup>
import { ref, computed } from 'vue'
import { withBase } from 'vitepress'
import postsData from './.vitepress/posts-data.json'

const selectedTag = ref('')

const posts = Array.isArray(postsData)
  ? postsData
  : []

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
</script>

<div class="blog-page">
  <div class="blog-header">
    <h1>🚀 欢迎来到我的独立博客</h1>
    <p>记录学习、技术与生活中的点滴。</p>
  </div>
  <div v-if="allTags.length > 0" class="tag-container">
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
      <span>&#35; {{ tag }}</span>
    </button>
  </div>
  <div
    v-if="filteredPosts.length === 0"
    class="no-posts"
  >
    🌟 暂时没有找到文章。请确认 GitHub Issue 处于 Open 状态，并等待 Actions 重新部署完成。
  </div>
  <div
    v-if="filteredPosts.length > 0"
    class="post-list"
  >
    <div
      v-for="post in filteredPosts"
      :key="post.path"
      class="post-item"
    >
      <div class="post-date">
        📅 {{ post.date || '暂无日期' }}
      </div>
      <a
        :href="withBase(post.path)"
        class="post-title"
      >
        {{ post.title || '未命名文章' }}
      </a>
      <div
        v-if="post.tags && post.tags.length > 0"
        class="post-tags"
      >
        <span
          v-for="tag in post.tags"
          :key="tag"
          class="tag-badge"
        >
          &#35; {{ tag }}
        </span>
      </div>
    </div>
  </div>
</div>

<style scoped>
.blog-page {
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  padding: 45px 24px 80px;
  box-sizing: border-box;
}

.blog-header {
  margin-bottom: 34px;
}

.blog-header h1 {
  margin: 0 0 12px;
  padding: 0;
  border: none;
  color: var(--vp-c-text-1);
  font-size: 38px;
  font-weight: 800;
  line-height: 1.35;
}

.blog-header p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 16px;
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
  font-weight: 700;
  line-height: 1.4;
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
