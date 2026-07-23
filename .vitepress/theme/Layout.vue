<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

import ArticleStats from './ArticleStats.vue'
import GiscusComments from './GiscusComments.vue'

const { Layout } = DefaultTheme
const { page } = useData()

const isPostPage = computed(() => {
  return page.value.relativePath.startsWith('posts/')
})
</script>

<template>
  <Layout>
    <template #doc-before>
      <ClientOnly>
        <ArticleStats v-if="isPostPage" />
      </ClientOnly>
    </template>

    <template #doc-after>
      <ClientOnly>
        <GiscusComments v-if="isPostPage" />
      </ClientOnly>
    </template>
  </Layout>
</template>
