import { RouteOptions, RouteData } from './routes.types'

export type NetworkClientRequestData = {
  resourceUrl: string
} & Pick<RouteOptions<any, () => Record<string, any>, any>, 'method' | 'resource'> &
  RouteData

export type NetworkClient<NetworkClientConfigParams extends any[]> = (
  ...clientConfig: NetworkClientConfigParams
) => (requestData: NetworkClientRequestData) => Promise<any>

// This function is just for type-safety purposes
export function createNetworkClient<Client extends NetworkClient<any>>(client: Client) {
  return client
}
