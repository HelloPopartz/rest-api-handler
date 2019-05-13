import { mapObject } from './utils/object'
import { CacheActionType, CacheStore } from './store'
import { HttpClient } from './httpClient'

export enum RouteMethod {
  get = 'GET',
  post = 'POST',
  put = 'PUT',
  patch = 'PATCH',
  delete = 'DELETE',
}

export type RouteData<HttpClientOptions = any> = {
  body?: any
  routeParams?: any[]
  queryParams?: Object
  config?: HttpClientOptions
}

export interface RouteInheritableOptions {
  entityUrl: string
}

export interface RouteOptions<
  ResourceType,
  TransformRequestFunc extends (...args: any) => RouteData = () => {},
  DataType extends 'item' | 'list' = 'item'
> extends Partial<RouteInheritableOptions> {
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
  cacheAction?: CacheActionType
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

function saveInStore<ResourceType>(
  { delete: deleteHandler, set, getResourceId }: CacheStore<ResourceType>,
  { action, data }: { action: CacheActionType; data: ResourceType }
) {
  switch (action) {
    case CacheActionType.delete:
      deleteHandler(getResourceId(data))
      break
    case CacheActionType.set:
      set(data, getResourceId(data))
      break
  }
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
}: {
  routes: Routes
  httpClient: HttpClient<HttpClientOptions>
  inheritableRouteConfig: RouteInheritableOptions
  store: CacheStore<ResourceType>
}): Handlers<ResourceType, Routes> {
  const mapRouteToHandler = <
    RouteConfig extends RouteOptions<ResourceType, any, any>
  >({
    handler,
    transformResponse,
    entityUrl = inheritableRouteConfig.entityUrl,
    method,
    dataType = 'item',
    resource,
    cacheAction,
  }: RouteConfig) => {
    const apiHandler = async (
      ...params: Parameters<NonNullable<typeof handler>>
    ) => {
      let requestData = {}
      // Parse request data
      if (handler) {
        requestData = handler(...params)
      }
      // Make api call
      const data = await httpClient({
        method,
        resource,
        entityUrl,
        ...requestData,
      })
      const parsedData = transformResponse
        ? transformResponse(data, requestData)
        : data
      const storeActive = store.active && !!store.getResourceId
      if (storeActive && !!cacheAction) {
        if (dataType === 'list') {
          parsedData.forEach((data: ResourceType) =>
            saveInStore(store, { action: cacheAction, data })
          )
        } else {
          saveInStore(store, { action: cacheAction, data: parsedData })
        }
      }
      return parsedData
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
      cacheAction: CacheActionType.set,
      dataType: 'list',
    },
    create: {
      method: RouteMethod.post,
      cacheAction: CacheActionType.set,
      handler: (data: ResourceType) => ({
        body: data,
      }),
    },
    get: {
      method: RouteMethod.get,
      cacheAction: CacheActionType.set,
      handler: (id: string | number) => ({
        routeParams: [id.toString()],
      }),
    },
    patch: {
      method: RouteMethod.patch,
      cacheAction: CacheActionType.set,
      handler: (id: string | number, data: Partial<ResourceType>) => ({
        routeParams: [id.toString()],
        body: data,
      }),
    },
    put: {
      method: RouteMethod.put,
      cacheAction: CacheActionType.set,
      handler: (id: string | number, data: ResourceType) => ({
        routeParams: [id.toString()],
        body: data,
      }),
    },
    delete: {
      method: RouteMethod.delete,
      cacheAction: CacheActionType.delete,
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
  }: { httpClient: HttpClient<HttpClientOptions> } & RouteInheritableOptions,
  routes: Routes,
  store: CacheStore<ResourceType>
) {
  const handlers = generateHandlers<ResourceType, Routes, HttpClientOptions>({
    routes,
    httpClient,
    inheritableRouteConfig,
    store,
  })
  return handlers
}
