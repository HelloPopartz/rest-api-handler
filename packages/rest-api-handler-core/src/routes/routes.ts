import { RouteMap, RouteInheritableOptions, RouteDataType, RouteData, RouteOptions, RouteMethod } from './routes.types'
import { Omit } from '../utils/types'
import { Resource } from '../store'

export function createRoute<
  ResourceType extends Resource,
  DataType extends RouteDataType,
  TransformRequestFunc extends (...args: any) => RouteData<ResourceType> = () => {}
>(
  route: RouteOptions<ResourceType, TransformRequestFunc, DataType>
): RouteOptions<ResourceType, TransformRequestFunc, DataType> {
  return route
}

export function generateRoutes<ResourceType extends Resource, ExtraRoutes extends RouteMap<ResourceType>>(
  routes: ExtraRoutes,
  inheritableConfig: RouteInheritableOptions<ResourceType>
) {
  function createDefaultRoute<
    DataType extends RouteDataType,
    TransformRequestFunc extends (...args: any) => RouteData<ResourceType> = () => {}
  >(
    route: Omit<RouteOptions<ResourceType, TransformRequestFunc, DataType>, 'resourceUrl'>
  ): RouteOptions<ResourceType, TransformRequestFunc, DataType> {
    return {
      ...inheritableConfig,
      ...route,
    }
  }

  const list = createDefaultRoute({
    method: RouteMethod.get,
    dataType: 'list',
    parseResponse: (response: any): ResourceType[] => {
      if (!!response && Array.isArray(response)) {
        return response
      } else if (!!response.results && Array.isArray(response.results)) {
        return response.results
      }
      return []
    },
  })
  const create = createDefaultRoute({
    method: RouteMethod.post,
    dataType: 'item',
    handler: (data: Omit<ResourceType, 'id'>) => ({
      body: data,
    }),
  })
  const get = createDefaultRoute({
    method: RouteMethod.get,
    dataType: 'item',
    handler: (id: ResourceType['id']) => {
      const parsedId = id
      return {
        resourceId: parsedId,
      }
    },
  })
  const patch = createDefaultRoute({
    method: RouteMethod.patch,
    dataType: 'item',
    handler: (id: ResourceType['id'], data: Partial<ResourceType>) => {
      const parsedId = id
      return {
        resourceId: parsedId,
        body: data,
      }
    },
  })
  const put = createDefaultRoute({
    method: RouteMethod.put,
    dataType: 'item',
    handler: (id: ResourceType['id'], data: ResourceType) => {
      const parsedId = id
      return {
        resourceId: parsedId,
        body: data,
      }
    },
  })
  const remove = createDefaultRoute({
    method: RouteMethod.delete,
    dataType: 'none',
    handler: (id: ResourceType['id']) => {
      const parsedId = id
      return {
        resourceId: parsedId,
      }
    },
  })

  const extraRoutes = {}
  Object.keys(routes).forEach(routeKey => {
    extraRoutes[routeKey] = {
      ...inheritableConfig,
      ...routes[routeKey],
    }
  })

  return {
    list,
    get,
    put,
    patch,
    create,
    remove,
    ...(extraRoutes as ExtraRoutes),
  }
}
