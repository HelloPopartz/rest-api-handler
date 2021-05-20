import { Store, Action } from 'redux'

export const REST_API_STORE_ID = 'restResources'

export type RestApiEntitiesState = {
  [REST_API_STORE_ID]: Record<string, Record<string | number, any>>
}

export type EnhancedStore<S> = Store<S & RestApiEntitiesState, Action<any>>
