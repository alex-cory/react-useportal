import React from 'react'
import { render } from 'react-dom'
import usePortal from '../usePortal'


function App() {
  const { openPortal, closePortal, isOpen, Portal } = usePortal()

  return (
    <>
      <button onClick={openPortal}>Open Portal</button>
      {isOpen && (
        <Portal>
          <div>
            Cool
            <button onClick={closePortal}>Close Portal</button>
          </div>
        </Portal>
      )}
    </>
  )
}

render(<App />, document.getElementById('root'))