import {
  RouteMap,
  createResource,
  ResourceConfig,
  NetworkClient,
  RestApiResource,
  RestApiActionHandlers,
  GetIdFromResource,
  GetResource,
  Resource,
} from '@rest-api-handler/core'
import { Reducer } from 'redux'

import { createConnectedStore } from './connectedStore'
import { Omit } from './utils/types'
import { EnhancedStore } from './restStoreEnhancer.types'
import { createSelectors, GetAllResources } from './createSelectors'

export interface ConnectedRestApiResource<
  ResourceType extends Resource,
  UserClientConfig extends NetworkClient<any>,
  Routes extends RouteMap<ResourceType>
> extends RestApiResource<ResourceType, UserClientConfig, Routes> {
  getAllResources: GetAllResources<ResourceType>
  getIdFromResource: GetIdFromResource<ResourceType>
  getResource: GetResource<ResourceType>
  storeId: string
  actions: RestApiActionHandlers
  reducer: Reducer<Record<string | number, ResourceType>>
  injectReduxStore: (store: EnhancedStore<any, any>) => void
}

export function createConnectedResource<
  ResourceType extends Resource,
  UserClientConfig extends NetworkClient<any> = NetworkClient<any>,
  ExtraRoutes extends RouteMap<any> = {}
>(
  storeId: string,
  resourceUrl: string,
  networkClient: UserClientConfig,
  extraRoutes: ExtraRoutes = {} as ExtraRoutes,
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
  } as ConnectedRestApiResource<ResourceType, UserClientConfig, typeof restResource.config.routeConfig>
}
