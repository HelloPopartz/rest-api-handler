import { createHandlers, defaultRoutes } from './handlers'
import { CacheStore, createStore } from './store'
import {
  RouteMap,
  Handlers,
  RoutesConfigOptions,
  RouteInheritableOptions,
  GetResourceId
} from './handlers.types'

export interface RestApiResource<
  ResourceType,
  Routes extends RouteMap<ResourceType>
> {
  api: Handlers<ResourceType, Routes>
  store: CacheStore<ResourceType>
  getResourceId: GetResourceId<ResourceType>
}

export type ResourceConfig<ResourceType> = RouteInheritableOptions<
  ResourceType
> & {
  customStore?: CacheStore<ResourceType>
  getResourceId?: GetResourceId<ResourceType>
}

export function createResource<
  ResourceType,
  ExtraRoutes extends RouteMap<ResourceType>,
  HttpClientOptions = any
>(
  {
    entityUrl,
    customStore,
    getResourceId = (data: ResourceType) =>
      (data as any).id ? (data as any).id.toString() : undefined
  }: ResourceConfig<ResourceType>,
  {
    extraRoutes,
    ...routeConfig
  }: RoutesConfigOptions<ResourceType, ExtraRoutes, HttpClientOptions>
) {
  const finalRoutes = {
    ...defaultRoutes<ResourceType>(),
    ...extraRoutes
  }
  const store = customStore || createStore<ResourceType>()
  return {
    api: createHandlers(
      { ...routeConfig, entityUrl },
      finalRoutes,
      getResourceId,
      store
    ),
    getResourceId,
    store
  } as RestApiResource<ResourceType, typeof finalRoutes>
}
