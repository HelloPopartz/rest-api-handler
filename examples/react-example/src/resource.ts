import { createResource } from '@rest-api-handler/core'
import { fetchHttpClient, FetchConfig } from '@rest-api-handler/fetch-http-client'

type Todo = {
  userId: number
  id: number
  title: string
  completed: boolean
}

export const resource = createResource<Todo, FetchConfig, {}>(
  'todo',
  'https://jsonplaceholder.typicode.com/todos',
  fetchHttpClient,
  {},
  { partialUpdate: false }
)
