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
              rules: [
                {
                  id: 0,
                  factor: {
                    factor_code: 'product_id',
                  },
                  operator: {
                    operator_code: 'in',
                  },
                  value_list: ['1234556', '1234568485'],
                },
                {
                  id: 1,
                  factor: {
                    factor_code: 'product_name',
                  },
                  operator: {
                    operator_code: 'contain_any',
                  },
                  value_list: ['adidas nike apple'],
                },
                {
                  id: 2,
                  factor: {
                    factor_code: 'product_status',
                  },
                  operator: {
                    operator_code: 'in',
                  },
                  value_list: ['1', '2', '3'],
                },
              ],
              logic_expression: '1&2&3',
              limit: 20000,
              extra: {},
            })),
          },
        },
      }
    },
  },
  {
    url: '/mock/task/query/detail',
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
            job_id: faker.number.int(),
            name: faker.company.name(),
            total_records: faker.number.int(),
            status: faker.number.int({ min: 1, max: 3 }),
            created_by: {
              id: faker.number.int(),
              email: faker.internet.email(),
            },
            created_at: faker.date.past().getTime(),
            time_cost: faker.number.int({ min: 0, max: 200 }),
            rules: [
              {
                id: 0,
                factor: {
                  factor_code: 'product_id',
                },
                operator: {
                  operator_code: 'in',
                },
                value_list: ['1234556', '1234568485'],
              },
              {
                id: 1,
                factor: {
                  factor_code: 'product_name',
                },
                operator: {
                  operator_code: 'contain_any',
                },
                value_list: ['adidas nike apple'],
              },
              {
                id: 2,
                factor: {
                  factor_code: 'product_status',
                },
                operator: {
                  operator_code: 'in',
                },
                value_list: ['1', '2', '3'],
              },
            ],
            logic_expression: '1&2&3',
            limit: 20000,
            extra: {},
          },
        },
      }
    },
  },
  {
    url: '/mock/task/query/result',
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
            product_list: Array.from({ length: Math.min(body.page_num * body.page_size, 216) - (body.page_num - 1) * body.page_size }).fill(0).map(() => ({
              product_id: faker.number.int(),
              product_name: faker.company.name(),
              image_urls: [
                faker.image.urlLoremFlickr({ category: 'fashion' }),
                faker.image.urlLoremFlickr({ category: 'fashion' }),
                faker.image.urlLoremFlickr({ category: 'fashion' }),
              ],
              shop_image_url: [
                faker.image.urlLoremFlickr({ category: 'fashion' }),
              ],
              shop_name: faker.company.name(),
              shop_id: faker.number.int(),
              status: faker.number.int({ min: 1, max: 3 }),
              brand_name: faker.company.name(),
              brand_id: faker.number.int(),
              is_brand_authorized: faker.number.int({ min: 0, max: 1 }),
              logo_model_brand_name: faker.company.name(),
              logo_model_brand_id: faker.number.int(),
              image_model_brand_name: faker.company.name(),
              image_model_brand_id: faker.number.int(),
              extra: {},
            })),
          },
        },
      }
    },
  },
])
