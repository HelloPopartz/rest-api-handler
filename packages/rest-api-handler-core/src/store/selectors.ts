import { CacheStoreData } from './createStore'

export type GetIdFromResource<ResourceType extends { id: string | number }> = (
  data: ResourceType
) => ResourceType['id']
export type GetResourceById<ResourceType extends { id: string | number }> = (
  state: CacheStoreData<ResourceType>,
  id: ResourceType['id']
) => ResourceType

export function createSelectors<
  ResourceType extends { id: string | number }
>() {
  return {
    getIdFromResource: (data: ResourceType) => data.id,
    getResourceById: (
      state: CacheStoreData<ResourceType>,
      id: ResourceType['id']
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
