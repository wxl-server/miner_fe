import type { RouteRecordRaw } from 'vue-router'

function Layout() {
  return import('@/layouts/index.vue')
}

const routes: RouteRecordRaw = {
  path: '/start',
  component: Layout,
  redirect: '/start/job',
  name: 'start',
  meta: {
    title: '工作',
    breadcrumb: false,
    menu: false,
  },
  children: [
    {
      path: 'job',
      name: 'job',
      component: () => import('@/views/job/list.vue'),
      meta: {
        title: '工作',
        menu: false,
      },
      children: [
        {
          path: 'redirect',
          name: 'redirect',
          redirect: '/start/job',
          // component: () => import('@/views/job/list.vue'),
          meta: {
            title: 'redirect',
            menu: false,
          },
        },
        {
          path: 'detail',
          name: 'detail',
          component: () => import('@/views/job/detail.vue'),
          meta: {
            title: '工作详情',
            menu: false,
          },
          children: [
            {
              path: 'task',
              name: 'task',
              component: () => import('@/views/job/task.vue'),
              meta: {
                title: '运行详情',
                menu: false,
              },
            },
          ],
        },
      ],
    },
  ],
}

export default routes
