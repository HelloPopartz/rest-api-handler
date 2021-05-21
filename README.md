# rest-api-handler

A simplified way of handling a REST api (with framework bindings)

# What it tries to solve?

I've encountered three repetitive issues when dealing when REST entities.

- Storing REST resources in a normalized store
- Generating common API handlers for REST resources
- Maintaining this cached resourced updated when making API calls

`rest-api-handler` provides an abstraction layer in order to forget about the management of REST entities, automatically providing a cache management and a standard REST API methods for managing a particular entity

# Installation

Installing and using is simple. Start by installing the `@rest-api-handler/core` dependency:

```bash
$ yarn add @rest-api-handler/core
# or
$ npm i @rest-api-handler/core --save
```

This is core dependency, we can use the library as is.
There are also bindings / utils provided for both vanilla React and Redux.

```bash
$ yarn add @rest-api-handler/redux
# or
$ npm i @rest-api-handler/redux --save
```

```bash
$ yarn add @rest-api-handler/react
# or
$ npm i @rest-api-handler/react --save
```

# Basic Usage

In order to create a REST entity we use the following line

```jsx
import { createResource } from '@rest-api-handler/core'

export const entityStore = createResource<Entity, NetworkClient>(
  ENTITY_RESOURCE_ID,
  API_ENTITY_PATH,
  networkClient,
  extraRoutes,
  entityConfig,
)
```

## `networkClient`

Middleware for making network requests. We provide two typical network clients, `@rest-api-handler/fetch-http-client` and `@rest-api-handler/axios-http-client`. It can also be customized, please see [the following section](#Using-a-custom-network-client)

## `extraRoutes` (optional)

Add extra methods for the `getApiHandlers` function. Please see [the following section](#Using-a-custom-route) for adding more methods

## `entityConfig` (optional)

```jsx
export type ResourceConfig<ResourceType extends Resource> = {
  partialUpdate?: boolean
  transformData?: (originalData: any) => ResourceType
  customStore?: CacheStore<ResourceType>
  initialData?: Record<string, ResourceType>
}
```

## Entity store

```jsx
export interface RestApiResource<
  ResourceType extends Resource,
  UserNetworkClient extends NetworkClient<any[]>,
  Routes extends RouteMap<ResourceType>
> {
  subscribe: (callback: SubscribeCallback<ResourceType>) => string
  unsubscribe: (subId: string) => boolean
  getState: () => Record<string, ResourceType>
  forceUpdate: (data: any, config?: { transformData: (originalData: any) => ResourceType }) => void
  getApiHandlers: GetApiHandlers<ResourceType, UserNetworkClient, Routes>
  getResource: (id: ResourceType['id']) => ResourceType
  getIdFromResource: GetIdFromResource<ResourceType>
  clearStore: () => void
  config: EntityStoreConfig
}
```

### `subscribe`

Subscribe to events in the entity store. Returns an `id` for the subscription

### `unsubscribe`

Stop listening to events of the provided `id`

### `getState`

Returns all cached entities

### `forceUpdate`

Overrides an entity. It can provide a custom `transformData`

### `getApiHandlers`

Provides `get`, `list`, `patch`, `put`, `create` and `delete` methods for managing the REST resource. It also provides the extra methods defined in the `extraRoutes`. Please see [the following section](#Using-a-custom-route) for adding more methods

### `getResource`

Returns a single resource by `id` from the cache

### `getIdFromResource`

Returns the `id` of a resource

### `clearStore`

Deletes all cached entities

# FAQ

## Using a custom network client

If we want more control on how requests are made you can provide a custom HTTP adapter. Bellow you can find a small example.

```jsx
import { createNetworkClient } from '@rest-api-handler/core'
import { callApi } from 'your-cool-library'

// The arguments provided to your custom client will be used in the `getApiHandlers` method of the store.
export const networkClient = createNetworkClient((token: string) => {
  return async function ({ resourceUrl, method, resourceId, resource = '', routeParams = [], body, queryParams }) {
    // Custom function for building urls
    const url = getUrlWithPathParams(resourceUrl, resourceId, resource, ...routeParams)
    const response: any = await callApi({
      url,
      method,
      data: body,
      params: queryParams,
      token,
    })
    return response
  }
})
```

Every network request receives the following arguments

```jsx
export type NetworkClientRequestData = {
  resourceUrl: string
  resourceId?: any
  resource?: string
  routeParams?: any[]
  queryParams?: Record<string, any>
  method: RouteMethod
  body?: any
}
```

`resourceUrl`, `resource`, `resourceId`, `routeParams` and `queryParams` are used in the default middlewares (`@rest-api-handler/fetch-http-client` and `@rest-api-handler/axios-http-client`) to construct the url, following this structure

```jsx
const url = `${resourceUrl}/${resourceId}/${resource}/${...routeParams}?${queryParams}`
```

`method` is the HTTP method used for the request and `body` is, as you may think, the body of the request.

## Using a custom route

We can include custom routes in a simple way

```jsx
import { createRoute, RouteMethod } from '@rest-api-handler/core'

const customRoute = createRoute({
  method: RouteMethod.post,
  dataType: 'item',
  resource: '/extra-url',
  handler: (entityId: ResourceType['id']) => ({
    resourceId: entityId,
    routeParams: [],
    queryParams: {
      search: 'some-query-param'
    }
    body: {
      customBodyData: true,
    },
  }),
})
```

### `method`

Network method used for this API call

```jsx
export declare enum RouteMethod {
    get = "GET",
    post = "POST",
    put = "PUT",
    patch = "PATCH",
    delete = "DELETE"
}
```

### `dataType`

Define how returned data should be treated in the cache

```jsx
export declare type RouteDataType = 'item' | 'list' | 'none' | 'delete';
```

#### `item`

The returned data is a single entity and should be stored by it's `id` parameter

#### `list`

The returned data is an array of entities, that should be stored by it's `id`

#### `none`

Don't stored the returned result

#### `delete`

Delete the cached resource with the matching `resourceId` defined by the route

### `resource`

Append to the end of the url the provided `string`

### `handler`

Define what if passed to the network client. It receives a `NetworkClientRequestData` object, similar to the one [the network client receives](#Using-a-custom-network-client)

## How to integrate with redux

```jsx
import { connectToRestResources, createConnectedResource } from '@rest-api-handler/redux'
import { axiosHttpClient, AxiosHttpClient } from '@rest-api-handler/axios-http-client'

const entities = {
  [SOME_ENTITY_RESOURCE_ID]: createConnectedResource<SomeEntityType, AxiosHttpClient>(
    SOME_ENTITY_RESOURCE_ID,
    SOME_ENTITY_API_PATH,
    axiosHttpClient,
  ),
  [OTHER_ENTITY_RESOURCE_ID]: createConnectedResource<Analysis, AxiosHttpClient>(
    OTHER_ENTITY_RESOURCE_ID,
    OTHER_ENTITY_API_PATH,
    axiosHttpClient,
  ),
}

const store = createStore(
  rootReducer,
  initialState,
  composeEnhancers(...otherMiddlewares, connectToRestResources(entities))
)
```
