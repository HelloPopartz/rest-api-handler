import { RouteOptions, RouteData } from './routes.types'

export type HttpClientRequestData<HttpClientOptions> = {
  entityUrl: string
} & Pick<RouteOptions<any, () => {}, any>, 'method' | 'resource'> &
  RouteData<HttpClientOptions>

export type HttpClient<HttpClientOptions> = (
  requestData: HttpClientRequestData<HttpClientOptions>
) => Promise<any>
