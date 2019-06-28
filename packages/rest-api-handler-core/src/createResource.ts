import { createHandlers, Handlers } from './handlers'
import {
  CacheStore,
  createStore,
  createSelectors,
  GetIdFromResource,
  GetResourceById,
  CacheStoreData
} from './store'
import { HttpClient } from './httpClient.types'
import { generateRoutes } from './routes'
import { RouteMap } from './routes.types'
import { createOperations } from './store/operations'

export interface RestApiResource<
  ResourceType extends { id: string | number },
  Routes extends RouteMap<ResourceType>
> {
  api: Handlers<ResourceType, Routes>
  subscribe: CacheStore<ResourceType>['subscribe']
  unsubscribe: CacheStore<ResourceType>['unsubscribe']
  getState: CacheStore<ResourceType>['getState']
  forceUpdate: (data: ResourceType | ResourceType[]) => void
  selectors: {
    getIdFromResource: GetIdFromResource<ResourceType>
    getResourceById: GetResourceById<ResourceType>
  }
  config: {
    routeConfig: Routes
    store: CacheStore<ResourceType>
    httpClient: HttpClient<any>
    partialUpdate: boolean
    transformData: (originalData: any) => ResourceType
  }
}

export type ResourceConfig<ResourceType extends { id: string | number }> = {
  partialUpdate?: boolean
  transformData?: (originalData: any) => ResourceType
  customStore?: CacheStore<ResourceType>
  initialData?: CacheStoreData<ResourceType>
}

export function createResource<
  ResourceType extends { id: string | number },
  ExtraRoutes extends RouteMap<ResourceType> = {}
>(
  resourceUrl: string,
  httpClient: HttpClient<any>,
  extraRoutes: ExtraRoutes,
  resourceConfig: ResourceConfig<ResourceType> = {}
) {
  const {
    partialUpdate = true,
    customStore,
    transformData,
    initialData
  } = resourceConfig
  const finalRoutes = generateRoutes<ResourceType, ExtraRoutes>(extraRoutes, {
    partialUpdate,
    transformData,
    httpClient,
    resourceUrl
  })
  const store = customStore || createStore<ResourceType>(initialData)
  const selectors = createSelectors()
  const api = createHandlers(finalRoutes, selectors.getIdFromResource, store)
  const { forceUpdate } = createOperations(store, selectors.getIdFromResource)
  return {
    api,
    subscribe: store.subscribe,
    unsubscribe: store.unsubscribe,
    getState: store.getState,
    forceUpdate,
    selectors,
    config: {
      routeConfig: finalRoutes,
      httpClient,
      store,
      partialUpdate,
      transformData
    }
  } as RestApiResource<ResourceType, typeof finalRoutes>
}
