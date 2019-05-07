import {
  RouteOptions,
  RouteMethod,
} from '../packages/rest-api-handler-core/src/handlers'
import {
  CacheDataType,
  CacheActionType,
} from '../packages/rest-api-handler-core/src/store'
import { createResource } from '../packages/rest-api-handler-core/src/createResource'
import {
  defaultHttpClient,
  FetchConfig,
} from '../packages/rest-api-handler-core/src/httpClient'

type Routes = {
  barry: RouteOptions<number, (data: number) => { body: number }>
}

const extraRoutes: Routes = {
  barry: {
    method: RouteMethod.post,
    cacheConfig: {
      responseType: CacheActionType.set,
      dataType: CacheDataType.item,
    },
    publicApi: (data: number) => ({
      body: data,
    }),
    resource: '/yuh',
  },
}

const config = {
  entityUrl: 'hola',
  transformResponse: (apiData: Response) => 'sickString',
  httpClient: defaultHttpClient(),
  routes: extraRoutes,
}

const resource = createResource<string, Routes, FetchConfig, Response>(config)
