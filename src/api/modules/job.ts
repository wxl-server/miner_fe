import api from '../index'

export default {
  // 登录
  queryJobList: (data: {
    pageNum: number
    pageSize: number
    orderBy?: number
    order?: number

    id?: number
    createdBy?: number
    createdAtStart?: number
    createdAtEnd?: number
  }) => api.post('job/query/list', data, {
    baseURL: '/mock/',
  }),
}
