import api from '../index'

export default {
  // 登录
  queryJobList: (data: {
    page_num: number
    page_size: number
    order_by?: number
    order?: number

    name?: number
    created_by?: number
    created_at_start?: number
    created_at_end?: number
  }) => api.post('job/query/list', data, {
    baseURL: '/mock/',
  }),
}
