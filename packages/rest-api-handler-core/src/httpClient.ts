import { RouteOptions, RouteData, RouteInheritableOptions } from './handlers'
import queryString from 'query-string'

export type HttpClientRequestData<HttpClientOptions> = Pick<
  RouteInheritableOptions<any>,
  'entityUrl'
> &
  Pick<RouteOptions<any, () => {}>, 'method' | 'resource'> &
  RouteData<any, any[], Object, HttpClientOptions>

export type HttpClient<HttpClientOptions, ResponseType> = (
  requestData: HttpClientRequestData<HttpClientOptions>
) => Promise<ResponseType>

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
  let url = entityUrl
  if (resource) {
    url += resource
  }
  if (routeParams.length !== 0) {
    url += routeParams.reduce(
      (result: string, currentValue: string | number) =>
        `${result}/${currentValue.toString()}`,
      '/'
    )
  }
  if (!!queryParams) {
    url += `/${queryString.stringify(queryParams)}`
  }

  return url
}

export function defaultHttpClient(
  extraConfig?: FetchConfig
): HttpClient<FetchConfig, FetchResponse> {
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
    const response: FetchResponse = await window.fetch({
      ...extraConfig,
      url: generateUrl({ entityUrl, resource, routeParams, queryParams }),
      method,
      body,
      ...config,
    } as any)
    return response.json()
  }
}
