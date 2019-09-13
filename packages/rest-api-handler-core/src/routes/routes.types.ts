import { Resource } from '../store'

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
  ResourceType extends Resource,
  TransformRequestFunc extends (...args: any) => RouteData<ResourceType>,
  DataType extends RouteDataType = 'item'
> extends RouteInheritableOptions<ResourceType> {
  handler?: TransformRequestFunc
  resource?: string
  dataType?: DataType
  parseResponse?: (
    response: any,
    requestData: RouteData<ResourceType>
  ) => DataType extends 'none' ? any : DataType extends 'list' ? ResourceType[] : ResourceType
  method: RouteMethod
}

export type RouteData<ResourceType> = {
  resourceId?: any
  body?: any
  routeParams?: any[]
  queryParams?: Record<string, any>
}

export type RouteDataWithName<ResourceType extends Resource> = RouteData<ResourceType> & { name: string }

export type RouteMap<ResourceType extends Resource> = {
  [K: string]: RouteOptions<ResourceType, any, any>
}
