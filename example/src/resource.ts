import { createResource } from '@rest-api-handler/core'
import { defaultHttpClient, FetchConfig } from '@rest-api-handler/core'

type Todo = {
  userId: number
  id: number
  title: string
  completed: boolean
}

const config = {
  entityUrl: 'https://jsonplaceholder.typicode.com/todos',
  httpClient: defaultHttpClient(),
}

const storeConfig = {
  active: true,
  getResourceId: (data: Todo) => data.id.toString(),
}

export const resource = createResource<Todo, {}, FetchConfig>(
  config,
  storeConfig
)
