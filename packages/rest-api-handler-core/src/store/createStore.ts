import { RestApiActionHandlers, createActions } from './actions'
import { createReducer } from './reducer'
import { ActionWithPayload } from '../utils/actionTypes'

export type CacheStoreData<ResourceType> = Record<string | number, ResourceType>

export type CacheStoreDispatch = (action: ActionWithPayload<any, any>) => void

export type SubscribeCallback<ResourceType> = (
  state: CacheStoreData<ResourceType>,
  action: ActionWithPayload<any, any>
) => void

export type CacheStore<ResourceType> = Readonly<{
  dispatch: CacheStoreDispatch
  getState: () => CacheStoreData<ResourceType>
  subscribe: (callback: SubscribeCallback<ResourceType>) => string
  unsubscribe: (subId: string) => boolean
  actions: RestApiActionHandlers
}>

export function createStore<ResourceType>() {
  // Store data
  let uId = 0
  let state = {} as CacheStoreData<ResourceType>
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

  const getState = () => state

  const actions = createActions()
  const reducer = createReducer<ResourceType>(actions)

  const dispatch = (action: ActionWithPayload<any, any>) => {
    state = reducer(state, action)
    Object.values(subscriptions).forEach(callback => callback(state, action))
  }

  return {
    getState,
    dispatch,
    subscribe,
    unsubscribe,
    actions
  }
}
