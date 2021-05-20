import { createRoute } from '../routes/routes'
import { RouteMethod, RouteData } from '../routes/routes.types'
import { createResource } from '../createResource'

type TestResource = {
  id: string
  data: number
}

const mockedHttpClient = (_config?: any) => async (_requestData: RouteData) => jest.fn()
type HttpClient = typeof mockedHttpClient

describe('#createResource', function () {
  it('Creates correctly a store with the default REST handlers', function () {
    const resource = createResource<TestResource, HttpClient>('test', 'testUrl', mockedHttpClient)
    const { create, remove, get, list, patch, put } = resource.getApiHandlers()

    expect(create).toBeTruthy()
    expect(remove).toBeTruthy()
    expect(get).toBeTruthy()
    expect(list).toBeTruthy()
    expect(patch).toBeTruthy()
    expect(put).toBeTruthy()
  })

  it('Creates correctly a store with custom handlers', function () {
    const routes = {
      customRoute: createRoute({
        method: RouteMethod.get,
        dataType: 'list',
        handler: (id: string | number) => {
          const parsedId = id.toString()
          return {
            resourceId: parsedId,
            routeParams: [parsedId],
          }
        },
      }),
    }
    const resource = createResource<TestResource, HttpClient, typeof routes>(
      'test',
      'testUrl',
      mockedHttpClient,
      routes
    )
    const { customRoute } = resource.getApiHandlers()

    expect(customRoute).toBeTruthy()
  })
})
