import { RestApiResource, RouteMap } from '@rest-api-handler/core'
import { useState } from 'react'

type UseRestApiHandler<ResourceType> = {
  loading: boolean
  error: Error | undefined
  data: ResourceType | undefined
}

export function useRestApiHandler<
  ResourceType,
  Routes extends RouteMap,
  RouteKey extends keyof Routes,
  ReturnData extends ReturnType<
    NonNullable<Routes[RouteKey]['transformResponse']>
  >
>(
  restResource: RestApiResource<ResourceType, Routes>,
  route: RouteKey
): UseRestApiHandler<ReturnData> {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | undefined>(undefined)
  const [data, setData] = useState<ReturnData | undefined>(undefined)

  return {
    loading,
    error,
    data,
  }
}
