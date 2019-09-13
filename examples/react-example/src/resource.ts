import { createResource } from '@rest-api-handler/core'
import { fetchHttpClient, FetchHttpClient } from '@rest-api-handler/fetch-http-client'

type Todo = {
  userId: number
  id: number
  title: string
  completed: boolean
}

export const resource = createResource<Todo, FetchHttpClient, {}>(
  'todo',
  'https://jsonplaceholder.typicode.com/todos',
  fetchHttpClient,
  {},
  { partialUpdate: false }
)
