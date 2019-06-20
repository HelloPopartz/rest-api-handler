import { mapObject } from './utils/object'
import { CacheStore } from './store'
import { HttpClient } from './httpClient.types'
import { emitWarning, WarningCodes } from './warning.service'
import {
  RouteInheritableOptions,
  GetResourceId,
  RouteMap,
  RouteOptions,
  Handlers,
  RouteMethod,
  RouteData
} from './handlers.types'
import { updateResource } from './store/actions'

function generateHandlers<
  ResourceType,
  Routes extends RouteMap<ResourceType>,
  HttpClientOptions
>({
  routes,
  httpClient,
  inheritableRouteConfig,
  store,
  getResourceId
}: {
  routes: Routes
  httpClient: HttpClient<HttpClientOptions>
  inheritableRouteConfig: RouteInheritableOptions<ResourceType>
  getResourceId: GetResourceId<ResourceType>
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
      transformData = inheritableRouteConfig.transformData,
      entityUrl = inheritableRouteConfig.entityUrl,
      method,
      dataType = 'item',
      resource
    } = route
    const routeWithName = { ...route, name: routeName }
    const apiHandler = async (
      ...params: Parameters<NonNullable<typeof handler>>
    ) => {
      // Parse request data
      const requestData = handler(...params)
      const { resourceId } = requestData
      // If we are updating a particular entity, emit an action
      if (!!resourceId) {
        store.dispatch(
          updateResource.request({ routeData: routeWithName, id: resourceId })
        )
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
        if (dataType !== 'list' && !Array.isArray(parsedResponse)) {
          parsedResponse = [parsedResponse]
        }
        const result = parsedResponse.map((data: ResourceType) => {
          let parsedData = data
          if (transformData) {
            parsedData = transformData(data)
          }
          const id = getResourceId(parsedData) || resourceId
          let validId = true
          if (id === null || id === undefined) {
            emitWarning(WarningCodes.noId)
            validId = false
          } else if (typeof id !== 'string') {
            emitWarning(WarningCodes.invalidIdType, typeof id)
            validId = false
          }
          // Emit subscription
          if (validId) {
            store.dispatch(
              updateResource.success({
                routeData: routeWithName,
                id,
                data: parsedData
              })
            )
          } else {
            store.dispatch(updateResource.cancel({ routeData: routeWithName }))
          }
          // Return the data
          return parsedData
        })
        return result.length === 1 ? result[0] : result
      } catch (e) {
        store.dispatch(
          updateResource.failure({
            routeData: routeWithName,
            error: e,
            id: resourceId
          })
        )
        throw e
      }
    }
    return apiHandler
  }
  return mapObject(routes, mapRouteToHandler) as any
}

export function defaultRoutes<ResourceType>(): {
  list: RouteOptions<ResourceType, () => {}, 'list'>
  create: RouteOptions<
    ResourceType,
    (data: ResourceType) => { body: ResourceType }
  >
  get: RouteOptions<
    ResourceType,
    (id: string | number) => { resourceId: string; routeParams: [string] }
  >
  put: RouteOptions<
    ResourceType,
    (
      id: string | number,
      data: ResourceType
    ) => { resourceId: string; routeParams: [string]; body: ResourceType }
  >
  patch: RouteOptions<
    ResourceType,
    (
      id: string | number,
      data: Partial<ResourceType>
    ) => {
      resourceId: string
      routeParams: [string]
      body: Partial<ResourceType>
    }
  >
  delete: RouteOptions<
    ResourceType,
    (id: string | number) => { resourceId: string; routeParams: [string] }
  >
} {
  return {
    list: {
      method: RouteMethod.get,
      dataType: 'list',
      transformResponse: (response: any) => {
        if (!!response && Array.isArray(response)) {
          return response
        } else if (!!response.results && Array.isArray(response.results)) {
          return response.results
        }
        return []
      }
    },
    create: {
      method: RouteMethod.post,
      handler: (data: ResourceType) => ({
        body: data
      })
    },
    get: {
      method: RouteMethod.get,
      handler: (id: string | number) => {
        const parsedId = id.toString()
        return {
          resourceId: parsedId,
          routeParams: [parsedId]
        }
      }
    },
    patch: {
      method: RouteMethod.patch,
      handler: (id: string | number, data: Partial<ResourceType>) => {
        const parsedId = id.toString()
        return {
          resourceId: parsedId,
          routeParams: [parsedId],
          body: data
        }
      }
    },
    put: {
      method: RouteMethod.put,
      handler: (id: string | number, data: ResourceType) => {
        const parsedId = id.toString()
        return {
          resourceId: parsedId,
          routeParams: [parsedId],
          body: data
        }
      }
    },
    delete: {
      method: RouteMethod.delete,
      handler: (id: string | number) => {
        const parsedId = id.toString()
        return {
          resourceId: parsedId,
          routeParams: [parsedId]
        }
      }
    }
  }
}

export function createHandlers<
  ResourceType,
  Routes extends RouteMap<ResourceType>,
  HttpClientOptions
>(
  {
    httpClient,
    ...inheritableRouteConfig
  }: { httpClient: HttpClient<HttpClientOptions> } & RouteInheritableOptions<
    ResourceType
  >,
  routes: Routes,
  getResourceId: GetResourceId<ResourceType>,
  store: CacheStore<ResourceType>
) {
  const handlers = generateHandlers<ResourceType, Routes, HttpClientOptions>({
    routes,
    httpClient,
    inheritableRouteConfig,
    store,
    getResourceId
  })
  return handlers
}
