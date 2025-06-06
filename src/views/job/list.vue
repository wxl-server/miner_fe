<route lang="yaml">
meta:
title: 工作
</route>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import apiJob from '@/api/modules/job'
import apiUser from '@/api/modules/user'
import { ElMessage } from 'element-plus'

const jobList = {
  pageNum: 1,
  pageSizeArray: [10, 50, 100],
  pageSize: 10,
  tableData: ref([]),
  pageTotal: 0,
  orderBy: -1,
  order: -1,
  nameFilter: ref(undefined),
  createdByFilter: ref(undefined),
  createdAtFilter: ref([]),
}

function queryJobList() {
  const req = {
    page_num: jobList.pageNum,
    page_size: jobList.pageSize,
    order_by: jobList.orderBy,
    order: jobList.order,
    name: jobList.nameFilter.value === '' ? undefined : jobList.nameFilter.value,
    created_by: jobList.createdByFilter.value === null ? undefined : jobList.createdByFilter.value,
    created_at_start: jobList.createdAtFilter.value === null ? undefined : jobList.createdAtFilter.value[0],
    created_at_end: jobList.createdAtFilter.value === null ? undefined : jobList.createdAtFilter.value[1],
  }
  apiJob.queryJobList(req).then((res) => {
    if (res.data.code !== 0 && res.data.message !== 'success') {
      console.error(res.data.code, res.data.message)
      return
    }
    jobList.pageTotal = res.data.data.total
    if (res.data.data.total > 0) {
      for (let i = 0; i < res.data.data.job_list.length; i++) {
        const item = res.data.data.job_list[i]
        item.created_at = new Date(item.created_at * 1000).toLocaleString()
        item.updated_at = new Date(item.updated_at * 1000).toLocaleString()
      }
      jobList.tableData.value = res.data.data.job_list
    }
    else {
      jobList.tableData.value = []
    }
  }).finally(() => {
  })
}

const jobOwners = ref([{
  label: 'none',
  value: -1,
}])

function queryJobOwners() {
  apiUser.queryUserList().then((res) => {
    if (res.data.code !== 0 && res.data.message !== 'success') {
      console.error(res.data.code, res.data.message)
      return
    }
    jobOwners.value = []
    for (let i = 0; i < res.data.data.user_list.length; i++) {
      const item = res.data.data.user_list[i]
      jobOwners.value.push({
        label: item.email,
        value: item.id,
      })
    }
  }).finally(() => {
  })
}

onMounted(() => {
  queryJobOwners()
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
    if (data.prop === 'created_at') {
      jobList.orderBy = 5
    }
    else if (data.prop === 'updated_at') {
      jobList.orderBy = 6
    }
  }
  else {
    jobList.orderBy = -1
    jobList.order = -1
  }
  queryJobList()
}

function handleReset() {
  jobList.nameFilter.value = undefined
  jobList.createdByFilter.value = undefined
  jobList.createdAtFilter.value = []
  queryJobList()
}

function deleteJob(id: number) {
  const req = {
    id,
  }
  apiJob.deleteJob(req).then((res) => {
    if (res.data.code !== 0 && res.data.message !== 'success') {
      console.error(res.data.code, res.data.message)
      ElMessage.error('删除失败！')
    }
  }).finally(() => {
    ElMessage.success('删除成功！')
    queryJobList()
  })
}

const createJobFromVisible = ref(false)
const form = ref({
  name: '',
  description: '',
})

async function handleCreate(formEl: FormInstance | undefined) {
  if (!formEl) {
    return
  }
  await formEl.validate((valid) => {
    if (valid) {
      createJobFromVisible.value = false
      const req = {
        name: form.value.name,
        description: form.value.description,
      }
      apiJob.createJob(req).then((res) => {
        if (res.data.code !== 0 && res.data.message !== 'success') {
          console.error(res.data.code, res.data.message)
          return
        }
        toDetail(res.data.data.id)
      }).finally(() => {
        form.value.name = ''
        form.value.description = ''
        ElMessage.success('创建成功！')
      })
    }
  })
}

interface RuleForm {
  name: string
  description: string
}

const rules = ref<FormRules<RuleForm>>({
  name: [
    { required: true, message: '请输入工作名', trigger: 'blur' },
  ],
})
const ruleFormRef = ref<FormInstance>()

const router = useRouter()
function toDetail(id: number) {
  router.push({
    name: 'detail',
    query: {
      id,
    },
  })
}
</script>

<template>
  <div>
    <FaPageMain>
      <el-space style="width: 100%;" direction="vertical" alignment="normal" size="large">
        <el-row>
          <el-col :span="2">
            <el-text style="font-size: larger;font-weight: bolder;">
              工作
            </el-text>
          </el-col>
          <el-col :span="20" />
          <el-col :span="2">
            <el-button style="width: 100%;" color="#409fff" @click="createJobFromVisible = true">
              创建
            </el-button>
            <el-dialog v-model="createJobFromVisible" title="创建新工作" width="500">
              <el-form ref="ruleFormRef" :model="form" :rules="rules">
                <el-form-item label="工作名" prop="name" label-width="auto" label-position="top">
                  <el-input v-model="form.name" autocomplete="off" />
                </el-form-item>
                <el-form-item label="描述" prop="description" label-width="auto" label-position="top" size="large">
                  <el-input v-model="form.description" type="textarea" autocomplete="off" />
                </el-form-item>
              </el-form>
              <template #footer>
                <div class="dialog-footer">
                  <el-button @click="createJobFromVisible = false">
                    取消
                  </el-button>
                  <el-button type="primary" @click="handleCreate(ruleFormRef)">
                    创建
                  </el-button>
                </div>
              </template>
            </el-dialog>
          </el-col>
        </el-row>
        <el-space style="width: 100%;" fill :fill-ratio="25" direction="horizontal" alignment="normal" size="large">
          <el-space direction="vertical" alignment="normal">
            <el-text>
              工作名
            </el-text>
            <el-input
              v-model="jobList.nameFilter.value"
              placeholder="工作名"
              clearable
            />
          </el-space>
          <el-space direction="vertical" alignment="normal">
            <el-text>
              创建人
            </el-text>
            <el-select
              v-model="jobList.createdByFilter.value"
              placeholder="创建人"
              clearable
            >
              <el-option
                v-for="item in jobOwners"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-space>
          <el-space direction="vertical" alignment="normal">
            <el-text>
              创建时间
            </el-text>
            <el-date-picker
              v-model="jobList.createdAtFilter.value"
              type="datetimerange"
              range-separator="-"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
            />
          </el-space>
        </el-space>
        <el-space style="width: 100%;" direction="horizontal" alignment="normal" size="small">
          <el-button style="width: 80px;" color="#409fff" @click="queryJobList">
            查询
          </el-button>
          <el-button plain style="width: 80px;" color="#409fff" @click="handleReset">
            重置
          </el-button>
        </el-space>
        <el-space direction="horizontal" alignment="normal" />
        <el-table :data="jobList.tableData.value" height="62vh" current-row-key="id" fit @sort-change="handleSortChange">
          <el-table-column prop="name" label="工作名" />
          <el-table-column prop="description" label="描述" />
          <el-table-column prop="created_by.email" label="创建人" />
          <el-table-column prop="updated_by.email" label="修改人" />
          <el-table-column prop="created_at" label="创建时间" sortable="custom" />
          <el-table-column prop="updated_at" label="更新时间" sortable="custom" />
          <el-table-column fixed="right" label="Action">
            <template #default="scope">
              <el-button style="z-index: 1;" text size="small" @click="toDetail(scope.row.id)">
                <el-text color="#409fff" size="small">
                  详情
                </el-text>
              </el-button>
              <el-popconfirm title="确定删除?" :hide-after="1" @confirm="deleteJob(scope.row.id)">
                <template #reference>
                  <el-button style="z-index: 1;margin-left: 0;" text size="small">
                    <el-text color="#409fff" size="small">
                      删除
                    </el-text>
                  </el-button>
                </template>
              </el-popconfirm>
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
    </FaPageMain>
  </div>
</template>
