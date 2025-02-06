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
    title: 'job',
    icon: '/src/assets/icons/job.svg',
  },
  children: [
    {
      path: 'job',
      name: 'job',
      component: () => import('@/views/job/page.vue'),
      meta: {
        title: 'job',
        menu: false,
        breadcrumb: false,
      },
    },
  ],
}

export default routes
