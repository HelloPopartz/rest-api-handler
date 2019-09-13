import queryString from 'query-string'
import { createNetworkClient } from '@rest-api-handler/core'
import es6Promise from 'es6-promise'
import 'isomorphic-fetch'

import { isEmpty } from './utils/object'

es6Promise.polyfill()

export type FetchConfig = Partial<Request>
export type FetchResponse = Response

function generateUrl({
  resourceUrl,
  resource = '',
  resourceId,
  routeParams = [],
  queryParams = {},
}: {
  resourceUrl: string
  resource?: string
  resourceId?: string | number
  routeParams?: (string | number)[]
  queryParams?: Record<string, any>
}) {
  let url = resourceUrl.replace(/\/$/, '')
  if (resource) {
    url += resource
  }
  if (resourceId) {
    url += `/${resourceId.toString()}`
  }
  if (routeParams.length !== 0) {
    url += (routeParams.reduce(
      (result: string, currentValue: string | number) => `${result}/${currentValue.toString()}`,
      ''
    ) as string).replace(/\/$/, '')
  }
  if (!!queryParams && !isEmpty(queryParams)) {
    url += `/${queryString.stringify(queryParams)}`
  }
  return url
}

export const fetchHttpClient = createNetworkClient(
  (config?: FetchConfig) => async ({ resourceUrl, method, resource, routeParams, body, queryParams, resourceId }) => {
    // Read Fetch API
    const url = generateUrl({
      resourceUrl,
      resourceId,
      resource,
      routeParams,
      queryParams,
    })
    const response: FetchResponse = await window.fetch(url, {
      method,
      body: JSON.stringify(body),
      ...config,
    } as any)
    return response.json()
  }
)

export type FetchHttpClient = typeof fetchHttpClient
