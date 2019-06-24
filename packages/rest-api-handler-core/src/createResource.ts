import { createHandlers, Handlers } from './handlers'
import {
  CacheStore,
  createStore,
  createSelectors,
  GetIdFromResource
} from './store'
import { HttpClient } from './httpClient.types'
import { generateRoutes } from './routes'
import { RouteMap } from './routes.types'

export interface RestApiResource<
  ResourceType,
  Routes extends RouteMap<ResourceType>
> {
  api: Handlers<ResourceType, Routes>
  subscribe: CacheStore<ResourceType>['subscribe']
  unsubscribe: CacheStore<ResourceType>['unsubscribe']
  selectors: {
    getIdFromResource: GetIdFromResource<ResourceType>
    getResourceById: (id: string) => ResourceType
  }
  config: {
    routeConfig: Routes
    store: CacheStore<ResourceType>
    httpClient: HttpClient<any>
  }
}

export type ResourceConfig<ResourceType> = {
  partialUpdate?: boolean
  transformData?: (originalData: any) => ResourceType
  customStore?: CacheStore<ResourceType>
  getIdFromResource?: GetIdFromResource<ResourceType>
}

export function createResource<
  ResourceType,
  ExtraRoutes extends RouteMap<ResourceType> = {}
>(
  entityUrl: string,
  httpClient: HttpClient<any>,
  extraRoutes: ExtraRoutes,
  resourceConfig: ResourceConfig<ResourceType> = {}
) {
  const {
    partialUpdate = true,
    customStore,
    transformData,
    getIdFromResource = (data: ResourceType) =>
      (data as any).id ? (data as any).id.toString() : undefined
  } = resourceConfig
  const finalRoutes = generateRoutes<ResourceType, ExtraRoutes>(extraRoutes, {
    partialUpdate,
    transformData,
    entityUrl
  })
  const store = customStore || createStore<ResourceType>()
  const selectors = createSelectors(store)
  const api = createHandlers(httpClient, finalRoutes, getIdFromResource, store)
  return {
    api,
    subscribe: store.subscribe,
    unsubscribe: store.unsubscribe,
    selectors: {
      ...selectors,
      getIdFromResource
    },
    config: {
      routeConfig: finalRoutes,
      httpClient,
      store
    }
  } as RestApiResource<ResourceType, typeof finalRoutes>
}
