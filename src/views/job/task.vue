<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import apiIndicator from '@/api/modules/indicator.ts'
import apiJob from '@/api/modules/job.ts'
import apiTask from '@/api/modules/task.ts'
import { Delete } from '@element-plus/icons-vue'

onMounted(() => {
  queryIndicatorList()
  queryTaskDetail()
})

const route = useRoute()
const taskID = Number(route.query.id)

const task = ref({
  id: 0,
  job_id: 0,
  name: '',
  total_records: 0,
  status: 0,
  created_by: '',
  created_at: 0,
  time_cost: 0,
  rules: [],
  logic_expression: '',
  limit: 0,
  extra: {},
})

const job = ref({
  id: 0,
  name: '',
  description: '',
  created_by: {
    email: '',
  },
  created_at: '',
})

const rules = {
  rules: ref([
    {
      id: 0,
      factor: {
        factor_code: '',
      },
      operator: {
        operator_code: '',
      },
      value_list: [],
    },
  ]),
  logic_expression: ref('1'),
  limit: ref(20000),
}

function queryTaskDetail() {
  const req = {
    id: taskID,
  }
  apiTask.queryTaskDetail(req).then((res) => {
    if (res.data.code !== 0 && res.data.message !== 'success') {
      console.error(res.data.code, res.data.message)
      return
    }
    res.data.data.created_at = new Date(res.data.data.created_at).toLocaleString()
    res.data.data.updated_at = new Date(res.data.data.updated_at).toLocaleString()
    task.value = res.data.data
    rules.rules.value = res.data.data.rules
    rules.logic_expression.value = res.data.data.logic_expression
    rules.limit.value = res.data.data.limit
  }).finally(() => {
    queryJobDetail()
    queryTaskResult()
  })
}

function queryJobDetail() {
  const req = {
    page_num: 1,
    page_size: 1,
    id: task.value.job_id,
  }
  apiJob.queryJobList(req).then((res) => {
    if (res.data.code !== 0 && res.data.message !== 'success') {
      console.error(res.data.code, res.data.message)
      return
    }
    if (res.data.data.total > 0) {
      res.data.data.created_at = new Date(res.data.data.created_at).toLocaleString()
      res.data.data.updated_at = new Date(res.data.data.updated_at).toLocaleString()
    }
    job.value = res.data.data.job_list[0]
  }).finally(() => {
  })
}

interface RuleForm {
  rules: Array<{
    id: number
    factor: {
      factor_code: string
    }
    operator: {
      operator_code: string
    }
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
      if (rule.factor.factor_code === ''
        || rule.factor.factor_code === undefined
        || rule.operator.operator_code === ''
        || rule.operator.operator_code === undefined
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
              input_el_type: allowOperator.input_el_type,
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

function handleChangeFactor(ruleID: number) {
  rules.rules.value[ruleID].operator.operator_code = ''
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
      factor: {
        factor_code: '',
      },
      operator: {
        operator_code: '',
      },
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

const productList = {
  pageNum: 1,
  pageSizeArray: [10, 50, 100],
  pageSize: 10,
  tableData: ref([]),
  pageTotal: 0,
}

function handleSizeChange(val: number) {
  productList.pageSize = val
  queryTaskResult()
}

function handleCurrentChange(val: number) {
  productList.pageNum = val
  queryTaskResult()
}

function queryTaskResult() {
  const req = {
    page_num: productList.pageNum,
    page_size: productList.pageSize,
    task_id: taskID,
  }
  apiTask.queryTaskResult(req).then((res) => {
    if (res.data.code !== 0 && res.data.message !== 'success') {
      console.error(res.data.code, res.data.message)
      return
    }
    productList.pageTotal = res.data.data.total
    productList.tableData.value = res.data.data.product_list
  }).finally(() => {
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
      <el-space style="width: 100%" direction="vertical" alignment="normal" size="large">
        <el-space style="width: 100%" direction="vertical" alignment="normal">
          <el-text style="font-size: larger;font-weight: bolder">
            Task detail
          </el-text>
          <el-space style="width: 100%" fill :fill-ratio="30" direction="horizontal" alignment="normal">
            <el-text style="font-size: xx-small;font-weight: lighter">
              Task ID：{{ task.id }}
            </el-text>
            <el-text style="font-size: xx-small;font-weight: lighter">
              运行开始时间：{{ task.created_at }}
            </el-text>
          </el-space>
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
        <el-form ref="ruleFormRef" :model="rules" :rules="formRules" label-width="auto" :disabled="true">
          <el-form-item
            v-for="rule in rules.rules.value"
            :key="rule.id"
            :label="`${rule.id + 1}`"
            prop="rules"
            style="margin-bottom: 8px"
          >
            <el-cascader v-model="rule.factor.factor_code" :options="indicators" :props="props" placeholder="选择因子" style="width: 20%" clearable :show-all-levels="false" @change="handleChangeFactor(rule.id)" />
            <el-select v-model="rule.operator.operator_code" placeholder="选择操作符" style="width: 11%; margin-left: 1%" no-data-text="请先选择因子" clearable @change="handleChangeOperator(rule.id)">
              <el-option
                v-for="item in factor2Operator.get(rule.factor.factor_code)"
                :key="item.operator_code"
                :label="item.display_name"
                :value="item.operator_code"
              />
            </el-select>
            <div
              v-if="rule.factor.factor_code === ''
                || rule.factor.factor_code === undefined
                || factor2Operator2InputType.get(rule.factor.factor_code).get(rule.operator.operator_code).input_el_type === 'Input'" style="width: 62%; margin-left: 1%"
            >
              <el-input
                v-model="rule.value_list[0]"
                style="width: 100%"
                placeholder="匹配值"
                :disabled="rule.factor.factor_code === '' || rule.factor.factor_code === undefined || rule.operator.operator_code === '' || rule.operator.operator_code === undefined"
                clearable
              />
            </div>
            <div v-else-if="factor2Operator2InputType.get(rule.factor.factor_code).get(rule.operator.operator_code).input_el_type === 'InputTag'" style="width: 62%; margin-left: 1%">
              <el-input-tag
                v-model="rule.value_list"
                style="width: 100%"
                :disabled="rule.factor.factor_code === '' || rule.factor.factor_code === undefined || rule.operator.operator_code === '' || rule.operator.operator_code === undefined"
                clearable
                placeholder="匹配值"
              />
            </div>
            <div v-else-if="factor2Operator2InputType.get(rule.factor.factor_code).get(rule.operator.operator_code).input_el_type === 'Select'" style="width: 62%; margin-left: 1%">
              <el-select v-model="rule.value_list" placeholder="匹配值" style="width: 100%" clearable multiple>
                <el-option
                  v-for="allowValue in factor2Operator2InputType.get(rule.factor.factor_code).get(rule.operator.operator_code).allow_values"
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
        </el-form>
      </el-space>
    </FaPageMain>
    <FaPageMain>
      <el-space style="width: 100%" direction="vertical" alignment="normal">
        <el-text style="font-size: medium;font-weight: bolder">
          Product List
        </el-text>
        <el-table :data="productList.tableData.value" current-row-key="id" fit>
          <el-table-column style="z-index: -1" prop="product_name" label="商品标题/id" min-width="150px">
            <template #default="scope">
              <el-space style="width: 100%" direction="horizontal">
                <el-image
                  style="width: 60px; height: 60px"
                  :src="scope.row.image_urls[0]"
                  :preview-src-list="scope.row.image_urls"
                  :preview-teleported="true"
                  hide-on-click-modal
                  fit="contain"
                />
                <el-space style="width: 100%" direction="vertical" alignment="normal">
                  <el-text style="font-size: xx-small;font-weight: bolder">
                    {{ scope.row.product_name }}
                  </el-text>
                  <el-space style="width: 100%" direction="horizontal">
                    <el-text style="font-size: xx-small;font-weight: lighter">
                      id: {{ scope.row.product_id }}
                    </el-text>
                    <el-text style="font-size: xx-small;font-weight: normal">
                      {{ scope.row.status === 1 ? '在售' : scope.row.status === 2 ? '下架' : scope.row.status === 3 ? '封禁' : '未知' }}
                    </el-text>
                  </el-space>
                </el-space>
              </el-space>
            </template>
          </el-table-column>
          <el-table-column style="z-index: -1" prop="shop_image_url" label="店铺标题/id" min-width="150px">
            <template #default="scope">
              <el-space style="width: 100%" direction="horizontal">
                <el-image
                  style="width: 60px; height: 60px"
                  :src="scope.row.shop_image_url[0]"
                  :preview-src-list="scope.row.shop_image_url"
                  :preview-teleported="true"
                  hide-on-click-modal
                  fit="contain"
                />
                <el-space style="width: 100%" direction="vertical" alignment="normal">
                  <el-text style="font-size: xx-small;font-weight: bolder">
                    {{ scope.row.shop_name }}
                  </el-text>
                  <el-text style="font-size: xx-small;font-weight: lighter">
                    id: {{ scope.row.shop_id }}
                  </el-text>
                </el-space>
              </el-space>
            </template>
          </el-table-column>
          <el-table-column style="z-index: -1" prop="brand_name" label="商品品牌/id">
            <template #default="scope">
              <el-space style="width: 100%" direction="vertical" alignment="normal">
                <el-text style="font-size: xx-small;font-weight: bolder">
                  {{ scope.row.brand_name }}
                </el-text>
                <el-space style="width: 100%" direction="horizontal">
                  <el-text style="font-size: xx-small;font-weight: lighter">
                    id: {{ scope.row.brand_id }}
                  </el-text>
                  <el-text style="font-size: xx-small;font-weight: normal">
                    是否授权: {{ scope.row.is_brand_authorized }}
                  </el-text>
                </el-space>
              </el-space>
            </template>
          </el-table-column>
          <el-table-column style="z-index: -1" prop="logo_model_brand_name" label="logo模型预测品牌">
            <template #default="scope">
              <el-space style="width: 100%" direction="vertical" alignment="normal">
                <el-text style="font-size: xx-small;font-weight: bolder">
                  {{ scope.row.logo_model_brand_name }}
                </el-text>
                <el-text style="font-size: xx-small;font-weight: lighter">
                  id: {{ scope.row.logo_model_brand_id }}
                </el-text>
              </el-space>
            </template>
          </el-table-column>
          <el-table-column style="z-index: -1" prop="image_model_brand_name" label="image模型预测品牌">
            <template #default="scope">
              <el-space style="width: 100%" direction="vertical" alignment="normal">
                <el-text style="font-size: xx-small;font-weight: bolder">
                  {{ scope.row.image_model_brand_name }}
                </el-text>
                <el-text style="font-size: xx-small;font-weight: lighter">
                  id: {{ scope.row.image_model_brand_id }}
                </el-text>
              </el-space>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-model:current-page="productList.pageNum"
          v-model:page-size="productList.pageSize"
          :page-sizes="productList.pageSizeArray"
          size="small"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="productList.pageTotal"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </el-space>
    </FaPageMain>
  </div>
</template>

<style scoped>

</style>
