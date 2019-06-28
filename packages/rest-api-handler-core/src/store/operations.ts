import { CacheStore } from './createStore'
import { GetIdFromResource } from './selectors'
import { checkIfValidId } from '../handlers'

export function createOperations<ResourceType>(
  { dispatch, actions }: CacheStore<ResourceType>,
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
          const validId = checkIfValidId(id)
          // Emit subscription
          if (validId) {
            mapForStore[id] = parsedData
          }
        })
        dispatch(
          actions.updateList.success({
            data: mapForStore
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
            data
          })
        )
      }
    }
  }
}
