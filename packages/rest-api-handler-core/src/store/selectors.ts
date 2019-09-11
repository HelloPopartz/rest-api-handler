import { CacheStoreData, CacheStore } from './createStore'
import { createRestApiHandlerError } from '../messages'

export type GetIdFromResource<ResourceType extends { id: string | number }> = (data: ResourceType) => ResourceType['id']

export type GetResource<ResourceType extends { id: string | number }> = (
  state: CacheStoreData<ResourceType>,
  id: ResourceType['id']
) => ResourceType

export type Selectors<ResourceType extends { id: string | number }> = {
  getResource: GetResource<ResourceType>
  getIdFromResource: GetIdFromResource<ResourceType>
}

export function createSelectors<ResourceType extends { id: string | number }>({
  getStoreName,
}: CacheStore<ResourceType>): Selectors<ResourceType> {
  function getResource(state: CacheStoreData<ResourceType>, id: ResourceType['id']) {
    const resource = state[id]
    if (resource === undefined || resource === null) {
      throw createRestApiHandlerError(
        getStoreName(),
        new Error(`[rest-api-handler]: The element with id ${id} does not exit`)
      )
    }
    return resource
  }

  function getIdFromResource(data: ResourceType) {
    return data.id
  }

  return {
    getResource,
    getIdFromResource,
  }
}
