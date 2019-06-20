import { RestResourceActions, ActionWithPayload } from './actions'
import { RestResourceStore } from './store'

export function createReducer<ResourceType>(actions: RestResourceActions) {
  return (
    state: RestResourceStore<ResourceType> = {},
    action: ActionWithPayload
  ) => {
    switch (action.type) {
      case actions.updateResource.request:
        return {}
      case actions.updateResource.success:
        return {}
      case actions.updateResource.failure:
        return {}
      default:
        return state
    }
  }
}
