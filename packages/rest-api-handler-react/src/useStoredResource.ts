import { RestApiResource } from '@rest-api-handler/core'
import { useState, useEffect } from 'react'

export function useStoredResource<
  RestResource extends RestApiResource<{}, any>,
  Ids extends string | string[],
  ResourceType = NonNullable<
    ReturnType<RestResource['store']['getState']>[string]
  >,
  ReturnDataType = Ids extends string
    ? (ResourceType | undefined)
    : (ResourceType | undefined)[]
>({ store, getResourceId }: RestResource, resourceIds: Ids): ReturnDataType {
  const initialData = Array.isArray(resourceIds)
    ? resourceIds.map(id => store.getState()[id])
    : store.getState()[resourceIds as string]
  const [data, setData] = useState(initialData)

  useEffect(() => {
    const subscriptionId = store.subscribe((state, action) => {
      switch (action.type) {
        case 'UPDATE_RESOURCE_SUCCESS': {
          const { id } = action.payload
          if (resourceIds === id) {
            setData(state[id])
          } else if (Array.isArray(resourceIds) && resourceIds.includes(id)) {
            setData(resourceIds.map(id => state[id]))
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
  }, [getResourceId, resourceIds, store])

  return data as ReturnDataType
}
