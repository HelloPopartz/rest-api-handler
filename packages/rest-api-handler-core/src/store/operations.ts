import { CacheStore } from './createStore'
import { GetIdFromResource } from './selectors'
import { checkIfValidId } from '../routes/handlers'
import { Resource } from './types'

type TransformFunc<ResourceType extends Resource> = (originalData: any) => ResourceType

export function createOperations<ResourceType extends Resource>(
  { dispatch, actions, getStoreName }: CacheStore<ResourceType>,
  {
    getIdFromResource,
    transformData: inheritedTransformData,
  }: {
    getIdFromResource: GetIdFromResource<ResourceType>
    transformData: TransformFunc<ResourceType>
  }
) {
  return {
    forceUpdate: (
      data: any,
      {
        transformData = inheritedTransformData,
      }: {
        transformData?: TransformFunc<ResourceType>
      }
    ) => {
      if (!data) {
        throw new Error('[rest-api-handler]: Manual update failed')
      }
      if (Array.isArray(data)) {
        const mapForStore: Record<string, ResourceType> = {}
        data.forEach((data: ResourceType) => {
          let parsedData = transformData(data)
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
        const parsedData = transformData(data)
        dispatch(
          actions.update.success({
            id,
            data: parsedData,
          })
        )
      }
    },
  }
}
