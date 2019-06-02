import { RestApiResource } from '@rest-api-handler/core'
import { useEffect, useReducer, Reducer } from 'react'

type UseRestApiHandler<ResourceType> = {
  loading: boolean
  error: Error | undefined
  data: ResourceType | undefined
}

type UseRestApiActions<ResourceType> = {
  type: 'FETCH_INIT' | 'FETCH_SUCCESS' | 'FETCH_FAILURE' | 'CACHE_UPDATE'
  payload?: ResourceType | Error
}

type UseRestResourceReducer<ResourceType> = Reducer<
  UseRestApiHandler<ResourceType>,
  UseRestApiActions<ResourceType>
>

const dataFetchReducer = <ResourceType>(
  state: UseRestApiHandler<ResourceType>,
  action: UseRestApiActions<ResourceType>
) => {
  switch (action.type) {
    case 'FETCH_INIT':
      return {
        ...state,
        loading: true,
        error: undefined,
      }
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        error: undefined,
        data: action.payload as ResourceType,
      }
    case 'CACHE_UPDATE':
      return {
        ...state,
        data: action.payload as ResourceType,
      }
    case 'FETCH_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload as Error,
      }
    default:
      throw new Error()
  }
}

export function useRestResource<
  ResourceType,
  RestResource extends RestApiResource<ResourceType, any>
>(
  resource: RestResource,
  apiCall: (apiHandlers: RestResource['api']) => Promise<ResourceType>,
  depArray: any[] = []
): UseRestApiHandler<ResourceType> {
  const { subscriptions } = resource
  const [state, dispatch] = useReducer<UseRestResourceReducer<ResourceType>>(
    dataFetchReducer,
    {
      loading: false,
      error: undefined,
      data: undefined,
    }
  )

  useEffect(() => {
    let didCancel = false

    async function fetch() {
      dispatch({ type: 'FETCH_INIT' })

      try {
        const response = await apiCall(resource.api)
        if (!didCancel) {
          dispatch({ type: 'FETCH_SUCCESS', payload: response })
        }
      } catch (e) {
        if (!didCancel) {
          dispatch({ type: 'FETCH_FAILURE', payload: e })
        }
      }
    }

    fetch()
    return () => {
      didCancel = true
    }
  }, depArray)

  useEffect(() => {
    if (!state.data) {
      return
    }
    const subscriptionId = subscriptions.subscribe(
      resource.getResourceId(state.data),
      ({ data, state: actionState }) => {
        switch (actionState) {
          case 'request':
            dispatch({ type: 'FETCH_INIT' })
            break
          case 'success':
            dispatch({ type: 'FETCH_SUCCESS', payload: data })
            break
          case 'failure':
            dispatch({ type: 'FETCH_SUCCESS', payload: state.data })
        }
      }
    )
    return () => {
      subscriptions.unsubscribe(subscriptionId)
    }
  }, [state.data])

  return state
}
