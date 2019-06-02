import { RouteOptions, RouteData } from './handlers'
import queryString from 'query-string'
import { isEmpty } from './utils/object'

export type HttpClientRequestData<HttpClientOptions> = {
  entityUrl: string
} & Pick<RouteOptions<any, () => {}, any>, 'method' | 'resource'> &
  RouteData<HttpClientOptions>

export type HttpClient<HttpClientOptions> = (
  requestData: HttpClientRequestData<HttpClientOptions>
) => Promise<any>

export type FetchConfig = Partial<Request>
export type FetchResponse = Response

export function generateUrl({
  entityUrl,
  resource = '',
  routeParams = [],
  queryParams = {},
}: {
  entityUrl: string
  resource?: string
  routeParams?: (string | number)[]
  queryParams?: Object
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

export function defaultHttpClient(
  extraConfig?: FetchConfig
): HttpClient<FetchConfig> {
  return async ({
    entityUrl,
    method,
    resource,
    routeParams,
    body,
    queryParams,
    config,
  }: HttpClientRequestData<FetchConfig>) => {
    // Read Fetch API
    const url = generateUrl({ entityUrl, resource, routeParams, queryParams })
    const response: FetchResponse = await window.fetch(url, {
      ...extraConfig,
      method,
      body: JSON.stringify(body),
      ...config,
    } as any)
    return response.json()
  }
}
