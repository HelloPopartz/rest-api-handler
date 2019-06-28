export type SetDifference<A, B> = A extends B ? never : A
export type Omit<T, K extends keyof any> = Pick<T, SetDifference<keyof T, K>>
