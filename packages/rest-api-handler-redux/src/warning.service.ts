/* eslint-disable no-console */
export enum WarningCodes {
  noResources = 'no-resources',
  keyMismatch = 'key-mismatch',
  storeNotSet = 'store-not-set'
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function emitWarning(code: WarningCodes, ...data: string[]) {
  switch (code) {
    case WarningCodes.noResources:
      console.warn(
        '[rest-api-handler]: Redux enhancer has no resources. Did you initialize the store?'
      )
      break
    case WarningCodes.keyMismatch:
      console.warn(
        `[rest-api-handler]: Mismatch between store key ${data[0]} and resourceName ${data[1]}. store key will be ignored`
      )
      break
    case WarningCodes.storeNotSet:
      console.warn('[rest-api-handler]: Store not set')
      break
    // eslint-disable-next-line no-fallthrough
    default:
      console.warn('[rest-api-handler]: Unknown warning')
  }
}
