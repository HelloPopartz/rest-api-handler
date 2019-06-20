import { createActions } from './actions'
import { createReducer } from './reducer'

export type RestResourceData<ResourceType> = {
  loading: boolean
  data: ResourceType | undefined
  error: Error
}

export type RestResourceStore<ResourceType> = Record<
  string,
  RestResourceData<ResourceType>
>

export function createStore<ResourceType>(resourceName: string) {
  const actions = createActions<ResourceType>(resourceName)
  const reducer = createReducer<ResourceType>(actions)
  return {
    actions,
    reducer
  }
}
