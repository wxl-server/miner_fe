import { faker } from '@faker-js/faker'
import { defineFakeRoute } from 'vite-plugin-fake-server/client'

export default defineFakeRoute([
  {
    url: '/mock/job/query/list',
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
            job_list: Array.from({ length: Math.min(body.page_num * body.page_size, 216) - (body.page_num - 1) * body.page_size }).fill(0).map(() => ({
              id: faker.number.int(),
              name: faker.person.fullName(),
              description: faker.lorem.sentence(),
              created_by: {
                id: faker.number.int(),
                email: faker.internet.email(),
              },
              updated_by: {
                id: faker.number.int(),
                email: faker.internet.email(),
              },
              created_at: faker.date.past().getTime(),
              updated_at: faker.date.past().getTime(),
              extra: {},
            })).sort((a, b) => {
              if (body.order === undefined && body.order_by === undefined) {
                return b.created_at - a.created_at
              }
              else if (body.order_by === 5) {
                return body.order === 1 ? a.created_at - b.created_at : b.created_at - a.created_at
              }
              else if (body.order_by === 6) {
                return body.order === 1 ? a.updated_at - b.updated_at : b.updated_at - a.updated_at
              }
              return b.created_at - a.created_at
            }),
          },
        },
      }
    },
  },
  {
    url: '/mock/job/query/detail',
    method: 'post',
    response: ({ body }) => {
      return {
        error: '',
        status: 1,
        data: {
          code: 0,
          message: 'success',
          data: {
            id: body.id,
            name: faker.person.fullName(),
            description: faker.lorem.sentence(),
            created_by: {
              id: faker.number.int(),
              email: faker.internet.email(),
            },
            updated_by: {
              id: faker.number.int(),
              email: faker.internet.email(),
            },
            created_at: faker.date.past().getTime(),
            updated_at: faker.date.past().getTime(),
            extra: {},
          },
        },
      }
    },
  },
  {
    url: '/mock/job/delete',
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
    url: '/mock/job/create',
    method: 'post',
    response: () => {
      return {
        error: '',
        status: 1,
        data: {
          code: 0,
          message: 'success',
          data: {
            id: faker.number.int(),
          },
        },
      }
    },
  },
])
