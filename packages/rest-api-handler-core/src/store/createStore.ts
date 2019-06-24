import { RestApiActions } from './actions'
import { reducer } from './reducer'

export type CacheStoreData<ResourceType> = Record<string, ResourceType>

export type CacheStoreDispatch = (action: RestApiActions) => void

export type SubscribeCallback<ResourceType> = (
  state: CacheStoreData<ResourceType>,
  action: RestApiActions
) => void

export type CacheStore<ResourceType> = Readonly<{
  dispatch: CacheStoreDispatch
  getState: () => CacheStoreData<ResourceType>
  subscribe: (callback: SubscribeCallback<ResourceType>) => string
  unsubscribe: (subId: string) => boolean
}>

export function createStore<ResourceType>() {
  // Store data
  let uId = 0
  let store = {} as Record<string, ResourceType>
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

  const getState = () => store

  const dispatch = (action: RestApiActions) => {
    store = reducer(store, action)
    Object.values(subscriptions).forEach(callback => callback(store, action))
  }

  return {
    getState,
    dispatch,
    subscribe,
    unsubscribe
  }
}
