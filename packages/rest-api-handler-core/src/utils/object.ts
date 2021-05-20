export function conditionalInsert<Condition extends boolean, Data extends Record<string, any>>(
  condition: Condition,
  objectToInsert: Data
): Condition extends true ? Data : Record<string, any>

export function conditionalInsert<Condition extends boolean, Data extends Record<string, any>>(
  condition: Condition,
  objectToInsert: Data
): Data | Record<string, any> {
  return condition ? objectToInsert : {}
}

export function mapObject<Value, Obj extends { [key: string]: Value }, NewValue>(
  obj: Obj,
  callback: (currentValue: Value, key: keyof Obj) => NewValue
): { [key in keyof Obj]: NewValue } {
  const newObj: any = {}
  Object.keys(obj).forEach((key: string) => {
    newObj[key] = callback(obj[key], key)
  })
  return newObj
}

export function isEmpty(obj: Record<string, any>) {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return false
    }
  }
  return true
}
