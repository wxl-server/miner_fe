<route lang="yaml">
meta:
  title: 工作
</route>

<script setup lang="ts">
import Detail from '@/views/job/detail.vue'
import List from '@/views/job/list.vue'

const currentPageType = ref<'list' | 'detail'>('list')

function toDetail(id: number) {
  currentPageType.value = 'detail'
  console.warn(id)
}
</script>

<template>
  <div>
    <FaPageMain>
      <List v-if="currentPageType === 'list'" @to-detail="toDetail" />
      <Detail v-if="currentPageType === 'detail'" />
    </FaPageMain>
  </div>
</template>
