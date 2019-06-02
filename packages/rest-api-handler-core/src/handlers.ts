import { mapObject } from './utils/object'
import { CacheStore } from './store'
import { HttpClient } from './httpClient'
import { Subscriptions } from './subscriptions'
import { ResourceConfig } from './createResource'

export type RoutesConfigOptions<
  ResourceType,
  ExtraRoutes extends RouteMap<ResourceType>,
  HttpClientOptions
> = {
  httpClient: HttpClient<HttpClientOptions>
  extraRoutes?: ExtraRoutes
}

export enum RouteMethod {
  get = 'GET',
  post = 'POST',
  put = 'PUT',
  patch = 'PATCH',
  delete = 'DELETE',
}

export type RouteData<HttpClientOptions = any> = {
  resourceId?: any
  body?: any
  routeParams?: any[]
  queryParams?: Object
  config?: HttpClientOptions
}

export interface RouteInheritableOptions<ResourceType> {
  entityUrl: string
}

export interface RouteOptions<
  ResourceType,
  TransformRequestFunc extends (...args: any) => RouteData = () => {},
  DataType extends 'item' | 'list' = 'item'
> extends Partial<RouteInheritableOptions<ResourceType>> {
  handler: TransformRequestFunc extends () => {}
    ? undefined
    : TransformRequestFunc
  resource?: string
  dataType?: DataType
  transformResponse?: (
    response: any,
    requestData: RouteData
  ) => DataType extends 'list' ? ResourceType[] : ResourceType
  method: RouteMethod
}

export type RouteMap<ResourceType> = {
  [K: string]: RouteOptions<ResourceType, any, any>
}

export type Handlers<ResourceType, Routes extends RouteMap<ResourceType>> = {
  [P in keyof Routes]: (
    ...params: Routes[P]['handler'] extends undefined
      ? []
      : Parameters<NonNullable<Routes[P]['handler']>>
  ) => Promise<
    Routes[P]['dataType'] extends 'list' ? ResourceType[] : ResourceType
  >
}

export function generateHandlers<
  ResourceType,
  Routes extends RouteMap<ResourceType>,
  HttpClientOptions
>({
  routes,
  httpClient,
  inheritableRouteConfig,
  store,
  subscriptionMap,
  getResourceId,
}: {
  routes: Routes
  httpClient: HttpClient<HttpClientOptions>
  inheritableRouteConfig: RouteInheritableOptions<ResourceType>
  store: CacheStore<ResourceType>
  subscriptionMap: Subscriptions<ResourceType>
  getResourceId: ResourceConfig<ResourceType>['getResourceId']
}): Handlers<ResourceType, Routes> {
  const mapRouteToHandler = <
    RouteConfig extends RouteOptions<ResourceType, any, any>
  >(
    route: RouteConfig,
    routeName: string
  ) => {
    const {
      handler,
      transformResponse,
      entityUrl = inheritableRouteConfig.entityUrl,
      method,
      dataType = 'item',
      resource,
    } = route
    const routeWithName = { ...route, name: routeName }
    const apiHandler = async (
      ...params: Parameters<NonNullable<typeof handler>>
    ) => {
      let requestData: RouteData = {}
      // Parse request data
      if (handler) {
        requestData = handler(...params)
      }
      const { resourceId } = requestData
      subscriptionMap.emit(resourceId, {
        routeData: routeWithName,
        state: 'request',
        id: resourceId,
      })
      // Make api call
      try {
        const responseData = await httpClient({
          method,
          resource,
          entityUrl,
          ...requestData,
        })
        const parsedData = transformResponse
          ? transformResponse(responseData, requestData)
          : responseData
        const storeActive = !!store && store.active
        if (storeActive) {
          const { resourceId } = requestData
          if (dataType === 'list') {
            parsedData.forEach((data: ResourceType) =>
              store.update(getResourceId(data), data)
            )
          } else {
            store.update(getResourceId(parsedData) || resourceId, parsedData)
          }
        }
        if (dataType === 'list') {
          parsedData.forEach((data: ResourceType) => {
            const id = getResourceId(data) || resourceId
            subscriptionMap.emit(id, {
              routeData: routeWithName,
              state: 'success',
              id,
              data,
            })
          })
        } else {
          const id = getResourceId(parsedData) || resourceId
          subscriptionMap.emit(id, {
            routeData: routeWithName,
            state: 'success',
            id,
            data: parsedData,
          })
        }

        return parsedData
      } catch (e) {
        subscriptionMap.emit(resourceId, {
          routeData: routeWithName,
          state: 'failure',
          id: resourceId,
        })
        throw e
      }
    }
    return apiHandler
  }
  return mapObject(routes, mapRouteToHandler) as any
}

export function generateDefaultRoutes<ResourceType>(): {
  list: RouteOptions<ResourceType, () => {}, 'list'>
  create: RouteOptions<
    ResourceType,
    (data: ResourceType) => { body: ResourceType }
  >
  get: RouteOptions<
    ResourceType,
    (id: string | number) => { routeParams: [string] }
  >
  put: RouteOptions<
    ResourceType,
    (
      id: string | number,
      data: ResourceType
    ) => { routeParams: [string]; body: ResourceType }
  >
  patch: RouteOptions<
    ResourceType,
    (
      id: string | number,
      data: Partial<ResourceType>
    ) => { routeParams: [string]; body: Partial<ResourceType> }
  >
  delete: RouteOptions<
    ResourceType,
    (id: string | number) => { routeParams: [string] }
  >
} {
  return {
    list: {
      handler: undefined,
      method: RouteMethod.get,
      dataType: 'list',
    },
    create: {
      method: RouteMethod.post,
      handler: (data: ResourceType) => ({
        body: data,
      }),
    },
    get: {
      method: RouteMethod.get,
      handler: (id: string) => ({
        routeParams: [id.toString()],
      }),
    },
    patch: {
      method: RouteMethod.patch,
      handler: (id: string | number, data: Partial<ResourceType>) => ({
        routeParams: [id.toString()],
        body: data,
      }),
    },
    put: {
      method: RouteMethod.put,
      handler: (id: string | number, data: ResourceType) => ({
        routeParams: [id.toString()],
        body: data,
      }),
    },
    delete: {
      method: RouteMethod.delete,
      handler: (id: string | number) => ({
        routeParams: [id.toString()],
      }),
    },
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
  getResourceId: ResourceConfig<ResourceType>['getResourceId'],
  store: CacheStore<ResourceType>,
  subscriptionMap: Subscriptions<ResourceType>
) {
  const handlers = generateHandlers<ResourceType, Routes, HttpClientOptions>({
    routes,
    httpClient,
    inheritableRouteConfig,
    store,
    subscriptionMap,
    getResourceId,
  })
  return handlers
}
