export interface StoreConfigOptions<ResourceType> {
  active: boolean
}

export type CacheStore<ResourceType> = Readonly<{
  update: (id: string | number, data: ResourceType) => void
  get: (id: string) => ResourceType
  clear: () => void
  active: StoreConfigOptions<ResourceType>['active']
}>

export function createStore<ResourceType>(
  storeConfig: StoreConfigOptions<ResourceType>
): CacheStore<ResourceType> {
  const { active } = storeConfig
  // Store data
  let store = {} as Map<string, ResourceType>

  // Handlers
  const update = (id: string | number, data: ResourceType | undefined) => {
    if (data === undefined && store[id]) {
      delete store[id]
    } else {
      store[id] = data
    }
  }

  const get = (id: any) => {
    return store[id]
  }

  const clear = () => {
    store = {} as Map<string, ResourceType>
  }

  return {
    update,
    get,
    clear,
    active,
  }
}
