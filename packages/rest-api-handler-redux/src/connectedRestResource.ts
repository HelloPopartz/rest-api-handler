import {
  RouteMap,
  createResource,
  ResourceConfig,
  HttpClient,
  RestApiResource,
  RestApiActionHandlers,
  GetIdFromResource,
  GetResourceById
} from '@rest-api-handler/core'
import { Reducer } from 'redux'

import { createConnectedStore } from './connectedStore'
import { Omit } from './utils/types'
import { EnhancedStore } from './restStoreEnhancer.types'
import { createSelectors, GetAllResources } from './createSelectors'

export interface ConnectedRestApiResource<
  ResourceType extends { id: string | number },
  Routes extends RouteMap<ResourceType>
> extends RestApiResource<ResourceType, Routes> {
  selectors: {
    getAllResources: GetAllResources<ResourceType>
    getIdFromResource: GetIdFromResource<ResourceType>
    getResourceById: GetResourceById<ResourceType>
  }
  storeId: string
  actions: RestApiActionHandlers
  reducer: Reducer<Record<string | number, ResourceType>>
  injectReduxStore: (store: EnhancedStore<any, any>) => void
}

export function createConnectedResource<
  ResourceType extends { id: string | number },
  ExtraRoutes extends RouteMap<ResourceType> = {}
>(
  storeId: string,
  resourceUrl: string,
  httpClient: HttpClient<any>,
  extraRoutes: ExtraRoutes,
  {
    initialData,
    ...resourceConfig
  }: Omit<ResourceConfig<ResourceType>, 'customStore'> = {}
) {
  const internalStore = createConnectedStore<ResourceType>(storeId, initialData)
  const { selectors, ...restResource } = createResource(
    resourceUrl,
    httpClient,
    extraRoutes,
    {
      ...resourceConfig,
      customStore: internalStore
    }
  )
  const { actions, reducer, injectReduxStore } = internalStore
  const reduxSelectors = createSelectors(storeId)
  return {
    ...restResource,
    selectors: {
      ...reduxSelectors,
      ...selectors
    },
    storeId: storeId,
    actions,
    reducer,
    injectReduxStore
  } as ConnectedRestApiResource<
    ResourceType,
    typeof restResource.config.routeConfig
  >
}
