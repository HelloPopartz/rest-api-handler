import { checkIfValidId, emitRequestAction, emitDeleteAction, transformResource, emitUpdateItemAction } from '../handlers'

import * as Messages from '../../messages'

const storeName = 'test'

describe('#handlers', () => {
  function createStoreMock(state = {}) {
    return {
      getState: jest.fn(() => state),
      getStoreName: jest.fn(() => 'test'),
      dispatch: jest.fn(),
      actions: {
        deleteResource: jest.fn(),
        update: {
          request: jest.fn(),
          success: jest.fn(),
          cancel: jest.fn(),
        },
        updateList: {
          request: jest.fn(),
        },
      },
    }
  }

  function getIdFromResourceMock(data: any) {
    return data.id
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
    it('If a id is not valid, it will emit a warning', () => {
      checkIfValidId(storeName, null as any)
      checkIfValidId(storeName, undefined as any)
      checkIfValidId(storeName, [] as any)
      checkIfValidId(storeName, {} as any)
      expect(mockEmitWarning).toHaveBeenCalledTimes(4)
    })
    it('If a id is valid, emit nothing', () => {
      checkIfValidId(storeName, 1)
      checkIfValidId(storeName, '1')
      expect(mockEmitWarning).not.toHaveBeenCalled()
    })
  })
  describe('#emitRequestAction', () => {
    it('When no resourceId is available, no action is emitted', () => {
      const routeData = {} as any
      const routeConfig = { dataType: 'item' } as any
      const store = createStoreMock()
      emitRequestAction(routeData, routeConfig, store as any)
      expect(store.dispatch).not.toHaveBeenCalled()
    })
    it('When a resourceId is available and route is of type "item" it should emit a "request update" action', () => {
      const id = 1
      const routeData = { resourceId: id } as any
      const routeConfig = { dataType: 'item' } as any
      const store = createStoreMock()
      emitRequestAction(routeData, routeConfig, store as any)
      expect(store.dispatch).toHaveBeenCalled()
      expect(store.actions.update.request).toHaveBeenCalledWith({ id, routeData })
    })
    it('When a the route is of type "list" it should emit a "request update" action', () => {
      const routeData = {} as any
      const routeConfig = { dataType: 'list' } as any
      const store = createStoreMock()
      emitRequestAction(routeData, routeConfig, store as any)
      expect(store.dispatch).toHaveBeenCalled()
      expect(store.actions.updateList.request).toHaveBeenCalledWith({ routeData })
    })
  })
  describe('#emitDeleteAction', () => {
    it('When no resourceId is available, no action is emitted', () => {
      const routeData = {} as any
      const store = createStoreMock()
      emitDeleteAction(routeData, store as any)
      expect(store.dispatch).not.toHaveBeenCalled()
    })
    it('When a resourceId is available it should emit a "delete" action', () => {
      const id = 1
      const routeData = { resourceId: id } as any
      const store = createStoreMock()
      emitDeleteAction(routeData, store as any)
      expect(store.dispatch).toHaveBeenCalled()
      expect(store.actions.deleteResource).toHaveBeenCalledWith({ id, routeData })
    })
  })
  describe('#transformResource', () => {
   
    it('If "parseResponse" is available, it parses the data', () => {
      const expectedResult = { id: 1 }
      const response = {}
      const routeData = {} as any
      const routeConfig = {
        parseResponse: jest.fn(() => expectedResult),
      } as any
      const store = createStoreMock() as any
      const result = transformResource(response, routeData, routeConfig, store, getIdFromResourceMock)
      expect(result).toBe(expectedResult)
    })
    it('If "parseResponse" is available but emits and array, it throw a warning', () => {
      const expectedResult = [{ id: 1 }]
      const response = {}
      const routeData = {} as any
      const routeConfig = {
        parseResponse: jest.fn(() => expectedResult),
      } as any
      const store = createStoreMock() as any
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
      const store = createStoreMock() as any
      const result = transformResource(response, routeData, routeConfig, store, getIdFromResourceMock)
      expect(result).toBe(expectedResult)
    })
    it('If "transformData" is available but emits and array, it throw a warning', () => {
      const expectedResult = [{ id: 1 }]
      const response = {}
      const routeData = {} as any
      const routeConfig = {
        transformData: jest.fn(() => expectedResult),
      } as any
      const store = createStoreMock() as any
      const result = transformResource(response, routeData, routeConfig, store, getIdFromResourceMock)
      expect(result).toBeUndefined()
      expect(mockEmitWarning).toHaveBeenCalled()
    })
    it('If the resulting item has a invalid id, it throws a warning', () => {
      const response = { id: [] }
      const routeData = {} as any
      const routeConfig = {} as any
      const store = createStoreMock() as any
      const result = transformResource(response, routeData, routeConfig, store, getIdFromResourceMock)
      expect(result).toBe(undefined)
      expect(mockEmitWarning).toHaveBeenCalled()
    })
    it('If partial updates are off, returns the result without checking the store', () => {
      const response = { id: 1, a: 3 }
      const storedResource = { id: 1, b: 4 }
      const routeData = {} as any
      const routeConfig = {
        partialUpdate: false,
      } as any
      const store = createStoreMock({ [storedResource.id]: storedResource }) as any
      const result = transformResource(response, routeData, routeConfig, store, getIdFromResourceMock)
      expect(result).toBe(response)
    })
    it('If partial updates are on, returns the result without checking the store', () => {
      const response = { id: 1, a: 3 }
      const storedResource = { id: 1, b: 4 }
      const routeData = {} as any
      const routeConfig = {
        partialUpdate: true,
      } as any
      const store = createStoreMock({ [storedResource.id]: storedResource }) as any
      const result = transformResource(response, routeData, routeConfig, store, getIdFromResourceMock)
      expect(store.getState).toHaveBeenCalled()
      expect(result).toEqual({ ...response, ...storedResource })
    })
  })
  describe('#emitUpdateItemAction', () => {

    it('If data transformation is successful, it emits a "success update" action', () => {
      const response = { id: 1, a: 3 }
      const routeData = {} as any
      const routeConfig = {
      } as any
      const store = createStoreMock() 
      const result = emitUpdateItemAction(response, routeData, routeConfig, store as any, getIdFromResourceMock)
      expect(result).toBe(response)
      expect(store.actions.update.success).toHaveBeenCalled()
    })
    it('If data transformation fails, it emits a "cancel update" action', () => {
      // Invalid id, should fail
      const response = { a: 3 }
      const routeData = {} as any
      const routeConfig = {
      } as any
      const store = createStoreMock() 
      emitUpdateItemAction(response, routeData, routeConfig, store as any, getIdFromResourceMock)
      expect(store.actions.update.cancel).toHaveBeenCalled()
    })
})
