import { createResource, RouteMethod } from '../src'

type TestResource = {
  id: string
  data: number
}

const mockedHttpClient = jest.fn()

describe('createResource', function() {
  it('Creates correctly a store with the default REST handlers', function() {
    const resource = createResource<TestResource>(
      'testUrl',
      mockedHttpClient,
      undefined
    )

    expect(resource.api.create).toBeTruthy()
    expect(resource.api.delete).toBeTruthy()
    expect(resource.api.get).toBeTruthy()
    expect(resource.api.list).toBeTruthy()
    expect(resource.api.patch).toBeTruthy()
    expect(resource.api.put).toBeTruthy()
  })
  it('Creates correctly a store with custom handlers', function() {
    const routes = {
      customRoute: {
        method: RouteMethod.get,
        handler: (id: string | number) => {
          const parsedId = id.toString()
          return {
            resourceId: parsedId,
            routeParams: [parsedId]
          }
        }
      }
    }
    const resource = createResource<TestResource, typeof routes>(
      'testUrl',
      mockedHttpClient,
      routes
    )
    expect(resource.api.customRoute).toBeTruthy()
  })
})
