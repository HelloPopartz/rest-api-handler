import { CacheStore } from './createStore'
import { GetIdFromResource } from './selectors'
import { checkIfValidId } from '../routes/handlers'

export function createOperations<ResourceType extends { id: string | number }>(
  { dispatch, actions, getStoreName }: CacheStore<ResourceType>,
  getIdFromResource: GetIdFromResource<ResourceType>
) {
  return {
    forceUpdate: (data: ResourceType | ResourceType[]) => {
      if (!data) {
        throw new Error('[rest-api-handler]: Manual update failed')
      }
      if (Array.isArray(data)) {
        const mapForStore: Record<string, ResourceType> = {}
        data.forEach((data: ResourceType) => {
          let parsedData = data
          const id = getIdFromResource(data)
          const validId = checkIfValidId(getStoreName(), id)
          // Emit subscription
          if (validId) {
            mapForStore[String(id)] = parsedData
          }
        })
        dispatch(
          actions.updateList.success({
            data: mapForStore,
          })
        )
      } else {
        const id = getIdFromResource(data)
        if (!id) {
          throw new Error('[rest-api-handler]: Manual update failed')
        }
        dispatch(
          actions.update.success({
            id,
            data,
          })
        )
      }
    },
  }
}
