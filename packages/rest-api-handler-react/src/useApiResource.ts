import { RestApiResource } from '@rest-api-handler/core'
import { useEffect, useReducer } from 'react'
import { Reducer } from 'react'

type UseRestApiHandler<ResourceType> = {
  loading: boolean
  error: Error | undefined
  data: ResourceType | undefined
}

type UseRestApiActions<ResourceType> =
  | {
      type: 'FETCH_INIT'
    }
  | { type: 'FETCH_SUCCESS'; payload: ResourceType }
  | { type: 'FETCH_FAILURE'; payload: Error }

type UseRestResourceReducer<ResourceType> = Reducer<
  UseRestApiHandler<ResourceType>,
  UseRestApiActions<ResourceType>
>

export const dataFetchReducer = <ResourceType>(
  state: UseRestApiHandler<ResourceType>,
  action: UseRestApiActions<ResourceType>
) => {
  switch (action.type) {
    case 'FETCH_INIT':
      return {
        ...state,
        loading: true,
        error: undefined
      }
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        error: undefined,
        data: action.payload as ResourceType
      }
    case 'FETCH_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload as Error
      }
    default:
      throw new Error()
  }
}

export function useApiResource<
  RestResource extends RestApiResource<ResourceType, any>,
  ReturnData extends ResourceType | ResourceType[] | undefined,
  ResourceType = NonNullable<
    ReturnType<RestResource['store']['getState']>[string]
  >
>(
  { api, store, getResourceId }: RestResource,
  apiCall: (apiHandlers: RestResource['api']) => Promise<ReturnData>,
  depArray: any[] = []
): UseRestApiHandler<ReturnData> {
  const [state, dispatch] = useReducer<UseRestResourceReducer<ReturnData>>(
    dataFetchReducer,
    {
      loading: false,
      error: undefined,
      data: undefined
    }
  )
  useEffect(() => {
    let didCancel = false

    async function fetch() {
      dispatch({ type: 'FETCH_INIT' })

      try {
        const response = await apiCall(api)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, depArray)

  useEffect(() => {
    if (!state.data) {
      return
    }
    const subscriptionId = store.subscribe((_, action) => {
      let idsToUpdate: string[] = []
      if (!!state.data) {
        idsToUpdate = Array.isArray(state.data)
          ? state.data.map(item => getResourceId(item))
          : [getResourceId(state.data as ResourceType)]
      }
      switch (action.type) {
        case 'UPDATE_RESOURCE_REQUEST': {
          const { id } = action.payload
          if (idsToUpdate.includes(id)) {
            dispatch({ type: 'FETCH_INIT' })
          }
          break
        }
        case 'UPDATE_RESOURCE_SUCCESS': {
          const { data, id } = action.payload
          if (idsToUpdate.includes(id)) {
            dispatch({ type: 'FETCH_SUCCESS', payload: data })
          }
          break
        }
        case 'UPDATE_RESOURCE_FAILURE': {
          const { error, id } = action.payload
          if (!!id && idsToUpdate.includes(id)) {
            dispatch({ type: 'FETCH_FAILURE', payload: error })
          }
          break
        }
        default:
          break
      }
    })
    return () => {
      store.unsubscribe(subscriptionId)
    }
  }, [dispatch, getResourceId, state.data, store])

  return state
}
