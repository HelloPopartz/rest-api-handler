import { mapObject } from './utils/object'
import { CacheStore, GetIdFromResource } from './store'
import { emitWarning, WarningCodes } from './warning.service'
import { RouteMap, RouteFinalOptions } from './routes.types'

export type Handlers<ResourceType, Routes extends RouteMap<ResourceType>> = {
  [P in keyof Routes]: (
    ...params: Routes[P]['handler'] extends undefined
      ? []
      : Parameters<NonNullable<Routes[P]['handler']>>
  ) => Promise<ReturnType<NonNullable<Routes[P]['parseResponse']>>>
}

export function checkIfValidId(id: string | number) {
  if (id === null || id === undefined) {
    emitWarning(WarningCodes.noId)
    return false
  } else {
    return true
  }
}

function generateHandlersFromRoutes<
  ResourceType extends { id: string | number },
  Routes extends RouteMap<ResourceType>
>({
  routes,
  store: {
    dispatch,
    getState,
    actions: { update, updateList, deleteResource }
  },
  getIdFromResource
}: {
  routes: Routes
  getIdFromResource: GetIdFromResource<ResourceType>
  store: CacheStore<ResourceType>
}): Handlers<ResourceType, Routes> {
  const mapRouteToHandler = <
    RouteConfig extends RouteFinalOptions<ResourceType, any, any>
  >(
    route: RouteConfig,
    routeName: string
  ) => {
    const {
      handler = () => {},
      parseResponse,
      transformData,
      partialUpdate,
      resourceUrl,
      method,
      httpClient,
      dataType = 'item',
      resource
    } = route

    const apiHandler = async (
      ...params: Parameters<NonNullable<typeof handler>>
    ) => {
      // Parse request data
      const requestData = handler(...params) || {}
      const { resourceId } = requestData
      const routeWithName = {
        ...requestData,
        method,
        resource,
        resourceUrl,
        name: routeName
      }
      // If we are updating a particular entity, emit an action
      if (!!resourceId && dataType !== 'list') {
        dispatch(update.request({ routeData: routeWithName, id: resourceId }))
      } else if (dataType === 'list') {
        dispatch(updateList.request({ routeData: routeWithName }))
      }

      // Make api call
      try {
        const responseData = await httpClient({
          method,
          resource,
          resourceUrl,
          ...requestData
        })
        // First transform the response to check if the data we need is nested
        // For example, when the resources are under the key "results" in a list
        let parsedResponse = parseResponse
          ? parseResponse(responseData, requestData)
          : responseData
        // Transform the items of the response into id and data
        if (dataType === 'delete' && !!resourceId) {
          dispatch(
            deleteResource({
              routeData: routeWithName,
              id: resourceId
            })
          )
        } else if (dataType === 'item') {
          let result = parsedResponse
          if (transformData) {
            result = transformData(parsedResponse)
          }
          const id = getIdFromResource(result) || resourceId
          const validId = checkIfValidId(id)
          // Emit subscription
          if (validId) {
            result = partialUpdate ? { ...getState()[id], ...result } : result
            dispatch(
              update.success({
                routeData: routeWithName,
                id,
                data: result
              })
            )
          } else {
            dispatch(update.cancel({ routeData: routeWithName }))
          }
          return result
        } else if (dataType === 'list') {
          const result: ResourceType[] = []
          const mapForStore: Record<string, ResourceType> = {}
          parsedResponse.forEach((data: ResourceType) => {
            let parsedData = data
            if (transformData) {
              parsedData = transformData(data)
            }
            const id = getIdFromResource(data) || resourceId
            const validId = checkIfValidId(id)
            // Emit subscription
            if (validId) {
              mapForStore[id] = parsedData
            }
            result.push(parsedData)
          })
          dispatch(
            updateList.success({
              routeData: routeWithName,
              data: mapForStore
            })
          )
          return result
        }
      } catch (e) {
        if (dataType !== 'list' && !!resourceId) {
          dispatch(
            update.failure({
              routeData: routeWithName,
              error: e,
              id: resourceId
            })
          )
        } else if (dataType === 'list') {
          dispatch(
            updateList.failure({
              routeData: routeWithName,
              error: e
            })
          )
        }
        console.error(e)
        throw e
      }
    }
    return apiHandler
  }
  return mapObject(routes, mapRouteToHandler) as any
}

export function createHandlers<
  ResourceType extends { id: string | number },
  Routes extends RouteMap<any>
>(
  routes: Routes,
  getIdFromResource: GetIdFromResource<ResourceType>,
  store: CacheStore<ResourceType>
) {
  const handlers = generateHandlersFromRoutes<ResourceType, Routes>({
    routes,
    store,
    getIdFromResource
  })
  return handlers
}
