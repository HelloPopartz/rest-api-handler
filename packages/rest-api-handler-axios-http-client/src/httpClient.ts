import { HttpClient, HttpClientRequestData } from '@rest-api-handler/core'
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

function generateUrl({
  resourceUrl,
  resource = '',
  routeParams = []
}: {
  resourceUrl: string
  resource?: string
  routeParams?: (string | number)[]
}) {
  let url = resourceUrl.replace(/\/$/, '')
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
    resourceUrl,
    method,
    resource,
    routeParams,
    body,
    queryParams,
    config
  }: HttpClientRequestData<AxiosRequestConfig>) => {
    const url = generateUrl({ resourceUrl, resource, routeParams })
    const response: AxiosResponse = await axiosInstance.request({
      ...extraConfig,
      baseUrl: url,
      method,
      data: body,
      params: queryParams,
      ...config
    } as any)
    return response.data
  }
}
