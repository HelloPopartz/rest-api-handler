import { createResource } from '@rest-api-handler/core'
import { defaultHttpClient, FetchConfig } from '@rest-api-handler/core'

type Todo = {
  userId: number
  id: number
  title: string
  completed: boolean
}

const resourceConfig = {
  entityUrl: 'https://jsonplaceholder.typicode.com/todos',
  getResourceId: (data: Todo) => data.id.toString(),
}

const routeConfig = {
  httpClient: defaultHttpClient(),
}

export const resource = createResource<Todo, {}, FetchConfig>(
  resourceConfig,
  routeConfig
)
