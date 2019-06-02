import {
  createHandlers,
  Handlers,
  generateDefaultRoutes,
  RoutesConfigOptions,
  RouteInheritableOptions,
} from './handlers'
import { createStore, CacheStore } from './store'
import { RouteMap } from './handlers'
import { Subscriptions, createSubscriptionMap } from './subscriptions'

export interface RestApiResource<
  ResourceType,
  Routes extends RouteMap<ResourceType>
> {
  api: Handlers<ResourceType, Routes>
  store: CacheStore<ResourceType>
  subscriptions: Subscriptions<ResourceType>
  getResourceId: ResourceConfig<ResourceType>['getResourceId']
}

export type ResourceConfig<ResourceType> = RouteInheritableOptions<
  ResourceType
> & {
  storeActive?: boolean
  getResourceId: (data: ResourceType) => string
}

export function createResource<
  ResourceType,
  ExtraRoutes extends RouteMap<ResourceType>,
  HttpClientOptions = any
>(
  { entityUrl, storeActive, getResourceId }: ResourceConfig<ResourceType>,
  {
    extraRoutes,
    ...routeConfig
  }: RoutesConfigOptions<ResourceType, ExtraRoutes, HttpClientOptions>
) {
  const finalRoutes = {
    ...generateDefaultRoutes<ResourceType>(),
    ...extraRoutes,
  }
  const storeConfig = { active: storeActive !== undefined ? storeActive : true }
  const store = createStore<ResourceType>(storeConfig)
  const subscriptions = createSubscriptionMap<ResourceType>()
  return {
    api: createHandlers(
      { ...routeConfig, entityUrl },
      finalRoutes,
      getResourceId,
      store,
      subscriptions
    ),
    store,
    subscriptions,
    getResourceId,
  } as RestApiResource<ResourceType, typeof finalRoutes>
}
