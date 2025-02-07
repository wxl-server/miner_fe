<route lang="yaml">
meta:
  title: 工作
</route>

<script setup lang="ts">
import apiJob from '@/api/modules/job'

const currentPageType = ref<'list' | 'detail'>('list')
const jobList = {
  currentPageNum: 1,
  pageSizeArray: [10, 50, 100],
  pageSize: 10,
  tableData: [],
  pageTotal: 0,
}

onMounted(() => {
  const req = {
    pageNum: jobList.currentPageNum,
    pageSize: jobList.pageSize,
  }
  apiJob.queryJobList(req).then((res) => {
    console.warn(res.data)
    if (res.data.code !== 0 && res.data.message !== 'success') {
      console.error(res.data.code, res.data.message)
      return
    }
    jobList.pageTotal = res.data.data.total
    jobList.tableData = res.data.data.jobList
  }).finally(() => {
  })
})

function ToDetail(id: number) {
  currentPageType.value = 'detail'
  console.warn(id)
}
function handleSizeChange() {
}

function handleCurrentChange() {
}
</script>

<template>
  <div>
    <FaPageMain>
      <el-space v-if="currentPageType === 'list'" direction="vertical" alignment="normal">
        <el-table :data="jobList.tableData" style="width: 100%;height: max-content" current-row-key="id">
          <el-table-column prop="name" label="工作名" width="200" />
          <el-table-column prop="description" label="描述" width="300" />
          <el-table-column prop="createdBy" label="创建者" width="300" />
          <el-table-column prop="createdAt" label="创建时间" width="300" />
          <el-table-column prop="updatedAt" label="更新时间" width="300" />
          <el-table-column fixed="right" label="Operations" min-width="100">
            <template #default="scope">
              <el-button link type="success" size="small" @click="ToDetail(scope.row.id)">
                Detail
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-model:current-page="jobList.currentPageNum"
          v-model:page-size="jobList.pageSize"
          :page-sizes="jobList.pageSizeArray"
          size="small"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="jobList.pageTotal"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </el-space>
    </FaPageMain>
  </div>
</template>
