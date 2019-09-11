/* eslint-disable no-console */
export enum WarningCodes {
  noId = 'no-id',
  arrayInUpdateItem = 'array-in-update-item',
  notArrayInUpdateList = 'not-array-in-update-list',
  invalidIdType = 'invalid-id-type',
}

export function emitWarning(storeName: string, code: WarningCodes) {
  switch (code) {
    case WarningCodes.noId:
      console.warn(
        `[rest-api-handler]: In store ${storeName} getResourceId returned a invalid id, this is a not a breaking change but it disables the caching and subscriptions capabilities`
      )
      break
    case WarningCodes.arrayInUpdateItem:
      console.warn(
        `[rest-api-handler]: In store ${storeName} a transformItem action was called with an array, this is not supported, please check your parseResponse method`
      )
      break
    case WarningCodes.notArrayInUpdateList:
      console.warn(
        `[rest-api-handler]: In store ${storeName} a updateList action was called without an array, this is not supported, please check your parseResponse method`
      )
      break
    default:
      console.warn(`[rest-api-handler]: In store ${storeName} Unknown warning`)
  }
}
