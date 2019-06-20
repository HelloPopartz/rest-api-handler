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
        [id]: {
          ...state[id],
          ...data
        }
      }
    }
    case 'CLEAR_STORE': {
      return {}
    }
    default:
      return state
  }
}
