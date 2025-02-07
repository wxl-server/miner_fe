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
            total: 30,
            jobList: Array.from({ length: body.pageSize }).fill(0).map(() => ({
              id: faker.number.int(),
              name: faker.person.fullName(),
              description: faker.lorem.sentence(),
              createdBy: faker.person.fullName(),
              updatedBy: faker.person.fullName(),
              createdAt: faker.date.past().getTime(),
              updatedAt: faker.date.past().getTime(),
              extra: {},
            })),
          },
        },
      }
    },
  },
])
