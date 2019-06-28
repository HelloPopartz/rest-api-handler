import {
  RouteMap,
  RouteInheritableOptions,
  RouteDataType,
  RouteData,
  RouteOptions,
  RouteMethod
} from './routes.types'
import { Omit } from './utils/types'

export function generateRoutes<
  ResourceType,
  ExtraRoutes extends RouteMap<ResourceType>
>(
  routes: ExtraRoutes,
  inheritableConfig: RouteInheritableOptions<ResourceType>
) {
  function createRoute<
    DataType extends RouteDataType,
    TransformRequestFunc extends (...args: any) => RouteData = () => {}
  >(
    route: Omit<
      RouteOptions<ResourceType, TransformRequestFunc, DataType>,
      'resourceUrl' | 'httpClient'
    >
  ): RouteOptions<ResourceType, TransformRequestFunc, DataType> {
    return {
      ...inheritableConfig,
      ...route
    }
  }

  const list = createRoute({
    method: RouteMethod.get,
    dataType: 'list',
    parseResponse: (response: any): ResourceType[] => {
      if (!!response && Array.isArray(response)) {
        return response
      } else if (!!response.results && Array.isArray(response.results)) {
        return response.results
      }
      return []
    }
  })
  const create = createRoute({
    method: RouteMethod.post,
    dataType: 'item',
    handler: (data: ResourceType) => ({
      body: data
    })
  })
  const get = createRoute({
    method: RouteMethod.get,
    dataType: 'item',
    handler: (id: string | number) => {
      const parsedId = id
      return {
        resourceId: parsedId
      }
    }
  })
  const patch = createRoute({
    method: RouteMethod.patch,
    dataType: 'item',
    handler: (id: string | number, data: Partial<ResourceType>) => {
      const parsedId = id
      return {
        resourceId: parsedId,
        body: data
      }
    }
  })
  const put = createRoute({
    method: RouteMethod.put,
    dataType: 'item',
    handler: (id: string | number, data: ResourceType) => {
      const parsedId = id
      return {
        resourceId: parsedId,
        body: data
      }
    }
  })
  const deleteApi = createRoute({
    method: RouteMethod.delete,
    dataType: 'none',
    handler: (id: string | number) => {
      const parsedId = id
      return {
        resourceId: parsedId
      }
    }
  })

  let extraRoutes = {}
  Object.keys(routes).forEach(routeKey => {
    extraRoutes[routeKey] = {
      ...inheritableConfig,
      ...routes[routeKey]
    }
  })

  return {
    list,
    get,
    put,
    patch,
    create,
    delete: deleteApi,
    ...(extraRoutes as ExtraRoutes)
  }
}
