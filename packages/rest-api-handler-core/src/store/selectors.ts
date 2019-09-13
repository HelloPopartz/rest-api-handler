import { CacheStoreData, CacheStore } from './createStore'
import { createRestApiHandlerError } from '../messages'
import { Resource } from './types'

export type GetIdFromResource<ResourceType extends Resource> = (data: ResourceType) => ResourceType['id']

export type GetResource<ResourceType extends Resource> = (
  state: CacheStoreData<ResourceType>,
  id: ResourceType['id']
) => ResourceType

export type Selectors<ResourceType extends Resource> = {
  getResource: GetResource<ResourceType>
  getIdFromResource: GetIdFromResource<ResourceType>
}

export function createSelectors<ResourceType extends Resource>({
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
