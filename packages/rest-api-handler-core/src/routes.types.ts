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
  partialUpdate?: boolean
  entityUrl: string
  transformData?: (originalData: any) => ResourceType
}

export type RouteDataType = 'item' | 'list' | 'none'

export interface RouteOptions<
  ResourceType,
  TransformRequestFunc extends (...args: any) => RouteData = () => {},
  DataType extends RouteDataType = 'item'
> extends Partial<RouteInheritableOptions<ResourceType>> {
  handler?: TransformRequestFunc extends () => {}
    ? undefined
    : TransformRequestFunc
  resource?: string
  dataType?: DataType
  transformResponse?: (
    response: any,
    requestData: RouteData
  ) => DataType extends 'none'
    ? any
    : DataType extends 'list'
    ? ResourceType[]
    : ResourceType
  method: RouteMethod
}

export type RouteDataWithName = RouteOptions<any, any, any> & { name: string }

export type RouteMap<ResourceType> = {
  [K: string]: RouteOptions<ResourceType, any, any>
}
