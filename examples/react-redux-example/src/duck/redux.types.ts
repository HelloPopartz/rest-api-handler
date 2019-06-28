import { Dispatch as ReduxDispatch, Action } from 'redux'

export type RootState = {
  readonly app: string
}

export type Dispatch = ReduxDispatch<Action>
