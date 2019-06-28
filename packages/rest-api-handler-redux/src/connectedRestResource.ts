import {
  RouteMap,
  createResource,
  ResourceConfig,
  HttpClient,
  RestApiResource,
  RestApiActionHandlers
} from '@rest-api-handler/core'
import { Reducer } from 'redux'

import { createConnectedStore } from './connectedStore'
import { Omit } from './utils/types'
import { EnhancedStore } from './restStoreEnhancer.types'

export interface ConnectedRestApiResource<
  ResourceType,
  Routes extends RouteMap<ResourceType>
> extends RestApiResource<ResourceType, Routes> {
  storeId: string
  actions: RestApiActionHandlers
  reducer: Reducer<Record<string | number, ResourceType>>
  injectReduxStore: (store: EnhancedStore<any, any>) => void
}

export function createConnectedResource<
  ResourceType,
  ExtraRoutes extends RouteMap<ResourceType> = {}
>(
  resourceName: string,
  resourceUrl: string,
  httpClient: HttpClient<any>,
  extraRoutes: ExtraRoutes,
  resourceConfig: Omit<ResourceConfig<ResourceType>, 'customStore'> = {}
) {
  const internalStore = createConnectedStore<ResourceType>(resourceName)
  const restResource = createResource(resourceUrl, httpClient, extraRoutes, {
    ...resourceConfig,
    customStore: internalStore
  })
  const { actions, reducer, injectReduxStore } = internalStore
  return {
    ...restResource,
    storeId: resourceName,
    actions,
    reducer,
    injectReduxStore
  } as ConnectedRestApiResource<
    ResourceType,
    typeof restResource.config.routeConfig
  >
}
