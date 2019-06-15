import { createHandlers, generateDefaultRoutes } from './handlers'
import { defaultStore, CacheStore } from './store'
import {
  RouteMap,
  Handlers,
  RoutesConfigOptions,
  RouteInheritableOptions,
  GetResourceId
} from './handlers.types'
import { Subscriptions, createSubscriptionMap } from './subscriptions'

export interface RestApiResource<
  ResourceType,
  Routes extends RouteMap<ResourceType>
> {
  api: Handlers<ResourceType, Routes>
  store: CacheStore<ResourceType>
  subscriptions: Subscriptions<ResourceType>
  getResourceId: GetResourceId<ResourceType>
}

export type ResourceConfig<ResourceType> = RouteInheritableOptions<
  ResourceType
> & {
  withStore?: boolean
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
    withStore,
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
    ...generateDefaultRoutes<ResourceType>(),
    ...extraRoutes
  }
  let store: CacheStore<ResourceType> | undefined
  if (withStore && !customStore) {
    store = defaultStore<ResourceType>()
  } else if (!!customStore) {
    store = customStore
  }
  const subscriptions = createSubscriptionMap<ResourceType>()
  return {
    api: createHandlers(
      { ...routeConfig, entityUrl },
      finalRoutes,
      getResourceId,
      subscriptions,
      store
    ),
    subscriptions,
    getResourceId,
    store
  } as RestApiResource<ResourceType, typeof finalRoutes>
}
