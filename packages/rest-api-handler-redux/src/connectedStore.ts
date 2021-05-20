import {
  SubscribeCallback,
  createActions,
  createReducer,
  Resource,
  CacheStoreConfig,
  CacheStoreData,
} from '@rest-api-handler/core'

import { ActionWithPayload } from './utils/actionTypes'
import { EnhancedStore, REST_API_STORE_ID } from './restStoreEnhancer.types'
import { emitWarning, WarningCodes } from './warning.service'

export function createConnectedStore<ResourceType extends Resource>(
  storeName: string,
  { initialData = {} as CacheStoreData<ResourceType>, partialUpdate }: CacheStoreConfig<ResourceType>
) {
  // Store data
  let uId = 0
  let reduxStore: EnhancedStore<any>
  const subscriptions = {} as Record<string, SubscribeCallback<ResourceType>>

  function subscribe(callback: SubscribeCallback<ResourceType>) {
    uId++
    subscriptions[uId] = callback
    return `${uId}`
  }

  function unsubscribe(id: string) {
    if (subscriptions[id]) {
      delete subscriptions[id]
      return true
    } else {
      return false
    }
  }

  function getState() {
    if (!reduxStore) {
      emitWarning(storeName, WarningCodes.storeNotSet)
      return {}
    } else {
      return reduxStore.getState()[REST_API_STORE_ID][storeName]
    }
  }

  const actions = createActions(storeName)
  const reducer = createReducer<ResourceType>(actions, { initialData, partialUpdate })

  function dispatch(action: ActionWithPayload<any, any>) {
    if (!reduxStore) {
      emitWarning(storeName, WarningCodes.storeNotSet)
    } else {
      reduxStore.dispatch(action)
      Object.values(subscriptions).forEach(callback => callback(getState(), action))
    }
  }

  const injectReduxStore = (store: EnhancedStore<any>) => {
    reduxStore = store
  }

  function getStoreName() {
    return storeName
  }

  function clearStore() {
    dispatch(actions.clearStore() as any)
  }

  return {
    getState,
    dispatch,
    subscribe,
    unsubscribe,
    actions,
    reducer,
    getStoreName,
    injectReduxStore,
    clearStore,
  }
}
