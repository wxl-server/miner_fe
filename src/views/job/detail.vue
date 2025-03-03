<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import apiIndicator from '@/api/modules/indicator'
import apiJob from '@/api/modules/job'
import apiTask from '@/api/modules/task'
import {
  Delete,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

onMounted(() => {
  queryJobDetail()
  queryIndicatorList()
  queryTaskList()
})

const route = useRoute()
const jobID = Number(route.query.id)
const job = ref({
  id: 0,
  name: '',
  description: '',
  created_by: {
    email: '',
  },
  created_at: '',
})

function queryJobDetail() {
  const req = {
    page_num: 1,
    page_size: 1,
    id: jobID,
  }
  apiJob.queryJobList(req).then((res) => {
    if (res.data.code !== 0 && res.data.message !== 'success') {
      console.error(res.data.code, res.data.message)
      return
    }
    if (res.data.data.total > 0) {
      res.data.data.job_list[0].created_at = new Date(res.data.data.job_list[0].created_at * 1000).toLocaleString()
      res.data.data.job_list[0].updated_at = new Date(res.data.data.job_list[0].updated_at * 1000).toLocaleString()
    }
    job.value = res.data.data.job_list[0]
  }).finally(() => {
  })
}

const indicators = ref()
const factor2Operator = new Map<string, Array<any>>()
const factor2Operator2InputType = new Map<string, any>()

function queryIndicatorList() {
  apiIndicator.queryIndicatorList().then((res) => {
    indicators.value = res.data.data.indicators
  }).finally(() => {
    for (let i = 0; i < indicators.value.length; i++) {
      const children = indicators.value[i].children
      for (let j = 0; j < children.length; j++) {
        const factor = children[j]
        factor2Operator.set(factor.factor_code, factor.allow_operators)
        for (let k = 0; k < factor.allow_operators.length; k++) {
          const allowOperator = factor.allow_operators[k]
          factor2Operator2InputType.set(factor.factor_code, new Map<any, any>([
            [allowOperator.operator_code, {
              input_el_type: allowOperator.input_el_type === 1 ? 'InputTag' : allowOperator.input_el_type === 2 ? 'Input' : allowOperator.input_el_type === 3 ? 'Select' : 'Input',
              allow_values: allowOperator.allow_values,
            }],
            ['', {
              input_el_type: 'Input',
            }],
            [undefined, {
              input_el_type: 'Input',
            }],
          ]))
        }
      }
    }
  })
}

const rules = {
  rules: ref([
    {
      id: 0,
      factor_code: '',
      operator_code: '',
      value_list: [],
    },
  ]),
  logic_expression: ref('1'),
  limit: ref(20000),
}

function handleChangeFactor(ruleID: number) {
  rules.rules.value[ruleID].operator_code = ''
  rules.rules.value[ruleID].value_list = []
}

function handleChangeOperator(ruleID: number) {
  rules.rules.value[ruleID].value_list = []
}

const props = {
  value: 'factor_code',
  label: 'display_name',
  expandTrigger: 'hover' as const,
  emitPath: false,
}

function addRule() {
  rules.rules.value.push(
    {
      id: rules.rules.value.length,
      factor_code: '',
      operator_code: '',
      value_list: [],
    },
  )
}

function deleteRule(ruleID: number) {
  rules.rules.value.splice(ruleID, 1)
  for (let i = 0; i < rules.rules.value.length; i++) {
    rules.rules.value[i].id = i
  }
}

function addLogicSymbol(symbol: string) {
  rules.logic_expression.value += symbol
}

function resetRules() {
  rules.rules.value = [
    {
      id: 0,
      factor_code: '',
      operator_code: '',
      value_list: [],
    },
  ]
  rules.logic_expression.value = '1'
  rules.limit.value = 20000
}

async function applyAndRun(formEl: FormInstance | undefined) {
  if (!formEl) {
    return
  }
  await formEl.validate((valid) => {
    if (valid) {
      const req = {
        job_id: jobID,
        rules: rules.rules.value.map((rule) => {
          return {
            id: rule.id,
            factor_code: rule.factor_code,
            operator_code: rule.operator_code,
            value_list: rule.value_list,
          }
        }),
        logic_expression: rules.logic_expression.value,
        limit: rules.limit.value,
      }
      apiTask.runTask(req).then((res) => {
        if (res.data.code !== 0 && res.data.message !== 'success') {
          console.error(res.data.code, res.data.message)
          ElMessage({
            message: '任务提交失败',
            type: 'error',
            duration: 1000,
            showClose: true,
          })
        }
        ElMessage({
          message: '任务提交成功，正在执行中...',
          type: 'success',
          duration: 1000,
          showClose: true,
        })
        queryTaskList()
      })
    }
  })
}

interface RuleForm {
  rules: Array<{
    id: number
    factor_code: string
    operator_code: string
    value_list: Array<string>
  }>
  logic_expression: string
  limit: number
}

const formRules = ref<FormRules<RuleForm>>({
  rules: [
    { validator: validateRules, trigger: 'blur' },
  ],
  logic_expression: [
    { validator: validateLogicExpression, trigger: 'blur' },
  ],
  limit: [
    { validator: validateLimit, trigger: 'blur' },
  ],
})
const ruleFormRef = ref<FormInstance>()
function validateRules(rule: any, value: any, callback: any) {
  const ruleList = value.value
  if (ruleList.length === 0 || rule === undefined) {
    callback(new Error('请至少提供一条规则'))
  }
  else {
    for (let i = 0; i < ruleList.length; i++) {
      const rule = ruleList[i]
      if (rule.factor_code === ''
        || rule.factor_code === undefined
        || rule.operator_code === ''
        || rule.operator_code === undefined
        || rule.value_list.length === 0) {
        callback(new Error('规则不完整'))
        return
      }
    }
    callback()
  }
}
function validateLogicExpression(rule: any, value: any, callback: any) {
  const logicExpression = value.value
  if (logicExpression === '' || rule === undefined) {
    callback(new Error('请填写逻辑表达式'))
  }
  else {
    const stack: string[] = []
    for (const char of logicExpression) {
      if (char === '(') {
        stack.push(char)
      }
      else if (char === ')') {
        if (stack.length === 0 || stack.pop() !== '(') {
          callback(new Error('逻辑表达式括号不匹配'))
          return
        }
      }
    }
    if (stack.length !== 0) {
      callback(new Error('逻辑表达式括号不匹配'))
      return
    }
    const ruleIDs = []
    for (let i = 0; i < rules.rules.value.length; i++) {
      ruleIDs.push(rules.rules.value[i].id)
    }
    const regex = /\d+|\D/g
    let match = regex.exec(logicExpression)
    while (match !== null) {
      if (match[0] === '&' || match[0] === '|' || match[0] === '!' || match[0] === '(' || match[0] === ')') {
        match = regex.exec(logicExpression)
        if (match === null) {
          callback(new Error('逻辑表达式非法'))
          return
        }
        continue
      }
      const num = Number.parseInt(match[0], 10)
      if (!ruleIDs.includes(num - 1)) {
        callback(new Error('逻辑表达式非法'))
        return
      }
      match = regex.exec(logicExpression)
    }
    callback()
  }
}
function validateLimit(rule: any, value: any, callback: any) {
  if (value.value <= 0 || rule === undefined) {
    callback(new Error('数量限制需为正整数'))
    return
  }
  callback()
}

const taskList = {
  pageNum: 1,
  pageSizeArray: [10, 50, 100],
  pageSize: 10,
  tableData: ref([]),
  pageTotal: 0,
}

function handleSizeChange(val: number) {
  taskList.pageSize = val
  queryTaskList()
}

function handleCurrentChange(val: number) {
  taskList.pageNum = val
  queryTaskList()
}
function queryTaskList() {
  const req = {
    page_num: taskList.pageNum,
    page_size: taskList.pageSize,
    job_id: jobID,
  }
  apiTask.queryTaskList(req).then((res) => {
    if (res.data.code !== 0 && res.data.message !== 'success') {
      console.error(res.data.code, res.data.message)
      return
    }
    taskList.pageTotal = res.data.data.total
    for (let i = 0; i < res.data.data.task_list.length; i++) {
      const item = res.data.data.task_list[i]
      item.created_at = new Date(item.created_at * 1000).toLocaleString()
      item.time_cost = `${item.time_cost}s`
      item.status = item.status === 1 ? '运行中' : item.status === 2 ? '成功' : item.status === 3 ? '失败' : '未知'
    }
    console.warn(res.data.data.task_list)
    taskList.tableData.value = res.data.data.task_list

    if (res.data.data.task_list.length > 0) {
      rules.rules.value = res.data.data.task_list[0].rules
      rules.logic_expression.value = res.data.data.task_list[0].logic_expression
      rules.limit.value = res.data.data.task_list[0].limit
    }
  }).finally(() => {
  })
}
const router = useRouter()
function toDetail(id: number) {
  router.push({
    name: 'task',
    query: {
      id,
    },
  })
}
</script>

<template>
  <div>
    <FaPageMain>
      <el-space style="width: 100%" direction="vertical" alignment="normal" size="large">
        <el-space style="width: 100%" direction="vertical" alignment="normal">
          <el-text style="font-size: larger;font-weight: bolder">
            {{ job.name }}
          </el-text>
          <el-space style="width: 100%" fill :fill-ratio="30" direction="horizontal" alignment="normal">
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
      </el-space>
    </FaPageMain>
    <FaPageMain>
      <el-space style="width: 100%" direction="vertical" alignment="normal">
        <div>
          <el-text style="font-size: xx-small;font-weight: bolder">
            id
          </el-text>
          <el-text style="font-size: xx-small;font-weight: bolder; margin-left: 9.5%">
            factor
          </el-text>
          <el-text style="font-size: xx-small;font-weight: bolder; margin-left: 13%">
            operator
          </el-text>
          <el-text style="font-size: xx-small;font-weight: bolder; margin-left: 35%">
            value
          </el-text>
          <el-text style="font-size: xx-small;font-weight: bolder; margin-left: 30.2%">
            action
          </el-text>
        </div>
        <el-form ref="ruleFormRef" :model="rules" :rules="formRules" label-width="auto">
          <el-form-item
            v-for="rule in rules.rules.value"
            :key="rule.id"
            :label="`${rule.id + 1}`"
            prop="rules"
            style="margin-bottom: 8px"
          >
            <el-cascader v-model="rule.factor_code" :options="indicators" :props="props" placeholder="选择因子" style="width: 20%" clearable :show-all-levels="false" @change="handleChangeFactor(rule.id)" />
            <el-select v-model="rule.operator_code" placeholder="选择操作符" style="width: 11%; margin-left: 1%" no-data-text="请先选择因子" clearable @change="handleChangeOperator(rule.id)">
              <el-option
                v-for="item in factor2Operator.get(rule.factor_code)"
                :key="item.operator_code"
                :label="item.display_name"
                :value="item.operator_code"
              />
            </el-select>
            <div
              v-if="rule.factor_code === ''
                || rule.factor_code === undefined
                || factor2Operator2InputType.get(rule.factor_code).get(rule.operator_code).input_el_type === 'Input'" style="width: 62%; margin-left: 1%"
            >
              <el-input
                v-model="rule.value_list[0]"
                style="width: 100%"
                placeholder="匹配值"
                :disabled="rule.factor_code === '' || rule.factor_code === undefined || rule.operator_code === '' || rule.operator_code === undefined"
                clearable
              />
            </div>
            <div v-else-if="factor2Operator2InputType.get(rule.factor_code).get(rule.operator_code).input_el_type === 'InputTag'" style="width: 62%; margin-left: 1%">
              <el-input-tag
                v-model="rule.value_list"
                style="width: 100%"
                :disabled="rule.factor_code === '' || rule.factor_code === undefined || rule.operator_code === '' || rule.operator_code === undefined"
                clearable
                placeholder="匹配值"
              />
            </div>
            <div v-else-if="factor2Operator2InputType.get(rule.factor_code).get(rule.operator_code).input_el_type === 'Select'" style="width: 62%; margin-left: 1%">
              <el-select v-model="rule.value_list" placeholder="匹配值" style="width: 100%" clearable multiple>
                <el-option
                  v-for="allowValue in factor2Operator2InputType.get(rule.factor_code).get(rule.operator_code).allow_values"
                  :key="allowValue.value"
                  :label="allowValue.display_name"
                  :value="allowValue.value"
                />
              </el-select>
            </div>
            <el-button style="margin-left: 2.25%" size="small" type="danger" :icon="Delete" circle plain @click="deleteRule(rule.id)" />
          </el-form-item>
          <div style="width: 100%;margin-bottom: 8px">
            <el-button
              style="color: #409EFF"
              text
              size="small"
              @click="addRule"
            >
              + add rule
            </el-button>
          </div>
          <div style="width: 100%;margin-bottom: 8px">
            <el-text style="font-size: xx-small;font-weight: bolder">
              Logic expression
            </el-text>
          </div>
          <div style="width: 100%;margin-bottom: 8px">
            <el-form-item
              prop="logic_expression"
              style="margin-bottom: 8px"
            >
              <el-input
                v-model="rules.logic_expression.value"
                style="width: 80%"
                placeholder="logic expression"
                clearable
              />
              <el-button-group style="width: 19%;margin-left: 1%">
                <el-button style="color: #409EFF" @click="addLogicSymbol('&')">
                  &(AND)
                </el-button>
                <el-button style="color: #409EFF" @click="addLogicSymbol('|')">
                  |(OR)
                </el-button>
                <el-button style="color: #409EFF" @click="addLogicSymbol('!')">
                  !(NOT)
                </el-button>
                <el-button style="color: #409EFF" @click="addLogicSymbol('(')">
                  (
                </el-button>
                <el-button style="color: #409EFF" @click="addLogicSymbol(')')">
                  )
                </el-button>
              </el-button-group>
            </el-form-item>
          </div>
          <div style="width: 100%;margin-bottom: 8px">
            <el-text style="font-size: xx-small;font-weight: bolder">
              Result retrieve limit
            </el-text>
          </div>
          <div style="width: 100%;margin-bottom: 8px">
            <el-form-item
              prop="limit"
              style="margin-bottom: 8px"
            >
              <el-input
                v-model="rules.limit.value"
                style="width: 12%"
                placeholder="default limit 20000"
                clearable
              />
            </el-form-item>
          </div>
          <div style="margin-left: 88.5%">
            <el-popconfirm title="确定重置？" :hide-after="1" @confirm="resetRules">
              <template #reference>
                <el-button color="#409EFF" plain>
                  重置
                </el-button>
              </template>
            </el-popconfirm>
            <el-button color="#409EFF" @click="applyAndRun(ruleFormRef)">
              提交&运行
            </el-button>
          </div>
        </el-form>
      </el-space>
    </FaPageMain>
    <FaPageMain>
      <el-space style="width: 100%" direction="vertical" alignment="normal">
        <el-text style="font-size: medium;font-weight: bolder">
          运行结果
        </el-text>
        <el-table :data="taskList.tableData.value" height="53vh" current-row-key="id" fit>
          <el-table-column prop="name" label="任务名/id">
            <template #default="scope">
              <el-space style="width: 100%" direction="vertical" alignment="normal">
                <el-text style="font-size: xx-small;font-weight: bolder">
                  {{ scope.row.name }}
                </el-text>
                <el-text style="font-size: xx-small;font-weight: lighter">
                  id: {{ scope.row.id }}
                </el-text>
              </el-space>
            </template>
          </el-table-column>
          <el-table-column prop="total_records" label="结果数量">
            <template #default="scope">
              <el-text>
                {{ scope.row.status === '运行中' ? '-' : scope.row.total_records }}
              </el-text>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态">
            <template #default="scope">
              <el-text :type="scope.row.status === '运行中' ? 'warning' : scope.row.status === '成功' ? 'success' : scope.row.status === '失败' ? 'danger' : 'primary'">
                {{ scope.row.status }}
              </el-text>
            </template>
          </el-table-column>
          <el-table-column prop="created_by.email" label="创建人" />
          <el-table-column prop="created_at" label="创建时间" />
          <el-table-column prop="time_cost" label="用时">
            <template #default="scope">
              <el-text>
                {{ scope.row.status === '运行中' ? '-' : scope.row.time_cost }}
              </el-text>
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="Action">
            <template #default="scope">
              <el-button style="z-index: 1" text size="small" @click="toDetail(scope.row.id)">
                <el-text color="#409fff" size="small">
                  详情
                </el-text>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-model:current-page="taskList.pageNum"
          v-model:page-size="taskList.pageSize"
          :page-sizes="taskList.pageSizeArray"
          size="small"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="taskList.pageTotal"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </el-space>
    </FaPageMain>
  </div>
</template>

<style scoped>
</style>
