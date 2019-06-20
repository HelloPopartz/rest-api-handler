import { RouteDataWithName } from '../handlers.types'

type Action<Type> = {
  type: Type
}

type ActionWithPayload<Type, Payload = any> = {
  type: Type
  payload: Payload
}

export type UpdateResourceAction = {
  request: (data: {
    routeData: RouteDataWithName
    id: string
  }) => ActionWithPayload<
    'UPDATE_RESOURCE_REQUEST',
    { routeData: RouteDataWithName; id: string }
  >
  success: (data: {
    routeData: RouteDataWithName
    id: string
    data: any
  }) => ActionWithPayload<
    'UPDATE_RESOURCE_SUCCESS',
    { routeData: RouteDataWithName; id: string; data: any }
  >
  failure: (data: {
    routeData: RouteDataWithName
    error: Error
    id?: string
  }) => ActionWithPayload<
    'UPDATE_RESOURCE_FAILURE',
    { routeData: RouteDataWithName; error: Error; id?: string }
  >
  cancel: (data: {
    routeData: RouteDataWithName
  }) => ActionWithPayload<
    'UPDATE_RESOURCE_CANCEL',
    { routeData: RouteDataWithName }
  >
}

export const updateResource: UpdateResourceAction = {
  request: data => ({ type: 'UPDATE_RESOURCE_REQUEST', payload: data }),
  success: data => ({ type: 'UPDATE_RESOURCE_SUCCESS', payload: data }),
  failure: data => ({ type: 'UPDATE_RESOURCE_FAILURE', payload: data }),
  cancel: data => ({ type: 'UPDATE_RESOURCE_CANCEL', payload: data })
}

type ClearStoreAction = () => Action<'CLEAR_STORE'>
export const clearStore: ClearStoreAction = () => ({ type: 'CLEAR_STORE' })

export type RestApiActions =
  | ReturnType<UpdateResourceAction[keyof UpdateResourceAction]>
  | ReturnType<ClearStoreAction>
