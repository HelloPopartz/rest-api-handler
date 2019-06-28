import { compose, createStore } from 'redux'
import { RootState } from './redux.types'
import { rootReducer } from './redux.reducers'
import { connectToRestResources } from '@rest-api-handler/redux'
import { resource } from '../resource'

const configureStore = (initialState?: RootState) => {
  const composeEnhancers: typeof compose =
    (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

  const restApiEnhanced = connectToRestResources({
    [resource.storeId]: resource
  })
  const newStore = createStore(
    rootReducer,
    initialState,
    composeEnhancers(restApiEnhanced)
  )

  return newStore
}

export const store = configureStore()
