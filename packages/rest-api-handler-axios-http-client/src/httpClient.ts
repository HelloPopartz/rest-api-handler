import { HttpClient, HttpClientRequestData } from '@rest-api-handler/core'
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

function generateUrl({
  entityUrl,
  resource = '',
  routeParams = []
}: {
  entityUrl: string
  resource?: string
  routeParams?: (string | number)[]
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
  return url
}

export function axiosHttpClient(
  axiosInstance: AxiosInstance = axios.create({}),
  extraConfig?: AxiosRequestConfig
): HttpClient<AxiosRequestConfig> {
  return async ({
    entityUrl,
    method,
    resource,
    routeParams,
    body,
    queryParams,
    config
  }: HttpClientRequestData<AxiosRequestConfig>) => {
    const url = generateUrl({ entityUrl, resource, routeParams })
    const response: AxiosResponse = await axiosInstance.request({
      ...extraConfig,
      baseUrl: url,
      method,
      body: JSON.stringify(body),
      queryParams,
      ...config
    } as any)
    return response.data
  }
}
