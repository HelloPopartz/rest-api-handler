import { createResource } from '@rest-api-handler/core'
import { fetchHttpClient } from '@rest-api-handler/fetch-http-client'

type Todo = {
  userId: number
  id: number
  title: string
  completed: boolean
}

export const resource = createResource<Todo, {}>(
  'https://jsonplaceholder.typicode.com/todos',
  fetchHttpClient(),
  {},
  { partialUpdate: false }
)
