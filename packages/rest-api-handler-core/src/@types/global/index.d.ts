declare module "global" {
  type AnyFunction = (...args: any[]) => any;
  type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
}
