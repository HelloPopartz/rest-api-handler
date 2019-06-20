/* eslint-disable no-console */
export enum WarningCodes {
  noId = 'no-id',
  invalidIdType = 'invalid-id-type'
}

export function emitWarning(code: WarningCodes, data?: string) {
  switch (code) {
    case WarningCodes.noId:
      console.warn(
        '[rest-api-handler]: getResourceId returned a invalid id, this is a not a breaking change but it disables the caching and subscriptions capabilities'
      )
      break
    case WarningCodes.invalidIdType:
      console.warn(
        `[rest-api-handler]: getResourceId returned a invalid id. Ids must be of type string, however the returned id is ${data}`
      )
    // eslint-disable-next-line no-fallthrough
    default:
      console.warn('[rest-api-handler]: Unknown warning')
  }
}
