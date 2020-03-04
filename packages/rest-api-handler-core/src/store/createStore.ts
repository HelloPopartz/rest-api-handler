import { RestApiActionHandlers, createActions } from './actions'
import { createReducer } from './reducer'
import { ActionWithPayload } from '../utils/actionTypes'
import { Resource } from './types'

export type CacheStoreData<ResourceType extends Resource> = Record<ResourceType['id'], ResourceType>

export type CacheStoreDispatch = (action: ActionWithPayload<any, any>) => void

export type SubscribeCallback<ResourceType extends Resource> = (
  state: CacheStoreData<ResourceType>,
  action: ActionWithPayload<any, any>
) => void

export type CacheStore<ResourceType extends Resource> = Readonly<{
  dispatch: CacheStoreDispatch
  getState: () => CacheStoreData<ResourceType>
  getStoreName: () => string
  subscribe: (callback: SubscribeCallback<ResourceType>) => string
  unsubscribe: (subId: string) => boolean
  actions: RestApiActionHandlers
}>

export type CacheStoreConfig<ResourceType extends Resource> = {
  initialData?: CacheStoreData<ResourceType>
  partialUpdate?: boolean
}

export function createStore<ResourceType extends Resource>(
  storeName: string,
  config: CacheStoreConfig<ResourceType>
): CacheStore<ResourceType> {
  // Store data
  let uId = 0
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

  const actions = createActions()
  const reducer = createReducer<ResourceType>(actions, config)
  let state = reducer(config.initialData, {} as any)

  function getState() {
    return state
  }

  function dispatch(action: ActionWithPayload<any, any>) {
    state = reducer(state, action)
    Object.values(subscriptions).forEach(callback => callback(state, action))
  }

  function getStoreName() {
    return storeName
  }

  return {
    getState,
    getStoreName,
    dispatch,
    subscribe,
    unsubscribe,
    actions,
  }
}
