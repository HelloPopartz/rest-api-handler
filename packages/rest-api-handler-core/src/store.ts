import { Dictionary } from "lodash";
import { AnyFunction } from "global";

export enum CacheDataType {
  list = "list",
  item = "item",
  map = "map"
}

export enum CacheActionType {
  update = "update",
  delete = "delete",
  set = "set"
}

export type CacheActionConfig = {
  dataType: CacheDataType;
  responseType: CacheActionType;
};

export type SubscribeCallback<ResourceType> = (params: {
  action: CacheActionType;
  data: ResourceType;
  id: string;
  store: Map<string, ResourceType>;
}) => void;

export type CacheStore<ResourceType> = {
  set: (data: ResourceType, id: string) => void;
  get: (id: string) => ResourceType;
  delete: (id: string) => boolean;
  clear: () => void;
  subscribeTo: (
    id: string,
    callback: SubscribeCallback<ResourceType>
  ) => boolean;
  subscribe: (callback: SubscribeCallback<ResourceType>) => void;
};

export function createStore<ResourceType>(): CacheStore<ResourceType> {
  // Store data
  let store = {} as Map<string, ResourceType>;
  let subscriptions = {} as Map<
    string,
    CacheStore<ResourceType>["subscribeTo"]
  >;
  let globalSubscription:
    | SubscribeCallback<ResourceType>
    | undefined = undefined;

  // Handlers
  const set = (data: ResourceType, id: string) => {
    const alreadyInStore = !!store[id];
    store[id] = data;
    if (subscriptions[id]) {
      subscriptions[id]({ action: CacheActionType.update, data, id, store });
    }
    if (globalSubscription) {
      globalSubscription({
        action: alreadyInStore ? CacheActionType.update : CacheActionType.set,
        data,
        id,
        store
      });
    }
  };

  const get = (id: string) => {
    return store[id];
  };

  const deleteHandler = (id: string) => {
    if (store[id]) {
      const dataToDelete = store[id];
      delete store[id];
      if (subscriptions[id]) {
        subscriptions[id]({
          action: CacheActionType.delete,
          data: dataToDelete,
          id,
          store
        });
      }
      if (globalSubscription) {
        globalSubscription({
          action: CacheActionType.delete,
          data: dataToDelete,
          id,
          store
        });
      }
      return true;
    } else {
      return false;
    }
  };

  const clear = () => {
    store = {} as Map<string, ResourceType>;
    subscriptions = {} as Map<string, CacheStore<ResourceType>["subscribeTo"]>;
    globalSubscription = undefined;
  };

  const subscribeTo = (
    id: string,
    callback: SubscribeCallback<ResourceType>
  ) => {
    if (store[id]) {
      subscriptions[id] = callback;
      return true;
    } else {
      return false;
    }
  };

  const subscribe = (callback: SubscribeCallback<ResourceType>) => {
    globalSubscription = callback;
  };

  return {
    set,
    get,
    delete: deleteHandler,
    clear,
    subscribeTo,
    subscribe
  };
}
