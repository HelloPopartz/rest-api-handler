import { mapObject } from './utils/object'
import { CacheStore, GetIdFromResource } from './store'
import { HttpClient } from './httpClient.types'
import { emitWarning, WarningCodes } from './warning.service'
import { updateResource, updateResourceList } from './store/actions'
import { RouteMap, RouteOptions } from './routes.types'

export type Handlers<ResourceType, Routes extends RouteMap<ResourceType>> = {
  [P in keyof Routes]: (
    ...params: Routes[P]['handler'] extends undefined
      ? []
      : Parameters<NonNullable<Routes[P]['handler']>>
  ) => Promise<ReturnType<NonNullable<Routes[P]['transformResponse']>>>
}

function checkIfValidId(id: string) {
  if (id === null || id === undefined) {
    emitWarning(WarningCodes.noId)
    return false
  } else if (typeof id !== 'string') {
    emitWarning(WarningCodes.invalidIdType, typeof id)
    return false
  } else {
    return true
  }
}

function generateHandlersFromRoutes<
  ResourceType,
  Routes extends RouteMap<ResourceType>,
  HttpClientOptions
>({
  routes,
  httpClient,
  store,
  getIdFromResource
}: {
  routes: Routes
  httpClient: HttpClient<HttpClientOptions>
  getIdFromResource: GetIdFromResource<ResourceType>
  store: CacheStore<ResourceType>
}): Handlers<ResourceType, Routes> {
  const mapRouteToHandler = <
    RouteConfig extends RouteOptions<ResourceType, any, any>
  >(
    route: RouteConfig,
    routeName: string
  ) => {
    const {
      handler = () => {},
      transformResponse,
      transformData,
      partialUpdate,
      entityUrl,
      method,
      dataType = 'item',
      resource
    } = route
    const routeWithName = { ...route, name: routeName }
    const apiHandler = async (
      ...params: Parameters<NonNullable<typeof handler>>
    ) => {
      // Parse request data
      const requestData = handler(...params) || {}
      const { resourceId } = requestData
      // If we are updating a particular entity, emit an action
      if (!!resourceId && dataType !== 'list') {
        store.dispatch(
          updateResource.request({ routeData: routeWithName, id: resourceId })
        )
      } else if (dataType === 'list') {
        store.dispatch(updateResourceList.request({ routeData: routeWithName }))
      }

      // Make api call
      try {
        const responseData = await httpClient({
          method,
          resource,
          entityUrl,
          ...requestData
        })
        // First transform the response to check if the data we need is nested
        // For example, when the resources are under the key "results" in a list
        let parsedResponse = transformResponse
          ? transformResponse(responseData, requestData)
          : responseData
        // Transform the items of the response into id and data
        if (dataType !== 'list') {
          let result = parsedResponse
          if (transformData) {
            result = transformData(parsedResponse)
          }
          const id = getIdFromResource(result) || resourceId
          const validId = checkIfValidId(id)
          // Emit subscription
          if (validId) {
            result = partialUpdate
              ? { ...store.getState()[id], ...result }
              : result
            store.dispatch(
              updateResource.success({
                routeData: routeWithName,
                id,
                data: result
              })
            )
          } else if (dataType !== 'list') {
            store.dispatch(updateResource.cancel({ routeData: routeWithName }))
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
          store.dispatch(
            updateResourceList.success({
              routeData: routeWithName,
              data: mapForStore
            })
          )
          return result
        }
      } catch (e) {
        if (dataType !== 'list' && !!resourceId) {
          store.dispatch(
            updateResource.failure({
              routeData: routeWithName,
              error: e,
              id: resourceId
            })
          )
        } else if (dataType === 'list') {
          store.dispatch(
            updateResourceList.failure({
              routeData: routeWithName,
              error: e
            })
          )
        }

        throw e
      }
    }
    return apiHandler
  }
  return mapObject(routes, mapRouteToHandler) as any
}

export function createHandlers<
  ResourceType,
  Routes extends RouteMap<any>,
  HttpClientOptions
>(
  httpClient: HttpClient<HttpClientOptions>,
  routes: Routes,
  getIdFromResource: GetIdFromResource<ResourceType>,
  store: CacheStore<ResourceType>
) {
  const handlers = generateHandlersFromRoutes<
    ResourceType,
    Routes,
    HttpClientOptions
  >({
    routes,
    httpClient,
    store,
    getIdFromResource
  })
  return handlers
}
