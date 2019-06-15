import { RouteOptions } from './handlers.types'

export type EmitArguments<ResourceType> = {
  routeData: RouteOptions<ResourceType> & { name: string }
  state: 'request' | 'success' | 'failure'
  data?: ResourceType
  id?: string
}
export type SubscribeCallback<ResourceType> = (
  params: EmitArguments<ResourceType>
) => void

export type Subscriptions<ResourceType> = Readonly<{
  clear: () => void
  emit: (id: string, params: EmitArguments<ResourceType>) => void
  subscribe: (id: string, callback: SubscribeCallback<ResourceType>) => string
  unsubscribe: (id: string) => boolean
}>

type SubscriptionMap<ResourceType> = {
  [key: string]: { [key: string]: SubscribeCallback<ResourceType> }
}

export function createSubscriptionMap<ResourceType>(): Subscriptions<
  ResourceType
> {
  // Store data
  let subId = 0
  let subscriptions = {} as SubscriptionMap<ResourceType>
  let globalSubscription: SubscribeCallback<ResourceType> | undefined

  // Handlers
  const clear = () => {
    subscriptions = {} as SubscriptionMap<ResourceType>
    globalSubscription = undefined
  }

  const emit = (id: string, params: EmitArguments<ResourceType>) => {
    if (subscriptions[id] && id !== 'all') {
      const callbacks = Object.values(subscriptions[id])
      callbacks.forEach(f => f(params))
    }
    if (globalSubscription) {
      globalSubscription(params)
    }
  }

  const subscribe = (id: string, callback: SubscribeCallback<ResourceType>) => {
    if (id === 'all') {
      globalSubscription = callback
      return 'all'
    }
    subId++
    if (subscriptions[id]) {
      subscriptions[id][subId] = callback
    } else {
      subscriptions[id] = { [subId]: callback }
    }
    return `${id}-${subId}`
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
    clear,
    subscribe,
    unsubscribe,
    emit
  }
}
