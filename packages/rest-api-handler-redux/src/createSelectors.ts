import { REST_API_STORE_ID } from './restStoreEnhancer.types'

export type GetAllResources<ResourceType> = (
  state: any
) => Record<string | number, ResourceType>

export function createSelectors<ResourceType>(storeId: string) {
  const getAllResources: GetAllResources<ResourceType> = state => {
    return state[REST_API_STORE_ID][storeId]
  }
  return {
    getAllResources
  }
}
