import queryString from 'query-string'
import { HttpClient, HttpClientRequestData } from '@rest-api-handler/core'
import es6Promise from 'es6-promise'
import 'isomorphic-fetch'

import { isEmpty } from './utils/object'

es6Promise.polyfill()

export type FetchConfig = Partial<Request>
export type FetchResponse = Response

function generateUrl({
  entityUrl,
  resource = '',
  routeParams = [],
  queryParams = {}
}: {
  entityUrl: string
  resource?: string
  routeParams?: (string | number)[]
  queryParams?: Record<string, any>
}) {
  let url = entityUrl.replace(/\/$/, '')
  if (resource) {
    url += resource
  }
  if (routeParams.length !== 0) {
    url += (routeParams.reduce(
      (result: string, currentValue: string | number) =>
        `${result}/${currentValue.toString()}`,
      ''
    ) as string).replace(/\/$/, '')
  }
  if (!!queryParams && !isEmpty(queryParams)) {
    url += `/${queryString.stringify(queryParams)}`
  }
  return url
}

export function fetchHttpClient(
  extraConfig?: FetchConfig
): HttpClient<FetchConfig> {
  return async ({
    entityUrl,
    method,
    resource,
    routeParams,
    body,
    queryParams,
    config
  }: HttpClientRequestData<FetchConfig>) => {
    // Read Fetch API
    const url = generateUrl({ entityUrl, resource, routeParams, queryParams })
    const response: FetchResponse = await window.fetch(url, {
      ...extraConfig,
      method,
      body: JSON.stringify(body),
      ...config
    } as any)
    return response.json()
  }
}
