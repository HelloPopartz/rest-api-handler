export type Action<Type> = {
  type: Type
}

export type ActionWithPayload<Type, Payload = any> = {
  type: Type
  payload: Payload
}

export type ActionType<
  T extends (...args: any) => ActionWithPayload<any, any> | Action<any>
> = ReturnType<T>['type']

export type ActionPayload<
  T extends (...args: any) => ActionWithPayload<any, any>
> = ReturnType<T>['payload']

export function getType(
  action: (...args: any) => ActionWithPayload<any, any> | Action<any>
) {
  return action().type
}
