import { Action } from 'redux'

export type RestResourceActions = ReturnType<typeof createActions>

export interface ActionWithPayload extends Action {
  payload: any
}

export function createActions<ResourceType>(resourceName: string) {
  return {
    updateResource: {
      request: () => ({
        type: `UPDATE_${resourceName}_RESOURCE_REQUEST`
      }),
      success: (data: ResourceType) => ({
        type: `UPDATE_${resourceName}_RESOURCE_SUCCESS`,
        payload: data
      }),
      failure: (error: Error) => ({
        type: `UPDATE_${resourceName}_RESOURCE_FAILURE`,
        payload: error
      })
    }
  }
}
