import api from '../index'

export default {
  // 登录
  login: (data: {
    email: string
    password: string
  }) => api.post('user/login', data, {
    // baseURL: '/mock/',
  }),
  // 注册
  signUp: (data: {
    email: string
    password: string
  }) => api.post('user/signup', data, {
    // baseURL: '/mock/',
  }),
  // user list
  queryUserList: () => api.get('user/query/list', {
    // baseURL: '/mock/',
  }),

  // 获取权限
  permission: () => api.get('user/permission', {
    baseURL: '/mock/',
  }),

  // 修改密码
  passwordEdit: (data: {
    password: string
    newPassword: string
  }) => api.post('user/password/edit', data, {
    baseURL: '/mock/',
  }),
}
