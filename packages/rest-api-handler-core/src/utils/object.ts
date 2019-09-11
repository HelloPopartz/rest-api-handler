export function conditionalInsert<Condition extends boolean, Data extends Record<string, any>>(
  condition: Condition,
  objectToInsert: Data
): Condition extends true ? Data : {}

export function conditionalInsert<Condition extends boolean, Data extends Record<string, any>>(
  condition: Condition,
  objectToInsert: Data
): Data | {} {
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
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false
    }
  }
  return true
}
