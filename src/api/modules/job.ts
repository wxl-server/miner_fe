import api from '../index'

export default {
  // job list
  queryJobList: (data: {
    page_num: number
    page_size: number
    order_by?: number
    order?: number

    name?: string
    created_by?: string
    created_at_start?: number
    created_at_end?: number
  }) => api.post('job/query/list', data, {
    baseURL: '/mock/',
  }),
  // job detail
  queryJobDetail: (data: {
    id: number
  }) => api.post('job/query/detail', data, {
    baseURL: '/mock/',
  }),
  // 删除job
  deleteJob: (data: {
    id: number
  }) => api.post('job/delete', data, {
    baseURL: '/mock/',
  }),
  // 创建job
  createJob: (data: {
    name: string
    description?: string
  }) => api.post('job/create', data, {
    baseURL: '/mock/',
  }),
}
