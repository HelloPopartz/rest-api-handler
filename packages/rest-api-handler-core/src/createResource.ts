import {
  RouteInheritableOptions,
  createHandlers,
  Handlers,
  generateDefaultRoutes,
} from './handlers'
import { createStore, CacheStore } from './store'
import { RouteMap } from './handlers'
import { HttpClient } from './httpClient'

export interface RoutesConfigOptions<
  ResourceType,
  ExtraRoutes extends RouteMap<ResourceType>,
  HttpClientOptions
> extends RouteInheritableOptions {
  httpClient: HttpClient<HttpClientOptions>
  extraRoutes?: ExtraRoutes
}

export interface StoreConfigOptions<ResourceType> {
  active: boolean
  getResourceId: (data: ResourceType) => string
}

export interface RestApiResource<
  ResourceType,
  Routes extends RouteMap<ResourceType>
> {
  api: Handlers<ResourceType, Routes>
  store: CacheStore<ResourceType>
}

export function createResource<
  ResourceType,
  ExtraRoutes extends RouteMap<ResourceType>,
  HttpClientOptions = any
>(
  {
    extraRoutes,
    ...routeConfig
  }: RoutesConfigOptions<ResourceType, ExtraRoutes, HttpClientOptions>,
  storeConfig?: StoreConfigOptions<ResourceType>
) {
  const finalRoutes = {
    ...generateDefaultRoutes<ResourceType>(),
    ...extraRoutes,
  }
  const store = createStore<ResourceType>(storeConfig)
  return {
    api: createHandlers(routeConfig, finalRoutes, store),
    store,
  } as RestApiResource<ResourceType, typeof finalRoutes>
}
