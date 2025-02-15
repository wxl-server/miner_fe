import { faker } from '@faker-js/faker'
import { defineFakeRoute } from 'vite-plugin-fake-server/client'

export default defineFakeRoute([
  {
    url: '/mock/task/apply_and_run',
    method: 'post',
    response: () => {
      return {
        error: '',
        status: 1,
        data: {
          code: 0,
          message: 'success',
        },
      }
    },
  },
  {
    url: '/mock/task/query/list',
    method: 'post',
    response: ({ body }) => {
      return {
        error: '',
        status: 1,
        data: {
          code: 0,
          message: 'success',
          data: {
            total: 216,
            task_list: Array.from({ length: Math.min(body.page_num * body.page_size, 216) - (body.page_num - 1) * body.page_size }).fill(0).map(() => ({
              id: faker.number.int(),
              job_id: body.job_id,
              name: faker.company.name(),
              total_records: faker.number.int(),
              status: faker.number.int({ min: 1, max: 3 }),
              created_by: {
                id: faker.number.int(),
                email: faker.internet.email(),
              },
              created_at: faker.date.past().getTime(),
              time_cost: faker.number.int({ min: 0, max: 200 }),
              extra: {},
            })),
          },
        },
      }
    },
  },
])
