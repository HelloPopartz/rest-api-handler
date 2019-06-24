import { CacheStore } from './createStore'

export type GetIdFromResource<ResourceType> = (data: ResourceType) => string

export function createSelectors<ResourceType>(store: CacheStore<ResourceType>) {
  return {
    getResourceById: (id: string) => {
      const resource = store.getState()[id]
      if (resource === undefined || resource === null) {
        throw new Error(
          `[rest-api-handler]: The element with ${id} does not exit`
        )
      }
      return resource
    }
  }
}
