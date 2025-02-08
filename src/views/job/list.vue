<route lang="yaml">
meta:
title: 工作
</route>

<script setup lang="ts">
import apiJob from '@/api/modules/job'

defineEmits<{
  toDetail?: (id: number) => void
}>()

const jobList = {
  pageNum: 1,
  pageSizeArray: [10, 50, 100],
  pageSize: 10,
  tableData: ref([]),
  pageTotal: 0,
  orderBy: undefined,
  order: undefined,
  nameFilter: ref(undefined),
  createdByFilter: ref(undefined),
  createdAtFilter: ref([undefined, undefined]),
}

function queryJobList() {
  const req = {
    page_num: jobList.pageNum,
    page_size: jobList.pageSize,
    order_by: jobList.orderBy,
    order: jobList.order,
    name: jobList.nameFilter.value === '' ? undefined : jobList.nameFilter.value,
    created_by: jobList.createdByFilter.value === '' ? undefined : jobList.createdByFilter.value,
    created_at_start: jobList.createdAtFilter.value === null ? undefined : jobList.createdAtFilter.value[0],
    created_at_end: jobList.createdAtFilter.value === null ? undefined : jobList.createdAtFilter.value[1],
  }
  apiJob.queryJobList(req).then((res) => {
    if (res.data.code !== 0 && res.data.message !== 'success') {
      console.error(res.data.code, res.data.message)
      return
    }
    jobList.pageTotal = res.data.data.total
    res.data.data.job_list.forEach((item) => {
      item.created_at = new Date(item.created_at).toLocaleString()
      item.updated_at = new Date(item.updated_at).toLocaleString()
    })
    jobList.tableData.value = res.data.data.job_list
  }).finally(() => {
  })
}

onMounted(() => {
  queryJobList()
})

function handleSizeChange(val: number) {
  jobList.pageSize = val
  queryJobList()
}

function handleCurrentChange(val: number) {
  jobList.pageNum = val
  queryJobList()
}

function handleSortChange(data: { column: any, prop: string, order: any }) {
  if (data.order !== null) {
    jobList.order = data.order === 'ascending' ? 1 : 0
    if (data.prop === 'createdAt') {
      jobList.orderBy = 5
    }
    else if (data.prop === 'updatedAt') {
      jobList.orderBy = 6
    }
  }
  else {
    jobList.orderBy = undefined
    jobList.order = undefined
  }
  queryJobList()
}
</script>

<template>
  <el-space style="width: 100%" direction="vertical" alignment="normal">
    <el-space direction="horizontal" alignment="normal" size="large">
      <el-space direction="vertical" alignment="normal">
        <el-text>
          工作名
        </el-text>
        <el-input
          v-model="jobList.nameFilter.value"
          style="width: 20vw"
          placeholder="工作名"
          clearable
        />
      </el-space>
      <el-space direction="vertical" alignment="normal">
        <el-text>
          创建者
        </el-text>
        <el-input
          v-model="jobList.createdByFilter.value"
          style="width: 20vw"
          placeholder="创建者"
          clearable
        />
      </el-space>
      <el-space direction="vertical" alignment="normal">
        <el-text>
          创建时间
        </el-text>
        <el-date-picker
          v-model="jobList.createdAtFilter.value"
          style="width: 25vw"
          type="datetimerange"
          range-separator="-"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
        />
      </el-space>
    </el-space>
    <el-table :data="jobList.tableData.value" height="81vh" current-row-key="id" fit @sort-change="handleSortChange">
      <el-table-column prop="name" label="工作名" />
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="created_by.email" label="创建者" />
      <el-table-column prop="created_at" label="创建时间" sortable="custom" />
      <el-table-column prop="updated_at" label="更新时间" sortable="custom" />
      <el-table-column fixed="right" label="Operations">
        <template #default="scope">
          <el-button link type="success" size="small" @click="$emit('toDetail', scope.row.id)">
            Detail
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-model:current-page="jobList.pageNum"
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
</template>
