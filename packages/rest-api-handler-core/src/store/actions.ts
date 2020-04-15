import { RouteDataWithName } from '../routes/routes.types'

export type RestApiActionHandlers = {
  update: ReturnType<typeof createActions>['update']
  updateList: ReturnType<typeof createActions>['updateList']
  deleteResource: ReturnType<typeof createActions>['deleteResource']
  clearStore: ReturnType<typeof createActions>['clearStore']
}

function generateActionName(prefix: string, actionName: string) {
  if (prefix) {
    return `REST_API_HANDLER/${prefix.toUpperCase()}_${actionName}`
  } else {
    return `REST_API_HANDLER/${actionName}`
  }
}

export function createActions(resourceName: string = '') {
  const update = {
    request: (data: { routeData?: RouteDataWithName<any>; id: string | number }) => ({
      type: generateActionName(resourceName, 'UPDATE_REQUEST'),
      payload: data,
    }),
    success: (data: { routeData?: RouteDataWithName<any>; id: string | number; data: any }) => ({
      type: generateActionName(resourceName, 'UPDATE_SUCCESS'),
      payload: data,
    }),
    failure: (data: { routeData?: RouteDataWithName<any>; error: Error; id?: string | number }) => ({
      type: generateActionName(resourceName, 'UPDATE_FAILURE'),
      payload: data,
    }),
    cancel: (data: { routeData?: RouteDataWithName<any> }) => ({
      type: generateActionName(resourceName, 'UPDATE_CANCEL'),
      payload: data,
    }),
  }

  const updateList = {
    request: (data: { routeData?: RouteDataWithName<any> }) => ({
      type: generateActionName(resourceName, 'UPDATE_LIST_REQUEST'),
      payload: data,
    }),
    success: (data: { routeData?: RouteDataWithName<any>; data: Record<string, any> }) => ({
      type: generateActionName(resourceName, 'UPDATE_LIST_SUCCESS'),
      payload: data,
    }),
    failure: (data: { routeData?: RouteDataWithName<any>; error: Error }) => ({
      type: generateActionName(resourceName, 'UPDATE_LIST_FAILURE'),
      payload: data,
    }),
    cancel: (data: { routeData?: RouteDataWithName<any> }) => ({
      type: generateActionName(resourceName, 'UPDATE_LIST_CANCEL'),
      payload: data,
    }),
  }

  const deleteResource = (data: { routeData?: RouteDataWithName<any>; id: string | number }) => ({
    type: generateActionName(resourceName, 'DELETE'),
    payload: data,
  })

  const clearStore = () => ({
    type: generateActionName(resourceName, 'CLEAR_STORE'),
  })

  return {
    update,
    updateList,
    deleteResource,
    clearStore,
  }
}
