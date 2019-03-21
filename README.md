# usePortal
🌀 A React hook for using Portals

> Need to make dropdowns, lightboxes/modals/dialogs, global message notifications, or tooltips in React? React Portals provide a first-class way to render children into a DOM node that exists outside the DOM hierarchy of the parent component ([react docs](https://reactjs.org/docs/portals.html)).


### Examples
- <a target="_blank" rel="noopener noreferrer" href='https://codepen.io/alex-cory/pen/zeJxOo?editors=0010'>Modal Codepen Example</a>


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
