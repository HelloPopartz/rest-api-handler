import {
  SubscribeCallback,
  createActions,
  createReducer,
  CacheStoreData
} from '@rest-api-handler/core'

import { ActionWithPayload } from './utils/actionTypes'
import { EnhancedStore, REST_API_STORE_ID } from './restStoreEnhancer.types'
import { emitWarning, WarningCodes } from './warning.service'

export function createConnectedStore<ResourceType>(
  resourceName: string,
  initialData: CacheStoreData<ResourceType> = {}
) {
  // Store data
  let uId = 0
  let reduxStore: EnhancedStore<any, any>
  let subscriptions = {} as Record<string, SubscribeCallback<ResourceType>>

  const subscribe = (callback: SubscribeCallback<ResourceType>) => {
    uId++
    subscriptions[uId] = callback
    return `${uId}`
  }

  const unsubscribe = (id: string) => {
    if (subscriptions[id]) {
      delete subscriptions[id]
      return true
    } else {
      return false
    }
  }

  const getState = () => {
    if (!reduxStore) {
      emitWarning(WarningCodes.storeNotSet)
      return {}
    } else {
      return reduxStore.getState()[REST_API_STORE_ID][resourceName]
    }
  }

  const actions = createActions(resourceName)
  const reducer = createReducer<ResourceType>(actions, initialData)

  const dispatch = (action: ActionWithPayload<any, any>) => {
    if (!reduxStore) {
      emitWarning(WarningCodes.storeNotSet)
    } else {
      reduxStore.dispatch(action)
      Object.values(subscriptions).forEach(callback =>
        callback(getState(), action)
      )
    }
  }

  const injectReduxStore = (store: EnhancedStore<any, any>) => {
    reduxStore = store
  }

  return {
    getState,
    dispatch,
    subscribe,
    unsubscribe,
    actions,
    reducer,
    injectReduxStore
  }
}
