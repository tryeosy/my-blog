<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'
import Giscus from '@giscus/vue'

const { isDark } = useData()

const repo =
  import.meta.env.VITE_GISCUS_REPO ||
  'tryeosy/my-blog'

const repoId =
  import.meta.env.VITE_GISCUS_REPO_ID ||
  ''

const category =
  import.meta.env.VITE_GISCUS_CATEGORY ||
  'General'

const categoryId =
  import.meta.env.VITE_GISCUS_CATEGORY_ID ||
  ''

const enabled = computed(() => {
  return Boolean(repo && repoId && category && categoryId)
})
</script>

<template>
  <section class="blog-comments">
    <h2>评论</h2>

    <Giscus
      v-if="enabled"
      id="comments"
      :repo="repo"
      :repo-id="repoId"
      :category="category"
      :category-id="categoryId"
      mapping="pathname"
      strict="0"
      reactions-enabled="1"
      emit-metadata="0"
      input-position="top"
      :theme="isDark ? 'dark_dimmed' : 'light'"
      lang="zh-CN"
      loading="lazy"
    />

    <p v-else class="comments-not-configured">
      评论组件已经安装，配置 Giscus 的仓库变量后会自动显示。
    </p>
  </section>
</template>
