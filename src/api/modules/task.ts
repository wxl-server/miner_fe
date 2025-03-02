import api from '../index'

export default {
  // 提交task
  runTask: (data: {
    job_id: number
    rules: Array<{
      id: number
      factor_code: string
      operator_code: string
      value_list: Array<string>
    }>
    logic_expression: string
    limit: number
  }) => api.post('task/run', data, {
    // baseURL: '/mock/',
  }),
  // task list
  queryTaskList: (data: {
    page_num: number
    page_size: number
    job_id: number
  }) => api.post('task/query/list', data, {
    baseURL: '/mock/',
  }),
  // job detail
  queryTaskDetail: (data: {
    id: number
  }) => api.post('task/query/detail', data, {
    baseURL: '/mock/',
  }),
  // task result
  queryTaskResult: (data: {
    page_num: number
    page_size: number
    task_id: number
  }) => api.post('task/query/result', data, {
    baseURL: '/mock/',
  }),
}
