---
layout: home
---

<script setup>
import { ref, computed } from 'vue'
// 标准静态导入：因为第一步脚本有了安全兜底，这里绝对不会找不到文件了
import postsData from './.vitepress/posts-data.json'

const selectedTag = ref('')
const posts = ref(postsData || [])

// 获取所有不重复的标签
const allTags = computed(() => {
  const tags = new Set()
  posts.value.forEach(p => {
    if (p && p.tags) p.tags.forEach(t => tags.add(t))
  })
  return Array.from(tags)
})

// 根据选中的标签过滤文章
const filteredPosts = computed(() => {
  if (!selectedTag.value) return posts.value
  return posts.value.filter(p => p && p.tags && p.tags.includes(selectedTag.value))
})
</script>

# 🚀 欢迎来到我的独立博客

<!-- 标签筛选导航栏 -->
<div class="tag-container" v-if="allTags.length > 0">
  <button 
    :class="{ active: selectedTag === '' }" 
    @click="selectedTag = ''">
    全部文章
  </button>
  <button 
    v-for="tag in allTags" 
    :key="tag"
    :class="{ active: selectedTag === tag }"
    @click="selectedTag = tag">
    # {{ tag }}
  </button>
</div>

<!-- 文章列表展示 -->
<div class="post-list">
  <div v-if="filteredPosts.length === 0" class="no-posts">
    🌟 📋 提示：你目前还没有在 GitHub Issues 中发布任何公开文章。快去你的仓库新建议题（Issue），随便写篇博客并打个标签试试吧！
  </div>
  
  <div v-for="post in filteredPosts" :key="post.path" class="post-item">
    <div class="post-meta">
      <span class="post-date">📅 {{ post.date }}</span>
    </div>
    <a :href="post.path" class="post-title">{{ post.title }}</a>
    <div class="post-tags">
      <span v-for="t in post.tags" :key="t" class="tag-badge"># {{ t }}</span>
    </div>
  </div>
</div>

<style scoped>
/* 博客主页样式定制 - 完美适配白天与深色模式 */
.tag-container { margin: 30px 0; display: flex; flex-wrap: wrap; gap: 10px; }
.tag-container button { padding: 6px 16px; border-radius: 20px; border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg-mute); color: var(--vp-c-text-1); cursor: pointer; transition: all 0.2s ease; font-size: 0.9em;}
.tag-container button:hover { border-color: var(--vp-c-brand-1); }
.tag-container button.active { background: var(--vp-c-brand-1); color: white; border-color: var(--vp-c-brand-1); }
.post-list { margin-top: 20px; }
.no-posts { padding: 40px 0; color: var(--vp-c-text-2); font-style: italic; line-height: 1.6; }
.post-item { padding: 20px 0; border-bottom: 1px solid var(--vp-c-divider); display: flex; flex-direction: column; gap: 8px;}
.post-meta { font-size: 0.85em; color: var(--vp-c-text-2); }
.post-title { font-size: 1.3em; font-weight: 600; text-decoration: none; color: var(--vp-c-text-1); transition: color 0.2s;}
.post-title:hover { color: var(--vp-c-brand-1); }
.post-tags { display: flex; gap: 8px; }
.tag-badge { font-size: 0.8em; background: var(--vp-c-brand-3); color: var(--vp-c-brand-1); padding: 2px 8px; border-radius: 4px; }
</style>
