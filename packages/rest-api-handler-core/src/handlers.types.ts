import { HttpClient } from './httpClient.types'

export type GetResourceId<ResourceType> = (data: ResourceType) => string

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
  delete = 'DELETE'
}

export type RouteData<HttpClientOptions = any> = {
  resourceId?: any
  body?: any
  routeParams?: any[]
  queryParams?: Record<string, any>
  config?: HttpClientOptions
}

export interface RouteInheritableOptions<ResourceType> {
  entityUrl: string
  transformData?: (originalData: any) => ResourceType
}

export interface RouteOptions<
  ResourceType,
  TransformRequestFunc extends (...args: any) => RouteData = () => {},
  DataType extends 'item' | 'list' = 'item'
> extends Partial<RouteInheritableOptions<ResourceType>> {
  handler?: TransformRequestFunc extends () => {}
    ? undefined
    : TransformRequestFunc
  resource?: string
  dataType?: DataType
  transformResponse?: (
    response: any,
    requestData: RouteData
  ) => DataType extends 'list' ? any[] : any
  method: RouteMethod
}

export type RouteDataWithName = RouteOptions<any, any, any> & { name: string }

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
