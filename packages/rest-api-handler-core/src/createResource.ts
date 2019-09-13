import { createHandlers, GetApiHandlers } from './routes/handlers'
import {
  CacheStore,
  createStore,
  createSelectors,
  GetIdFromResource,
  GetResource,
  CacheStoreData,
  createOperations,
  Resource,
} from './store'
import { generateRoutes } from './routes/routes'
import { RouteMap } from './routes/routes.types'
import { NetworkClient } from './routes/networkClient'

export interface RestApiResource<
  ResourceType extends Resource,
  NetworkClientConfig,
  Routes extends RouteMap<ResourceType>
> {
  subscribe: CacheStore<ResourceType>['subscribe']
  unsubscribe: CacheStore<ResourceType>['unsubscribe']
  getState: CacheStore<ResourceType>['getState']
  forceUpdate: (data: ResourceType | ResourceType[]) => void
  getApiHandlers: GetApiHandlers<ResourceType, NetworkClientConfig, Routes>
  getResource: GetResource<ResourceType>
  getIdFromResource: GetIdFromResource<ResourceType>
  config: {
    routeConfig: Routes
    store: CacheStore<ResourceType>
    networkClient: NetworkClient<NetworkClientConfig>
    partialUpdate: boolean
    transformData: (originalData: any) => ResourceType
  }
}

export type ResourceConfig<ResourceType extends Resource> = {
  partialUpdate?: boolean
  transformData?: (originalData: any) => ResourceType
  customStore?: CacheStore<ResourceType>
  initialData?: CacheStoreData<ResourceType>
}

export function createResource<
  ResourceType extends Resource,
  NetworkClientConfig = any,
  ExtraRoutes extends RouteMap<any> = {}
>(
  resourceName: string,
  resourceUrl: string,
  networkClient: NetworkClient<NetworkClientConfig>,
  extraRoutes: ExtraRoutes = {} as ExtraRoutes,
  resourceConfig: ResourceConfig<ResourceType> = {}
) {
  const { partialUpdate = true, customStore, transformData, initialData } = resourceConfig
  const finalRoutes = generateRoutes<ResourceType, ExtraRoutes>(extraRoutes, {
    partialUpdate,
    transformData,
    resourceUrl,
  })
  const store = customStore || createStore<ResourceType>(resourceName, initialData)
  const { getResource, getIdFromResource } = createSelectors<ResourceType>(store)
  const { getApiHandlers } = createHandlers(finalRoutes, store, getIdFromResource, networkClient)
  const { forceUpdate } = createOperations(store, getIdFromResource)
  return {
    getApiHandlers,
    subscribe: store.subscribe,
    unsubscribe: store.unsubscribe,
    getState: store.getState,
    forceUpdate,
    getResource,
    getIdFromResource,
    config: {
      routeConfig: finalRoutes,
      networkClient,
      store,
      partialUpdate,
      transformData,
    },
  } as RestApiResource<ResourceType, NetworkClientConfig, typeof finalRoutes>
}
