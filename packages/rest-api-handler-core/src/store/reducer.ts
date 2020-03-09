import { RestApiActionHandlers } from './actions'
import { CacheStoreData, CacheStoreConfig } from './createStore'
import { ActionWithPayload, getType, ActionPayload } from '../utils/actionTypes'
import { Resource } from './types'

export const createReducer = <ResourceType extends Resource>(
  { update, updateList, clearStore, deleteResource }: RestApiActionHandlers,
  { initialData = {} as CacheStoreData<ResourceType>, partialUpdate }: CacheStoreConfig<ResourceType>
) => (
  state: CacheStoreData<ResourceType> = initialData,
  action: ActionWithPayload<any, any>
): CacheStoreData<ResourceType> => {
  switch (action.type) {
    case getType(update.success): {
      const { id, data }: ActionPayload<typeof update.success> = action.payload
      return {
        ...state,
        [id]: partialUpdate ? { ...state[id], ...data } : data,
      }
    }
    case getType(updateList.success): {
      const { data }: ActionPayload<typeof updateList.success> = action.payload
      if (partialUpdate) {
        const newState = {} as Record<ResourceType['id'], ResourceType>
        Object.keys(data).forEach(id => {
          const savedData = state[id] || {}
          newState[id] = { ...savedData, ...data[id] }
        })
        return { ...state, ...newState }
      } else {
        return {
          ...state,
          ...(data as Record<string, ResourceType>),
        }
      }
    }
    case getType(deleteResource): {
      const { id }: ActionPayload<typeof deleteResource> = action.payload
      const newState = { ...state }
      delete newState[id]
      return newState
    }
    case getType(clearStore): {
      return {} as CacheStoreData<ResourceType>
    }
    default:
      return state
  }
}
