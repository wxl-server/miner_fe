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
    icon: 'i-heroicons-solid:menu-alt-3',
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
