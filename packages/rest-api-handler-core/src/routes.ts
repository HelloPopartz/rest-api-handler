import {
  RouteMap,
  RouteInheritableOptions,
  RouteDataType,
  RouteData,
  RouteOptions,
  RouteMethod
} from './routes.types'

export function generateRoutes<
  ResourceType,
  ExtraRoutes extends RouteMap<ResourceType>
>(
  routes: ExtraRoutes,
  inheritableConfig: RouteInheritableOptions<ResourceType>
) {
  function createRoute<
    TransformRequestFunc extends (...args: any) => RouteData = () => {},
    DataType extends RouteDataType = 'item'
  >(
    route: RouteOptions<ResourceType, TransformRequestFunc, DataType>
  ): RouteOptions<ResourceType, TransformRequestFunc, DataType> {
    return {
      ...inheritableConfig,
      ...route
    }
  }

  const list = createRoute({
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
  })
  const create = createRoute({
    method: RouteMethod.post,
    handler: (data: ResourceType) => ({
      body: data
    })
  })
  const get = createRoute({
    method: RouteMethod.get,
    handler: (id: string | number) => {
      const parsedId = id.toString()
      return {
        resourceId: parsedId,
        routeParams: [parsedId]
      }
    }
  })
  const patch = createRoute({
    method: RouteMethod.patch,
    handler: (id: string | number, data: Partial<ResourceType>) => {
      const parsedId = id.toString()
      return {
        resourceId: parsedId,
        routeParams: [parsedId],
        body: data
      }
    }
  })
  const put = createRoute({
    method: RouteMethod.put,
    handler: (id: string | number, data: ResourceType) => {
      const parsedId = id.toString()
      return {
        resourceId: parsedId,
        routeParams: [parsedId],
        body: data
      }
    }
  })
  const deleteApi = createRoute({
    method: RouteMethod.delete,
    dataType: 'none',
    handler: (id: string | number) => {
      const parsedId = id.toString()
      return {
        resourceId: parsedId,
        routeParams: [parsedId]
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
