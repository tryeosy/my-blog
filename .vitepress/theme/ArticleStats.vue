<script setup>
import {
  computed,
  onMounted,
  ref,
  watch
} from 'vue'
import { useData } from 'vitepress'

const { page, frontmatter } = useData()

const API_BASE = (
  import.meta.env.VITE_STATS_API_URL || ''
).replace(/\/+$/, '')

const views = ref(0)
const likes = ref(0)
const loading = ref(true)
const liking = ref(false)
const liked = ref(false)
const failed = ref(false)

const articleKey = computed(() => {
  const issueNumber = frontmatter.value.issueNumber

  if (issueNumber) {
    return `github-issue-${issueNumber}`
  }

  return page.value.relativePath
    .replace(/\.md$/, '')
    .replace(/[^a-zA-Z0-9:_./-]/g, '-')
})

async function apiRequest(path, options = {}) {
  const response = await fetch(
    `${API_BASE}${path}`,
    {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.error || '统计接口请求失败'
    )
  }

  return data
}

function todayString() {
  const now = new Date()

  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')
  ].join('-')
}

async function loadStats() {
  if (!API_BASE) {
    loading.value = false
    return
  }

  loading.value = true
  failed.value = false

  const key = articleKey.value

  liked.value =
    localStorage.getItem(
      `my-blog-liked:${key}`
    ) === '1'

  // 同一浏览器对同一篇文章每天只增加一次阅读量
  const viewedStorageKey =
    `my-blog-viewed:${key}:${todayString()}`

  try {
    let data

    if (
      localStorage.getItem(viewedStorageKey) !== '1'
    ) {
      data = await apiRequest('/api/views', {
        method: 'POST',
        body: JSON.stringify({
          articleKey: key
        })
      })

      localStorage.setItem(
        viewedStorageKey,
        '1'
      )
    } else {
      data = await apiRequest(
        `/api/stats?article=${encodeURIComponent(key)}`
      )
    }

    views.value = Number(data.views || 0)
    likes.value = Number(data.likes || 0)
  } catch (error) {
    console.error(error)
    failed.value = true
  } finally {
    loading.value = false
  }
}

async function addLike() {
  if (
    !API_BASE ||
    liked.value ||
    liking.value
  ) {
    return
  }

  liking.value = true

  try {
    const data = await apiRequest(
      '/api/likes',
      {
        method: 'POST',
        body: JSON.stringify({
          articleKey: articleKey.value
        })
      }
    )

    likes.value = Number(data.likes || 0)
    views.value = Number(data.views || 0)
    liked.value = true

    localStorage.setItem(
      `my-blog-liked:${articleKey.value}`,
      '1'
    )
  } catch (error) {
    console.error(error)
    failed.value = true
  } finally {
    liking.value = false
  }
}

onMounted(loadStats)

watch(articleKey, () => {
  loadStats()
})
</script>

<template>
  <div
    v-if="API_BASE"
    class="article-stats"
    aria-label="文章访问统计"
  >
    <span v-if="loading">
      正在读取统计……
    </span>

    <template v-else-if="!failed">
      <span>
        👁 阅读 {{ views }}
      </span>

      <span class="article-stats-divider">
        ·
      </span>

      <button
        type="button"
        class="article-like-button"
        :class="{ liked }"
        :disabled="liked || liking"
        :aria-pressed="liked"
        @click="addLike"
      >
        {{ liked ? '♥ 已点赞' : '♡ 点赞' }}
        {{ likes }}
      </button>
    </template>

    <span
      v-else
      class="article-stats-error"
    >
      暂时无法读取统计
    </span>
  </div>
</template>
