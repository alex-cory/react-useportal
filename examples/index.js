import React from 'react'
import { render } from 'react-dom'
import usePortal from '../usePortal'

const Exmaple1 = () => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal()

  return (
    <>
      <h3>Example 1</h3>
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

const Example2 = () => {
  const {
    openPortal: openFirstPortal,
    closePortal: closeFirstPortal,
    isOpen: isFirstOpen,
    Portal: FirstPortal
  } = usePortal();

  const [
    openSecondPortal,
    closeSecondPortal,
    isSecondOpen,
    SecondPortal
  ] = usePortal();

  return (
    <>
      <h3>Example 2</h3>
      <button onClick={openFirstPortal}>Open First</button>
      {isFirstOpen && (
        <FirstPortal>
          I'm First.
          <button
            onClick={() => {
              openSecondPortal();
              closeFirstPortal();
            }}
          >
            Close Me and Open Second
          </button>
        </FirstPortal>
      )}
      {isSecondOpen && (
        <SecondPortal>
          I'm Second<button onClick={closeSecondPortal}>Close Me</button>
        </SecondPortal>
      )}
    </>
  );
}

// this should attach via `bind` so whatever you "bind" it to, you can click
// and it will apear near where you click. Need to figure out how to handle
// this though
const Example3 = () => {
  const { togglePortal, closePortal, isOpen, Portal, bind } = usePortal({
    // renderBelowClickedElement: true,
    style(portal, clickedElement) {
      const { x, y, height, width } = clickedElement
      // portal.style.top = `${height + 8}px`
      // portal.style.left = `${x}px`
      portal.style = `
        position: absolute;
        left: ${x}px;
        top: ${y + height + 8}px;
        background: blue;
        width: ${width}px;
      `
      return portal
    },
  })
}

function App() {
  return (
    <>
      <Exmaple1 />
      <Example2 />
    </>
  )
}

render(<App />, document.getElementById('root'))