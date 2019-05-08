import { StoreConfigOptions } from './createResource'

export enum CacheActionType {
  delete = 'delete',
  set = 'set',
}

export type SubscribeCallback<ResourceType> = (params: {
  action: CacheActionType
  data: ResourceType
  id: string
  store: Map<string, ResourceType>
}) => void

export type CacheStore<ResourceType> = Readonly<{
  set: (data: ResourceType, id: string) => void
  get: (id: string) => ResourceType
  delete: (id: string) => boolean
  clear: () => void
  subscribe: (id: string, callback: SubscribeCallback<ResourceType>) => string
  unsubscribe: (id: string) => boolean
  active: StoreConfigOptions<ResourceType>['active']
  getResourceId: StoreConfigOptions<ResourceType>['getResourceId']
}>

type SubscriptionMap<ResourceType> = {
  [key: string]: { [key: string]: SubscribeCallback<ResourceType> }
}

export function createStore<ResourceType>(
  storeConfig: StoreConfigOptions<ResourceType> = {
    active: false,
    getResourceId: () => 'unset',
  }
): CacheStore<ResourceType> {
  // Store data
  let subId = 0
  let store = {} as Map<string, ResourceType>
  let subscriptions = {} as SubscriptionMap<ResourceType>
  let globalSubscription:
    | SubscribeCallback<ResourceType>
    | undefined = undefined

  // Handlers
  const set = (data: ResourceType, id: string) => {
    store[id] = data
    if (subscriptions[id]) {
      const callbacks = Object.values(subscriptions[id])
      callbacks.forEach(f =>
        f({ action: CacheActionType.set, data, id, store })
      )
    }
    if (globalSubscription) {
      globalSubscription({
        action: CacheActionType.set,
        data,
        id,
        store,
      })
    }
  }

  const get = (id: string) => {
    return store[id]
  }

  const deleteHandler = (id: string) => {
    if (store[id]) {
      const dataToDelete = store[id]
      delete store[id]
      if (subscriptions[id]) {
        const callbacks = Object.values(subscriptions[id])
        callbacks.forEach(f =>
          f({
            action: CacheActionType.delete,
            data: dataToDelete,
            id,
            store,
          })
        )
      }
      if (globalSubscription) {
        globalSubscription({
          action: CacheActionType.delete,
          data: dataToDelete,
          id,
          store,
        })
      }
      return true
    } else {
      return false
    }
  }

  const clear = () => {
    store = {} as Map<string, ResourceType>
    subscriptions = {} as SubscriptionMap<ResourceType>
    globalSubscription = undefined
  }

  const subscribe = (id: string, callback: SubscribeCallback<ResourceType>) => {
    if ('all') {
      globalSubscription = callback
      return 'all'
    }
    subId++
    if (store[id]) {
      if (subscriptions[id]) {
        subscriptions[id][subId] = callback
      } else {
        subscriptions[id] = { [subId]: callback }
      }
      return `${id}-${subId}`
    } else {
      return ''
    }
  }

  const unsubscribe = (id: string) => {
    try {
      const ids = id.split('-')
      delete subscriptions[ids[0]][ids[1]]
      if (subscriptions[ids[0]] === {}) {
        delete subscriptions[ids[0]]
      }
      return true
    } catch (e) {
      return false
    }
  }

  return {
    set,
    get,
    delete: deleteHandler,
    clear,
    subscribe,
    unsubscribe,
    ...storeConfig,
  }
}
