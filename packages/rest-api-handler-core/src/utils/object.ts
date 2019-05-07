export function conditionalInsert<
  Condition extends boolean,
  Data extends Object
>(
  condition: Condition,
  objectToInsert: Data
): Condition extends true ? Data : {}

export function conditionalInsert<
  Condition extends boolean,
  Data extends Object
>(condition: Condition, objectToInsert: Data): Data | {} {
  return condition ? objectToInsert : {}
}

export function mapObject<
  Value,
  Object extends { [key: string]: Value },
  NewValue
>(
  obj: Object,
  callback: (currentValue: Value, key: keyof Object) => NewValue
): { [key in keyof Object]: NewValue } {
  const newObj: any = {}
  Object(obj)
    .keys()
    .forEach((key: string) => {
      newObj[key] = callback(obj[key], key)
    })
  return newObj
}
