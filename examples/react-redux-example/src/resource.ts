import { createConnectedResource } from '@rest-api-handler/redux'
import { fetchHttpClient } from '@rest-api-handler/fetch-http-client'
import { createRoute, RouteMethod } from '@rest-api-handler/core'

type Todo = {
  userId: number
  id: number
  title: string
  completed: boolean
}

export const resource = createConnectedResource<Todo>(
  'todo',
  'https://jsonplaceholder.typicode.com/todos',
  fetchHttpClient
)
