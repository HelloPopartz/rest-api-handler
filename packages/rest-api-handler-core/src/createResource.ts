import { RouteInheritableOptions, createHandlers } from './handlers'
import { createStore } from './store'
import { RouteMap } from './handlers'
import { HttpClient } from './httpClient'

export interface CreateResourceOptions<
  ResourceType,
  ExtraRoutes extends RouteMap,
  HttpClientOptions,
  ResponseType
> extends RouteInheritableOptions<ResourceType> {
  httpClient: HttpClient<HttpClientOptions, ResponseType>
  routes?: ExtraRoutes
}

export function createResource<
  ResourceType,
  ExtraRoutes extends RouteMap,
  HttpClientOptions,
  ResponseType = ResourceType
>(
  config: CreateResourceOptions<
    ResourceType,
    ExtraRoutes,
    HttpClientOptions,
    ResponseType
  >
) {
  const store = createStore<ResourceType>()
  return {
    api: createHandlers(config, store),
    store,
  }
}
