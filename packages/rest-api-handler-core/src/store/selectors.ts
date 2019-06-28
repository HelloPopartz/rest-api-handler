import { CacheStoreData } from './createStore'

export type GetIdFromResource<ResourceType> = (
  data: ResourceType
) => string | number
export type GetResourceById<ResourceType> = (
  state: CacheStoreData<ResourceType>,
  id: string | number
) => ResourceType

export function createSelectors<ResourceType>() {
  return {
    getResourceById: (
      state: CacheStoreData<ResourceType>,
      id: string | number
    ) => {
      const resource = state[id]
      if (resource === undefined || resource === null) {
        throw new Error(
          `[rest-api-handler]: The element with id ${id} does not exit`
        )
      }
      return resource
    }
  }
}
