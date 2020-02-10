import {
  StoreEnhancer,
  Reducer,
  AnyAction,
  Action,
  DeepPartial,
  StoreEnhancerStoreCreator,
  combineReducers,
} from 'redux'
import { Resource } from '@rest-api-handler/core'

import { ConnectedRestApiResource } from './connectedRestResource'
import { emitWarning, WarningCodes } from './warning.service'
import { RestApiEntitiesState, REST_API_STORE_ID, EnhancedStore } from './restStoreEnhancer.types'
import { isEmpty } from './utils/objects'

function generateReducers<ResourceType extends Resource>(
  restResources: Record<string, ConnectedRestApiResource<ResourceType, any, any>>
) {
  const restResourcesReducers = {}
  Object.keys(restResources).map(resourceKey => {
    const { storeId, reducer } = restResources[resourceKey]
    if (resourceKey !== storeId) {
      emitWarning(storeId, WarningCodes.keyMismatch, resourceKey, storeId)
    }
    restResourcesReducers[storeId] = reducer
  })
  return combineReducers<RestApiEntitiesState>(restResourcesReducers as any)
}

function injectReduxToResources<ResourceType extends Resource>(
  store: EnhancedStore<any, any>,
  restResources: Record<string, ConnectedRestApiResource<ResourceType, any, any>>
) {
  Object.keys(restResources).map(resourceKey => {
    const { injectReduxStore } = restResources[resourceKey]
    injectReduxStore(store)
  })
}

export const connectToRestResources = (
  restResources: Record<string, any> = {}
): StoreEnhancer<{}, RestApiEntitiesState> => (createStore: StoreEnhancerStoreCreator<{}, RestApiEntitiesState>) => <
  S,
  A extends Action = AnyAction
>(
  reducer: Reducer<S, A>,
  preloadedState: DeepPartial<S> = {}
) => {
  if (isEmpty(restResources)) {
    emitWarning('', WarningCodes.noResources)
  }
  const entitiesReducer = generateReducers(restResources)
  function enhancedReducer(state: S & RestApiEntitiesState, action: A) {
    const { [REST_API_STORE_ID]: restApiState, ...otherState } = state
    return {
      ...reducer(otherState as any, action),
      [REST_API_STORE_ID]: entitiesReducer((state ? state[REST_API_STORE_ID] : {}) as RestApiEntitiesState, action),
    }
  }
  const enhancedPreloadedState = { ...preloadedState, [REST_API_STORE_ID]: {} }

  const store = createStore<S & RestApiEntitiesState, A>(enhancedReducer, enhancedPreloadedState as any)

  injectReduxToResources(store as any, restResources)

  return store
}
