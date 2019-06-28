import { RestApiActionHandlers } from './actions'
import { CacheStoreData } from './createStore'
import { ActionWithPayload, getType, ActionPayload } from '../utils/actionTypes'

export const createReducer = <ResourceType>({
  update,
  updateList,
  clearStore,
  deleteResource
}: RestApiActionHandlers) => (
  state: CacheStoreData<ResourceType> = {},
  action: ActionWithPayload<any, any>
) => {
  switch (action.type) {
    case getType(update.success): {
      const { id, data }: ActionPayload<typeof update.success> = action.payload
      return {
        ...state,
        [id]: data
      }
    }
    case getType(updateList.success): {
      const { data }: ActionPayload<typeof updateList.success> = action.payload
      return {
        ...state,
        ...(data as Record<string, ResourceType>)
      }
    }
    case getType(deleteResource): {
      const { id }: ActionPayload<typeof deleteResource> = action.payload
      const newState = { ...state }
      delete newState[id]
      return newState
    }
    case getType(clearStore): {
      return {}
    }
    default:
      return state
  }
}
