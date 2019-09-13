export enum RouteMethod {
  get = 'GET',
  post = 'POST',
  put = 'PUT',
  patch = 'PATCH',
  delete = 'DELETE',
}

export interface RouteInheritableOptions<ResourceType> {
  resourceUrl?: string
  partialUpdate?: boolean
  transformData?: (originalData: any) => ResourceType
}

export type RouteDataType = 'item' | 'list' | 'none' | 'delete'

export interface RouteOptions<
  ResourceType,
  TransformRequestFunc extends (...args: any) => RouteData,
  DataType extends RouteDataType = 'item'
> extends RouteInheritableOptions<ResourceType> {
  handler?: TransformRequestFunc
  resource?: string
  dataType?: DataType
  parseResponse?: (
    response: any,
    requestData: RouteData
  ) => DataType extends 'none' ? any : DataType extends 'list' ? ResourceType[] : ResourceType
  method: RouteMethod
}

export type RouteData = {
  resourceId?: any
  body?: any
  routeParams?: any[]
  queryParams?: Record<string, any>
}

export type RouteDataWithName = RouteData & { name: string }

export type RouteMap<ResourceType> = {
  [K: string]: RouteOptions<ResourceType, any, any>
}
