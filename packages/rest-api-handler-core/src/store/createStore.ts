import { RestApiActionHandlers, createActions } from './actions'
import { createReducer } from './reducer'
import { ActionWithPayload } from '../utils/actionTypes'

export type CacheStoreData<ResourceType extends { id: string | number }> = Record<ResourceType['id'], ResourceType>

export type CacheStoreDispatch = (action: ActionWithPayload<any, any>) => void

export type SubscribeCallback<ResourceType extends { id: string | number }> = (
  state: CacheStoreData<ResourceType>,
  action: ActionWithPayload<any, any>
) => void

export type CacheStore<ResourceType extends { id: string | number }> = Readonly<{
  dispatch: CacheStoreDispatch
  getState: () => CacheStoreData<ResourceType>
  getStoreName: () => string
  subscribe: (callback: SubscribeCallback<ResourceType>) => string
  unsubscribe: (subId: string) => boolean
  actions: RestApiActionHandlers
}>

export function createStore<ResourceType extends { id: string | number }>(
  storeName: string,
  initialData?: CacheStoreData<ResourceType>
): CacheStore<ResourceType> {
  // Store data
  let uId = 0
  let subscriptions = {} as Record<string, SubscribeCallback<ResourceType>>

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
  const reducer = createReducer<ResourceType>(actions, initialData)
  let state = reducer({} as any, {} as any)

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
