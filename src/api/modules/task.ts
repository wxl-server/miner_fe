import api from '../index'

export default {
  // 提交task
  applyAndRunTask: (data: {
    job_id: number
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
  }) => api.post('task/apply_and_run', data, {
    baseURL: '/mock/',
  }),
  // task list
  queryTaskList: (data: {
    page_num: number
    page_size: number
    job_id?: number
  }) => api.post('task/query/list', data, {
    baseURL: '/mock/',
  }),
}
