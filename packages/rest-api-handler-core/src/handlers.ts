import { mapObject } from './utils/object'
import {
  CacheActionConfig,
  CacheActionType,
  CacheDataType,
  CacheStore,
} from './store'
import { CreateResourceOptions } from './createResource'
import { HttpClient } from './httpClient'

export enum RouteMethod {
  get = 'get',
  post = 'post',
  put = 'put',
  delete = 'delete',
}

export type RouteData<RouteParams, BodyData, QueryParams, HttpClientOptions> = {
  body?: BodyData
  routeParams?: RouteParams
  queryParams?: QueryParams
  config?: HttpClientOptions
}

export interface RouteInheritableOptions<ResourceType> {
  entityUrl: string
  transformResponse?: (response: any) => ResourceType
}

export interface RouteOptions<
  ResourceType,
  TransformRequestFunc extends (
    ...args: any
  ) => {
    body?: any
    routeParams?: any[]
    queryParams?: Object
    config?: any
  }
> extends Partial<RouteInheritableOptions<ResourceType>> {
  publicApi?: TransformRequestFunc
  resource?: string
  method: RouteMethod
  cacheConfig?: CacheActionConfig
}

export type RouteMap = {
  [K: string]: RouteOptions<any, any>
}

export type Handlers<Routes extends RouteMap> = {
  [P in keyof Routes]: (
    ...params: Parameters<NonNullable<Routes[P]['publicApi']>>
  ) => Promise<ReturnType<NonNullable<Routes[P]['transformResponse']>>>
}

export function generateHandlers<
  ResourceType,
  Routes extends RouteMap,
  HttpClientOptions,
  ResponseType
>({
  routes,
  httpClient,
  inheritableRouteConfig,
  store,
}: {
  routes: Routes
  httpClient: HttpClient<HttpClientOptions, ResponseType>
  inheritableRouteConfig: RouteInheritableOptions<ResourceType>
  store: CacheStore<ResourceType>
}): Handlers<Routes> {
  const mapRouteToHandler = <
    RouteConfig extends RouteOptions<ResourceType, any>
  >({
    publicApi,
    transformResponse = inheritableRouteConfig.transformResponse,
    entityUrl = inheritableRouteConfig.entityUrl,
    method,
    resource,
  }: RouteConfig) => {
    const handler = async (
      ...params: Parameters<NonNullable<typeof publicApi>>
    ) => {
      let requestData = {}
      if (publicApi) {
        requestData = publicApi(...params)
      }
      const data = await httpClient({
        method,
        resource,
        entityUrl,
        ...requestData,
      })
      return transformResponse ? transformResponse(data) : data
    }
    return handler
  }
  return mapObject(routes, mapRouteToHandler) as any
}

function generateDefaultRoutes<ResourceType>(): {
  list: RouteOptions<ResourceType[], () => {}>
  create: RouteOptions<
    ResourceType,
    (data: ResourceType) => { body: ResourceType }
  >
  get: RouteOptions<ResourceType, (id: number) => { routeParams: [number] }>
  update: RouteOptions<
    ResourceType,
    (id: number, data: ResourceType) => { routeParams: [number] }
  >
  delete: RouteOptions<ResourceType, (id: number) => { routeParams: [number] }>
} {
  return {
    list: {
      method: RouteMethod.get,
      cacheConfig: {
        dataType: CacheDataType.list,
        responseType: CacheActionType.set,
      },
    },
    create: {
      method: RouteMethod.post,
      cacheConfig: {
        dataType: CacheDataType.item,
        responseType: CacheActionType.update,
      },
      publicApi: (data: ResourceType) => ({
        body: data,
      }),
    },
    get: {
      method: RouteMethod.get,
      cacheConfig: {
        dataType: CacheDataType.item,
        responseType: CacheActionType.set,
      },
      publicApi: (id: number) => ({
        routeParams: [id],
      }),
    },
    update: {
      method: RouteMethod.put,
      cacheConfig: {
        dataType: CacheDataType.item,
        responseType: CacheActionType.update,
      },
      publicApi: (id: number, data: ResourceType) => ({
        routeParams: [id],
        body: data,
      }),
    },
    delete: {
      method: RouteMethod.delete,
      cacheConfig: {
        dataType: CacheDataType.item,
        responseType: CacheActionType.delete,
      },
      publicApi: (id: number) => ({
        routeParams: [id],
      }),
    },
  }
}

export function createHandlers<
  ResourceType,
  ExtraRoutes extends RouteMap,
  HttpClientOptions,
  ResponseType
>(
  {
    httpClient,
    routes = {} as ExtraRoutes,
    ...inheritableRouteConfig
  }: CreateResourceOptions<
    ResourceType,
    ExtraRoutes,
    HttpClientOptions,
    ResponseType
  >,
  store: CacheStore<ResourceType>
) {
  const finalRoutes = {
    ...generateDefaultRoutes<ResourceType>(),
    ...routes,
  }
  const handlers = generateHandlers<
    ResourceType,
    typeof finalRoutes,
    HttpClientOptions,
    ResponseType
  >({
    routes: finalRoutes,
    httpClient,
    inheritableRouteConfig,
    store,
  })
  return handlers
}
