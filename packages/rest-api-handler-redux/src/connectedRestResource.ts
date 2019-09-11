import {
  RouteMap,
  createResource,
  ResourceConfig,
  NetworkClient,
  RestApiResource,
  RestApiActionHandlers,
  GetIdFromResource,
  GetResource,
} from '@rest-api-handler/core'
import { Reducer } from 'redux'

import { createConnectedStore } from './connectedStore'
import { Omit } from './utils/types'
import { EnhancedStore } from './restStoreEnhancer.types'
import { createSelectors, GetAllResources } from './createSelectors'

export interface ConnectedRestApiResource<
  ResourceType extends { id: string | number },
  NetworkClientConfig,
  Routes extends RouteMap<ResourceType>
> extends RestApiResource<ResourceType, NetworkClientConfig, Routes> {
  getAllResources: GetAllResources<ResourceType>
  getIdFromResource: GetIdFromResource<ResourceType>
  getResource: GetResource<ResourceType>
  storeId: string
  actions: RestApiActionHandlers
  reducer: Reducer<Record<string | number, ResourceType>>
  injectReduxStore: (store: EnhancedStore<any, any>) => void
}

export function createConnectedResource<
  ResourceType extends { id: string | number },
  NetworkClientConfig = {},
  ExtraRoutes extends RouteMap<ResourceType> = {}
>(
  storeId: string,
  resourceUrl: string,
  networkClient: NetworkClient<NetworkClientConfig>,
  extraRoutes: ExtraRoutes,
  { initialData, ...resourceConfig }: Omit<ResourceConfig<ResourceType>, 'customStore'> = {}
) {
  const internalStore = createConnectedStore<ResourceType>(storeId, initialData)
  const restResource = createResource(storeId, resourceUrl, networkClient, extraRoutes, {
    ...resourceConfig,
    customStore: internalStore,
  })
  const { actions, reducer, injectReduxStore } = internalStore
  const { getAllResources } = createSelectors(storeId)
  return {
    ...restResource,
    getAllResources,
    storeId: storeId,
    actions,
    reducer,
    injectReduxStore,
  } as ConnectedRestApiResource<ResourceType, NetworkClientConfig, typeof restResource.config.routeConfig>
}
