<script setup lang="ts">
import apiJob from '@/api/modules/job'

const props = defineProps({
  id: Number,
})

const jobID = props.id
console.warn(props)
const job = ref({
  id: 0,
  name: '',
  description: '',
  created_by: {
    email: '',
  },
  created_at: '',
})

onMounted(() => {
  const req = {
    id: jobID,
  }
  apiJob.queryJobDetail(req).then((res) => {
    if (res.data.code !== 0 && res.data.message !== 'success') {
      console.error(res.data.code, res.data.message)
      return
    }
    res.data.data.created_at = new Date(res.data.data.created_at).toLocaleString()
    res.data.data.updated_at = new Date(res.data.data.updated_at).toLocaleString()
    job.value = res.data.data
  }).finally(() => {
  })
})
</script>

<template>
  <div>
    <FaPageMain>
      <el-space style="width: 100%" direction="vertical" alignment="normal" size="large">
        <el-space style="width: 100%" direction="vertical" alignment="normal">
          <el-text style="font-size: larger;font-weight: bolder">
            {{ job.name }}
          </el-text>
          <el-space style="width: 100%" direction="horizontal" alignment="normal">
            <el-text style="font-size: xx-small;font-weight: lighter">
              工作ID：{{ job.id }}
            </el-text>
            <el-text style="font-size: xx-small;font-weight: lighter">
              创建人：{{ job.created_by.email }}
            </el-text>
            <el-text style="font-size: xx-small;font-weight: lighter">
              创建时间：{{ job.created_at }}
            </el-text>
          </el-space>
          <el-text style="font-size: xx-small;font-weight: lighter">
            描述：{{ job.description }}
          </el-text>
        </el-space>
        <el-space style="width: 100%" direction="vertical" alignment="normal">
          <el-text style="font-size: medium">
            规则
          </el-text>

        </el-space>
      </el-space>
    </FaPageMain>
  </div>
</template>

<style scoped>

</style>
