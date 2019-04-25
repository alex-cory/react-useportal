<h1 align="center">usePortal</h1>
<p align="center">🌀 React hook for using Portals</p>
<p align="center">
    <a href="https://github.com/alex-cory/react-useportal/pulls">
      <img src="https://camo.githubusercontent.com/d4e0f63e9613ee474a7dfdc23c240b9795712c96/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5052732d77656c636f6d652d627269676874677265656e2e737667" />
    </a>
    <a href="https://www.npmjs.com/package/react-useportal">
        <img src="https://img.shields.io/npm/dt/use-portal.svg" />
    </a>
</p>

Need to make dropdowns, lightboxes/modals/dialogs, global message notifications, or tooltips in React? React Portals provide a first-class way to render children into a DOM node that exists outside the DOM hierarchy of the parent component ([react docs](https://reactjs.org/docs/portals.html)).

<p align="center">
  <a href="https://github.com/alex-cory/react-useportal">
    <img src="https://github.com/alex-cory/react-useportal/raw/master/usePortal.gif" />
  </a>
</p>

### Examples
- <a target="_blank" rel="noopener noreferrer" href='https://codesandbox.io/s/w6jp7z4pkk'>Code Sandbox Example</a>


Installation
------------

```shell
yarn add react react-dom react-useportal
```

Usage
-----

### Stateless
```jsx 
import usePortal from 'react-useportal'

<Portal>
  This text is portaled at the end of document.body!
</Portal>

<Portal bindTo={document && document.getElementById('san-francisco')}>
  This text is portaled into San Francisco!
</Portal>
```

### With State



```jsx 
import usePortal from 'react-useportal'

const App = () => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal()
  return (
    <React.Fragment>
      <button onClick={openPortal}>
        Open Portal
      </button>
      {isOpen && (
        <Portal>
          <p>
            This is more advanced Portal. It handles its own state.{' '}
            <button onClick={closePortal}>Close me!</button>, hit ESC or
            click outside of me.
          </p>
        </Portal>
      )}
    </React.Fragment>
  )
}
```
### Need Animations?
```jsx 
import usePortal from 'react-useportal'

const App = () => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal()
  return (
    <React.Fragment>
      <button onClick={openPortal}>
        Open Portal
      </button>
      <Portal>
        <p className={isOpen ? 'animateIn' : 'animateOut'}>
          This is more advanced Portal. It handles its own state.{' '}
          <button onClick={closePortal}>Close me!</button>, hit ESC or
          click outside of me.
        </p>
      </Portal>
    </React.Fragment>
  )
}
```

Options
-----
| Option                | Description                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------- |
| `closeOnOutsideClick` | This will close the portal when not clicking within the portal. Default is `true` |
| `closeOnEsc`   | This will allow you to hit ESC and it will close the modal. Default is `true`    |
| `renderBelowClickedElement` | This will put the portal right under the element that you click on. Great for dropdowns. |
| `bindTo` | This is the DOM node you want to attach the portal to. By default it attaches to `document.body` |
| `isOpen` | This will be the default for the portal. Default is `false` |

### Option Usage
```js
const {
  openPortal,
  closePortal,
  togglePortal,
  isOpen,
  Portal
} = usePortal({
  closeOnOutsideClick: true,
  closeOnEsc: true,
  renderBelowClickedElement, // appear directly under the clicked element/node in the DOM
  bindTo, // attach the portal to this node in the DOM
  isOpen: false,
})
```
