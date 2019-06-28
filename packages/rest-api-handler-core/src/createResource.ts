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
  ResourceType,
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
    getIdFromResource: GetIdFromResource<ResourceType>
  }
}

export type ResourceConfig<ResourceType> = {
  partialUpdate?: boolean
  transformData?: (originalData: any) => ResourceType
  customStore?: CacheStore<ResourceType>
  getIdFromResource?: GetIdFromResource<ResourceType>
  initialData?: CacheStoreData<ResourceType>
}

export function createResource<
  ResourceType,
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
    initialData,
    getIdFromResource = (data: ResourceType) =>
      (data as any).id ? (data as any).id : undefined
  } = resourceConfig
  const finalRoutes = generateRoutes<ResourceType, ExtraRoutes>(extraRoutes, {
    partialUpdate,
    transformData,
    httpClient,
    resourceUrl
  })
  const store = customStore || createStore<ResourceType>(initialData)
  const selectors = createSelectors()
  const api = createHandlers(finalRoutes, getIdFromResource, store)
  const { forceUpdate } = createOperations(store, getIdFromResource)
  return {
    api,
    subscribe: store.subscribe,
    unsubscribe: store.unsubscribe,
    getState: store.getState,
    forceUpdate,
    selectors: {
      ...selectors,
      getIdFromResource
    },
    config: {
      routeConfig: finalRoutes,
      httpClient,
      store,
      partialUpdate,
      transformData,
      getIdFromResource
    }
  } as RestApiResource<ResourceType, typeof finalRoutes>
}
