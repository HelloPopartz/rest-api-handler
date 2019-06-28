/* eslint-disable no-console */
export enum WarningCodes {
  noId = 'no-id',
  invalidIdType = 'invalid-id-type'
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function emitWarning(code: WarningCodes, data?: string) {
  switch (code) {
    case WarningCodes.noId:
      console.warn(
        '[rest-api-handler]: getResourceId returned a invalid id, this is a not a breaking change but it disables the caching and subscriptions capabilities'
      )
      break
    // eslint-disable-next-line no-fallthrough
    default:
      console.warn('[rest-api-handler]: Unknown warning')
  }
}
