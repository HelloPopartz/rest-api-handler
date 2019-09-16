export enum ErrorCodes {
  idNotFound = 'id-not-found',
}

export function createRestApiHandlerError(storeName: string, errorMessage: string) {
  const error = new Error(`[rest-api-handler]: In store ${storeName} the following error ocurred: ${errorMessage}`)
  return error
}
