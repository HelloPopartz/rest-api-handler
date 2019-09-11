import React, { useState } from 'react'
import { useApiResource } from '@rest-api-handler/react'
import './App.css'
import { resource } from './resource'
import { useCallback } from 'react'

const App: React.FC = () => {
  const [resourceId, setResourceId] = useState(1)
  const { loading, error, data } = useApiResource(resource, getApiHandlers => getApiHandlers().list(), [resourceId])
  const updateResource = useCallback(() => {
    if (!data || !data[0]) {
      return
    }
    const { put } = resource.getApiHandlers()
    put(resourceId, {
      id: resourceId,
      userId: 1,
      completed: false,
      title: 'hello',
    })
  }, [resourceId, data])
  return (
    <div className="App">
      <header className="App-header">
        <h1>Rest resource</h1>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <button style={{ margin: '0 8px' }} onClick={() => setResourceId(resourceId + 1)}>
            Get next resource
          </button>
          <button style={{ margin: '0 8px' }} onClick={updateResource}>
            Modify resource
          </button>
        </div>
        <div className="container">
          {loading && <h1 className="loading-screen">Loading</h1>}
          <pre
            style={{
              textAlign: 'left',
              padding: 32,
              margin: 0,
              textOverflow: 'ellipsis',
            }}
          >
            {error && error.stack}
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </header>
    </div>
  )
}

export default App
