export type Action<Type> = {
  type: Type
}

export type ActionWithPayload<Type, Payload = any> = {
  type: Type
  payload: Payload
}

export function getType(
  action: (...args: any) => ActionWithPayload<any, any> | Action<any>
) {
  return action().type
}
