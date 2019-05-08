import {
  RouteOptions,
  RouteMethod,
} from '../packages/rest-api-handler-core/src/handlers'
import { CacheActionType } from '../packages/rest-api-handler-core/src/store'
import { createResource } from '../packages/rest-api-handler-core/src/createResource'
import {
  defaultHttpClient,
  FetchConfig,
} from '../packages/rest-api-handler-core/src/httpClient'

type Routes = {
  barry: RouteOptions<string>
}

const extraRoutes: Routes = {
  barry: {
    method: RouteMethod.post,
    cacheAction: CacheActionType.set,
    resource: '/yuh',
    handler: undefined,
  },
}

const config = {
  entityUrl: 'hola',
  httpClient: defaultHttpClient(),
  extraRoutes,
}

const storeConfig = {
  active: true,
  getResourceId: (data: string) => data,
}

const resource = createResource<string, Routes, FetchConfig>(
  config,
  storeConfig
)
