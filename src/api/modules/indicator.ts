import api from '../index'

export default {
  // indicator list
  queryIndicatorList: () => api.get('indicator/query/list', {
    baseURL: '/mock/',
  }),
}
