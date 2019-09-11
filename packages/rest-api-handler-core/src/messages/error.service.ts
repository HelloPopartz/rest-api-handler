export enum ErrorCodes {
  idNotFound = 'id-not-found',
}

export function createRestApiHandlerError(storeName: string, e: Error) {
  const error = new Error(`[rest-api-handler]: In store ${storeName} the following error ocurred: ${e.message}`)
  error.stack = e.stack
  error.name = e.name
  console.error(error)
  return error
}
