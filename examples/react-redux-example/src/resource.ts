import { createConnectedResource } from '@rest-api-handler/redux'
import { fetchHttpClient, FetchHttpClient } from '@rest-api-handler/fetch-http-client'

type Todo = {
  userId: number
  id: number
  title: string
  completed: boolean
}

export const resource = createConnectedResource<Todo, FetchHttpClient>(
  'todo',
  'https://jsonplaceholder.typicode.com/todos',
  fetchHttpClient,
  {},
  {
    partialUpdate: true,
    initialData: { 1: { id: 1, userId: 200, title: 'wow', completed: false } },
    transformData: ({ ...data }) => {
      return { ...data }
    },
  }
)
