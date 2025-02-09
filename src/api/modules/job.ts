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
    headers: {
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('token'),
    },
    baseURL: '/mock/',
  }),
  // job detail
  queryJobDetail: (data: {
    id: number
  }) => api.post('job/query/detail', data, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('token'),
    },
    baseURL: '/mock/',
  }),
  // 删除job
  deleteJob: (data: {
    id: number
  }) => api.post('job/delete', data, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('token'),
    },
    baseURL: '/mock/',
  }),
  // 创建job
  createJob: (data: {
    name: string
    description?: string
  }) => api.post('job/create', data, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('token'),
    },
    baseURL: '/mock/',
  }),
}
