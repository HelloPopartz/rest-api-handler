import { RestApiResource, CacheStore } from '@rest-api-handler/core'
import { useEffect, useReducer, useCallback } from 'react'

import { getType } from './utils/actionTypes'

type UseRestApiState<T> = {
  loading: boolean
  error: Error | undefined
  data: T | undefined
}

type UseRestApiActions<ResourceType> =
  | {
      type: 'FETCH_INIT'
    }
  | { type: 'FETCH_SUCCESS'; payload: ResourceType | undefined }
  | { type: 'FETCH_FAILURE'; payload: Error }
  | { type: 'REFRESH' }

function getDataFromStore<ResourceType>(
  getState: CacheStore<ResourceType>['getState'],
  getResourceById: RestApiResource<
    ResourceType,
    any
  >['selectors']['getResourceById'],
  ids: (string | number)[] | undefined
): ResourceType | ResourceType[] | undefined {
  if (ids === undefined) {
    return undefined
  }
  try {
    const data = ids.map(id => getResourceById(getState(), id))
    if (data.length === 0) {
      return undefined
    } else if (data.length === 1) {
      return data[0]
    } else {
      return data
    }
  } catch (e) {
    return undefined
  }
}

export function useApiResource<
  RestResource extends RestApiResource<ResourceType, any>,
  ReturnData extends ResourceType | ResourceType[] | undefined,
  ResourceType = NonNullable<
    ReturnType<RestResource['selectors']['getResourceById']>
  >
>(
  {
    api,
    subscribe,
    unsubscribe,
    getState,
    config,
    selectors: { getIdFromResource, getResourceById }
  }: RestResource,
  apiCall: (apiHandlers: RestResource['api']) => Promise<ReturnData>,
  depArray: any[] = []
): UseRestApiState<ReturnData> {
  const dataFetchReducer = useCallback(
    (
      state: UseRestApiState<(string | number)[]>,
      action: UseRestApiActions<(string | number)[]>
    ) => {
      switch (action.type) {
        case 'FETCH_INIT':
          return {
            ...state,
            loading: true,
            error: undefined
          }
        case 'FETCH_SUCCESS': {
          const data = action.payload
          return {
            ...state,
            loading: false,
            error: undefined,
            data
          }
        }
        case 'FETCH_FAILURE':
          return {
            ...state,
            loading: false,
            error: action.payload as Error
          }
        case 'REFRESH':
          return {
            ...state,
            loading: false,
            error: undefined
          }
        default:
          throw new Error()
      }
    },
    []
  )
  const [state, dispatch] = useReducer(dataFetchReducer, {
    loading: false,
    error: undefined,
    data: undefined
  })
  const { loading, data: currentDataIds, error } = state

  useEffect(() => {
    let didCancel = false

    async function fetch() {
      dispatch({ type: 'FETCH_INIT' })

      try {
        const response = await apiCall(api)
        if (!didCancel && !!response) {
          const dataIds = Array.isArray(response)
            ? response.map(item => getIdFromResource(item))
            : [getIdFromResource(response as ResourceType)]
          dispatch({ type: 'FETCH_SUCCESS', payload: dataIds })
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
    if (!currentDataIds) {
      return
    }
    const subscriptionId = subscribe((_, action) => {
      const { update, updateList } = config.store.actions
      switch (action.type) {
        case getType(update.request): {
          const { id } = action.payload
          if (currentDataIds.includes(id)) {
            dispatch({ type: 'FETCH_INIT' })
          }
          break
        }
        case getType(update.success): {
          const { id } = action.payload
          if (currentDataIds.includes(id)) {
            dispatch({
              type: 'REFRESH'
            })
          }
          break
        }
        case getType(updateList.success): {
          const { data: newData } = action.payload
          const shouldUpdate = currentDataIds.some(
            id => newData[id] !== undefined
          )
          if (shouldUpdate) {
            dispatch({
              type: 'REFRESH'
            })
          }
          break
        }
        case getType(update.failure): {
          const { error, id } = action.payload
          if (!!id && currentDataIds.includes(id)) {
            dispatch({ type: 'FETCH_FAILURE', payload: error })
          }
          break
        }
        default:
          break
      }
    })
    return () => {
      unsubscribe(subscriptionId)
    }
  }, [config.store.actions, currentDataIds, dispatch, subscribe, unsubscribe])

  return {
    loading,
    error,
    data: getDataFromStore(getState, getResourceById, currentDataIds) as any
  }
}
