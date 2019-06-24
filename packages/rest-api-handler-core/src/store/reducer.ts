import { RestApiActions } from './actions'
import { CacheStoreData } from './createStore'

export const reducer = <ResourceType>(
  state: CacheStoreData<ResourceType> = {},
  action: RestApiActions
) => {
  switch (action.type) {
    case 'UPDATE_RESOURCE_SUCCESS': {
      const { id, data } = action.payload
      return {
        ...state,
        [id]: data
      }
    }
    case 'UPDATE_RESOURCE_LIST_SUCCESS': {
      const { data } = action.payload
      return {
        ...state,
        ...(data as Record<string, ResourceType>)
      }
    }
    case 'CLEAR_STORE': {
      return {}
    }
    default:
      return state
  }
}
