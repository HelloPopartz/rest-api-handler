import { mapObject } from '../utils/object'
import { CacheStore, GetIdFromResource, Resource } from '../store'
import { emitWarning, WarningCodes, createRestApiHandlerError } from '../messages'
import { RouteMap, RouteOptions, RouteDataWithName } from './routes.types'
import { NetworkClient } from './networkClient'

export type Handlers<ResourceType extends Resource, Routes extends RouteMap<ResourceType>> = {
  [P in keyof Routes]: (
    ...params: Routes[P]['handler'] extends undefined ? [] : Parameters<NonNullable<Routes[P]['handler']>>
  ) => Promise<
    NonNullable<Routes[P]['dataType']> extends 'none'
      ? any
      : NonNullable<Routes[P]['dataType']> extends 'list'
      ? ResourceType[]
      : ResourceType
  >
}

export type GetApiHandlers<
  ResourceType extends Resource,
  UserNetworkClient extends NetworkClient<any>,
  Routes extends RouteMap<ResourceType>
> = (...config: Parameters<UserNetworkClient>) => Handlers<ResourceType, Routes>

export function checkIfValidId(storeName: string, id: string | number) {
  if (id === null || id === undefined || (typeof id !== 'string' && typeof id !== 'number')) {
    emitWarning(storeName, WarningCodes.noId)
    return false
  } else {
    return true
  }
}

export function emitRequestAction<ResourceType extends Resource>(
  routeData: RouteDataWithName<ResourceType>,
  { dataType }: RouteOptions<ResourceType, any, any>,
  { dispatch, actions: { update, updateList } }: CacheStore<ResourceType>
) {
  const { resourceId } = routeData
  if (!!resourceId && dataType !== 'list') {
    dispatch(update.request({ routeData, id: resourceId }))
  } else if (dataType === 'list') {
    dispatch(updateList.request({ routeData }))
  }
}

export function emitDeleteAction<ResourceType extends Resource>(
  routeData: RouteDataWithName<ResourceType>,
  { dispatch, actions: { deleteResource } }: CacheStore<ResourceType>
) {
  const { resourceId } = routeData
  if (!resourceId) {
    return
  }
  dispatch(
    deleteResource({
      routeData,
      id: resourceId,
    })
  )
}

export function transformResource<ResourceType extends Resource>(
  response: any,
  routeData: RouteDataWithName<ResourceType>,
  { parseResponse, transformData }: RouteOptions<ResourceType, any, any>,
  { getStoreName }: CacheStore<ResourceType>,
  getIdFromResource: GetIdFromResource<ResourceType>
) {
  const { resourceId } = routeData
  const storeName = getStoreName()

  // First transform the response to check if the data we need is nested
  // For example, when the resource is under the key "result" in a list
  const responseData = !!parseResponse ? parseResponse(response, routeData) : response
  if (Array.isArray(responseData)) {
    emitWarning(storeName, WarningCodes.arrayInUpdateItem)
    return undefined
  }

  // Transform the data as defined by the user
  // For example, parsing dates
  const resourceToUpdate = !!transformData ? transformData(responseData) : responseData
  if (Array.isArray(responseData)) {
    emitWarning(storeName, WarningCodes.arrayInUpdateItem)
    return undefined
  }

  // Always prioritize the id from the response
  const id = getIdFromResource(resourceToUpdate) || resourceId
  const validId = checkIfValidId(storeName, id)

  if (validId) {
    return resourceToUpdate
  } else {
    return undefined
  }
}

export function emitUpdateItemAction<ResourceType extends Resource>(
  response: any,
  routeData: RouteDataWithName<ResourceType>,
  routeConfig: RouteOptions<ResourceType, any, any>,
  store: CacheStore<ResourceType>,
  getIdFromResource: GetIdFromResource<ResourceType>
) {
  const {
    dispatch,
    actions: { update },
  } = store
  const data = transformResource(response, routeData, routeConfig, store, getIdFromResource)
  if (!!data) {
    const id = getIdFromResource(data)
    dispatch(
      update.success({
        routeData,
        id,
        data,
      })
    )
  } else {
    dispatch(update.cancel({ routeData }))
  }
  return data
}

export function emitUpdateListAction<ResourceType extends Resource>(
  response: any,
  routeData: RouteDataWithName<ResourceType>,
  { parseResponse, ...routeConfig }: RouteOptions<ResourceType, any, any>,
  store: CacheStore<ResourceType>,
  getIdFromResource: GetIdFromResource<ResourceType>
) {
  const {
    dispatch,
    getStoreName,
    actions: { updateList },
  } = store
  const storeName = getStoreName()
  // First transform the response to check if the data we need is nested
  // For example, when the resource is under the key "result" in a list
  const responseData = !!parseResponse ? parseResponse(response, routeData) : response

  if (!Array.isArray(responseData)) {
    emitWarning(storeName, WarningCodes.arrayInUpdateItem)
    dispatch(
      updateList.cancel({
        routeData,
      })
    )
    return undefined
  }

  // We remove parseResponse from routeConfig, since it's applied only in the beginning
  const result: ResourceType[] = responseData.map((responseItemData: any) =>
    transformResource(responseItemData, routeData, routeConfig, store, getIdFromResource)
  )

  // Map array to object keyed by id
  const mapForStore = result.reduce((map, data) => {
    if (!data) {
      return map
    }
    const id = getIdFromResource(data)
    map[String(id)] = data
    return map
  }, {} as Record<string, ResourceType>)

  dispatch(
    updateList.success({
      routeData,
      data: mapForStore,
    })
  )
  return result
}

export function emitErrorAction<ResourceType extends Resource>(
  e: Error,
  routeData: RouteDataWithName<ResourceType>,
  { dataType }: RouteOptions<ResourceType, any, any>,
  { dispatch, actions: { updateList, update } }: CacheStore<ResourceType>
) {
  const { resourceId } = routeData
  if (dataType !== 'list' && !!resourceId) {
    dispatch(
      update.failure({
        routeData,
        error: e,
        id: resourceId,
      })
    )
  } else if (dataType === 'list') {
    dispatch(
      updateList.failure({
        routeData,
        error: e,
      })
    )
  }
}

function generateHandlersFromRoute<ResourceType extends Resource, UserNetworkClient extends NetworkClient<any[]>>(
  routeConfig: RouteOptions<ResourceType, any, any>,
  routeName: string | number | symbol,
  store: CacheStore<ResourceType>,
  getIdFromResource: GetIdFromResource<ResourceType>,
  networkClient: UserNetworkClient
) {
  const { handler = () => ({}), resourceUrl, method, dataType = 'item', resource } = routeConfig
  const { getStoreName } = store
  const storeName = getStoreName()

  const apiHandler = (config: Parameters<UserNetworkClient>) => {
    const networkClientWithConfig = networkClient(...config)
    return async (...params: Parameters<NonNullable<typeof handler>>) => {
      // Parse request data
      const requestData = handler(...params)
      const routeData = {
        method,
        resource,
        resourceUrl,
        ...requestData,
        name: routeName,
      }

      // If we are updating a particular entity, emit an action
      emitRequestAction(routeData, dataType, store)

      // Make api call
      try {
        const response = await networkClientWithConfig({
          method,
          resource,
          resourceUrl,
          ...requestData,
        })

        switch (dataType) {
          case 'delete':
            return emitDeleteAction(routeData, store)
          case 'item':
            return emitUpdateItemAction(response, routeData, routeConfig, store, getIdFromResource)
          default:
            return emitUpdateListAction(response, routeData, routeConfig, store, getIdFromResource)
        }
      } catch (e) {
        const internalError = createRestApiHandlerError(storeName, e.message)
        emitErrorAction(internalError, routeData, routeConfig, store)
        throw e
      }
    }
  }
  return apiHandler
}

export function createHandlers<
  ResourceType extends Resource,
  UserNetworkClient extends NetworkClient<any>,
  Routes extends RouteMap<any>
>(
  routes: Routes,
  store: CacheStore<ResourceType>,
  getIdFromResource: GetIdFromResource<ResourceType>,
  networkClient: UserNetworkClient
): {
  getApiHandlers: GetApiHandlers<ResourceType, UserNetworkClient, Routes>
} {
  const handlers = mapObject<any, Routes, any>(routes, (route, routeName) =>
    generateHandlersFromRoute<ResourceType, UserNetworkClient>(
      route,
      routeName,
      store,
      getIdFromResource,
      networkClient
    )
  )
  function getApiHandlers(...config: Parameters<UserNetworkClient>): Handlers<ResourceType, Routes> {
    return mapObject<any, typeof handlers, any>(handlers, handler => handler(config))
  }
  return {
    getApiHandlers,
  }
}
