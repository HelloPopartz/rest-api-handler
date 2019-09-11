import { createConnectedResource } from '@rest-api-handler/redux'
import { fetchHttpClient } from '@rest-api-handler/fetch-http-client'

type Todo = {
  userId: number
  id: number
  title: string
  completed: boolean
}

export const resource = createConnectedResource<Todo, {}>(
  'todo',
  'https://jsonplaceholder.typicode.com/todos',
  fetchHttpClient,
  {},
  {
    partialUpdate: false,
    initialData: { 1: { id: 1, userId: 200, title: 'wow', completed: false } },
  }
)
