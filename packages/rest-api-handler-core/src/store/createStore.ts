import { RestApiActionHandlers, createActions } from './actions'
import { createReducer } from './reducer'
import { ActionWithPayload } from '../utils/actionTypes'

export type CacheStoreData<
  ResourceType extends { id: string | number }
> = Record<ResourceType['id'], ResourceType>

export type CacheStoreDispatch = (action: ActionWithPayload<any, any>) => void

export type SubscribeCallback<ResourceType extends { id: string | number }> = (
  state: CacheStoreData<ResourceType>,
  action: ActionWithPayload<any, any>
) => void

export type CacheStore<
  ResourceType extends { id: string | number }
> = Readonly<{
  dispatch: CacheStoreDispatch
  getState: () => CacheStoreData<ResourceType>
  subscribe: (callback: SubscribeCallback<ResourceType>) => string
  unsubscribe: (subId: string) => boolean
  actions: RestApiActionHandlers
}>

export function createStore<ResourceType extends { id: string | number }>(
  initialData?: CacheStoreData<ResourceType>
) {
  // Store data
  let uId = 0
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

  const actions = createActions()
  const reducer = createReducer<ResourceType>(actions, initialData)
  let state = reducer({} as any, {} as any)

  const getState = () => state

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
