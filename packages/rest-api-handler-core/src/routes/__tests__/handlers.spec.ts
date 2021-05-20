import { checkIfValidId, emitDeleteAction, transformResource, emitUpdateItemAction } from '../handlers'

import * as Messages from '../../messages'
import { createStore } from '../../store'

const storeName = 'test'

describe('#handlers', () => {
  function getIdFromResourceMock(data: any) {
    return data.id
  }

  function createTestStore(initialData: any = {}, { partialUpdate }: { partialUpdate?: boolean } = {}) {
    return createStore('testStore', { initialData, partialUpdate })
  }

  const mockEmitWarning = jest.fn()

  beforeEach(function() {
    mockEmitWarning.mockClear()
    jest.spyOn(Messages, 'emitWarning').mockImplementation(mockEmitWarning)
  })

  afterEach(function() {
    jest.spyOn(Messages, 'emitWarning').mockRestore()
  })

  describe('#checkIfValidId', () => {
    it('emits a warning if the provided id is not valid', () => {
      checkIfValidId(storeName, null as any)
      checkIfValidId(storeName, undefined as any)
      checkIfValidId(storeName, [] as any)
      checkIfValidId(storeName, {} as any)

      expect(mockEmitWarning).toHaveBeenCalledTimes(4)
    })

    it('emits nothing If the provided id is valid', () => {
      checkIfValidId(storeName, 1)
      checkIfValidId(storeName, '1')

      expect(mockEmitWarning).not.toHaveBeenCalled()
    })
  })

  describe('#emitDeleteAction', () => {
    it('leaves the store unchanged if no valid id is provided to the delete function', () => {
      const id = 1
      const data = {} as any
      const initialData = { [id]: { id, a: 3 } }
      const store = createTestStore(initialData)
      emitDeleteAction(data, store as any)

      expect(store.getState()).toStrictEqual(initialData)
    })

    it('deletes the item when a id is provided to the delete action', () => {
      const id = 1
      const data = { resourceId: id } as any
      const initialData = { [id]: { id, a: 3 } }
      const store = createTestStore(initialData)
      emitDeleteAction(data, store as any)

      expect(store.getState()[id]).toBeUndefined()
    })
  })

  describe('#transformResource', () => {
    it('parses the data if "parseResponse" is available', () => {
      const expectedResult = { id: 1 }
      const response = {}
      const routeData = {} as any
      const routeConfig = {
        parseResponse: jest.fn(() => expectedResult),
      } as any
      const store = createTestStore() as any
      const result = transformResource(response, routeData, routeConfig, store, getIdFromResourceMock)

      expect(result).toBe(expectedResult)
    })

    it('throws a warning if "parseResponse" is available but emits and array', () => {
      const expectedResult = [{ id: 1 }]
      const response = {}
      const routeData = {} as any
      const routeConfig = {
        parseResponse: jest.fn(() => expectedResult),
      } as any
      const store = createTestStore() as any
      const result = transformResource(response, routeData, routeConfig, store, getIdFromResourceMock)

      expect(result).toBeUndefined()
      expect(mockEmitWarning).toHaveBeenCalled()
    })

    it('If "transformData" is available, it parses the data', () => {
      const expectedResult = { id: 1 }
      const response = {}
      const routeData = {} as any
      const routeConfig = {
        transformData: jest.fn(() => expectedResult),
      } as any
      const store = createTestStore() as any
      const result = transformResource(response, routeData, routeConfig, store, getIdFromResourceMock)

      expect(result).toBe(expectedResult)
    })

    it('throws a warning if "transformData" is available but emits and array', () => {
      const expectedResult = [{ id: 1 }]
      const response = {}
      const routeData = {} as any
      const routeConfig = {
        transformData: jest.fn(() => expectedResult),
      } as any
      const store = createTestStore() as any
      const result = transformResource(response, routeData, routeConfig, store, getIdFromResourceMock)

      expect(result).toBeUndefined()
      expect(mockEmitWarning).toHaveBeenCalled()
    })

    it('throws a warning if the resulting item has a invalid id', () => {
      const response = { id: [] }
      const routeData = {} as any
      const routeConfig = {} as any
      const store = createTestStore() as any
      const result = transformResource(response, routeData, routeConfig, store, getIdFromResourceMock)

      expect(result).toBe(undefined)
      expect(mockEmitWarning).toHaveBeenCalled()
    })
  })

  describe('#emitUpdateItemAction', () => {
    it("saves a resource if has id and it's valid", () => {
      const id = 1
      const response = { id, a: 3 }
      const routeData = {} as any
      const routeConfig = {} as any
      const store = createTestStore()
      emitUpdateItemAction(response, routeData, routeConfig, store as any, getIdFromResourceMock)

      expect(store.getState()[id]).toBe(response)
    })

    it("leaves the store unchanged if resource has no id or it's invalid", () => {
      // Invalid id, should fail
      const id = 1
      const response = { a: 3 }
      const routeData = {} as any
      const routeConfig = {} as any
      const initialData = { [id]: { id, a: 3 } }
      const store = createTestStore(initialData)
      emitUpdateItemAction(response, routeData, routeConfig, store as any, getIdFromResourceMock)

      expect(store.getState()).toBe(initialData)
    })

    it('If partial updates are off, returns the result as is', () => {
      const resourceId = 1
      const response = { id: resourceId, a: 3 }
      const storedResource = { id: resourceId, b: 4 }
      const routeData = {} as any
      const storeConfig = {
        partialUpdate: false,
      }
      const store = createTestStore({ [resourceId]: storedResource }, storeConfig)
      emitUpdateItemAction(response, routeData, {} as any, store, getIdFromResourceMock)

      expect(store.getState()[resourceId]).toStrictEqual(response)
    })

    it('If partial updates are on, returns the merged result', () => {
      const resourceId = 1
      const response = { id: resourceId, a: 3 }
      const storedResource = { id: resourceId, b: 4 }
      const routeData = {} as any
      const storeConfig = {
        partialUpdate: true,
      }
      const store = createTestStore({ [resourceId]: storedResource }, storeConfig)
      emitUpdateItemAction(response, routeData, {} as any, store, getIdFromResourceMock)

      expect(store.getState()[resourceId]).toStrictEqual({ ...storedResource, ...response })
    })
  })
})
