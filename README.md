<h1 align="center">usePortal</h1>
<p align="center">🌀 React hook for using Portals</p>
<p align="center">
    <a href="https://github.com/alex-cory/react-useportal/pulls">
      <img src="https://camo.githubusercontent.com/d4e0f63e9613ee474a7dfdc23c240b9795712c96/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5052732d77656c636f6d652d627269676874677265656e2e737667" />
    </a>
    <a href="https://lgtm.com/projects/g/alex-cory/react-useportal/context:javascript">
      <img alt="undefined" src="https://img.shields.io/lgtm/grade/javascript/g/alex-cory/react-useportal.svg?logo=lgtm&logoWidth=18"/>
    </a>
    <a href="https://www.npmjs.com/package/react-useportal">
        <img src="https://img.shields.io/npm/dt/react-useportal.svg" />
    </a>
</p>

Need to make dropdowns, lightboxes/modals/dialogs, global message notifications, or tooltips in React? React Portals provide a first-class way to render children into a DOM node that exists outside the DOM hierarchy of the parent component ([react docs](https://reactjs.org/docs/portals.html)).

This hook is also isomorphic, meaning it works with SSR (server side rendering).

<p align="center">
  <a href="https://github.com/alex-cory/react-useportal">
    <img src="https://github.com/alex-cory/react-useportal/raw/master/usePortal.gif" />
  </a>
</p>

Features
--------
- SSR (server side rendering) support
- typescript support
- zero dependencies
- built in state

### Examples
- <a target="_blank" rel="noopener noreferrer" href='https://codesandbox.io/s/w6jp7z4pkk'>Code Sandbox Example</a>


Installation
------------

```shell
yarn add react-useportal      or     npm i -S react-useportal
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
  var { openPortal, closePortal, isOpen, Portal } = usePortal()

  // want to use array destructuring? You can do that too
  var [openPortal, closePortal, isOpen, Portal] = usePortal()

  return (
    <>
      <button onClick={openPortal}>
        Open Portal
      </button>
      {isOpen && (
        <Portal>
          <p>
            This Portal handles its own state.{' '}
            <button onClick={closePortal}>Close me!</button>, hit ESC or
            click outside of me.
          </p>
        </Portal>
      )}
    </>
  )
}
```

### Need Animations?
```jsx 
import usePortal from 'react-useportal'

const App = () => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal()
  return (
    <>
      <button onClick={openPortal}>
        Open Portal
      </button>
      <Portal>
        <p className={isOpen ? 'animateIn' : 'animateOut'}>
          This Portal handles its own state.{' '}
          <button onClick={closePortal}>Close me!</button>, hit ESC or
          click outside of me.
        </p>
      </Portal>
    </>
  )
}
```
**Make sure you are passing the html synthetic event to the `openPortal`. i.e. `onClick={e => openPortal(e)}`**

Options
-----
| Option                | Description                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------- |
| `closeOnOutsideClick` | This will close the portal when not clicking within the portal. Default is `true` |
| `closeOnEsc`   | This will allow you to hit ESC and it will close the modal. Default is `true`    |
| `renderBelowClickedElement` | This will put the portal right under the element that you click on. Great for dropdowns. Required to pass event to openPortal `onClick={event => openPortal(event)}` |
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
Todos
------
- [ ] add support for popup windows [resource 1](https://javascript.info/popup-windows) [resource 2](https://hackernoon.com/using-a-react-16-portal-to-do-something-cool-2a2d627b0202). Maybe something like
```jsx
  const { openPortal, closePortal, isOpen, Portal } = usePortal({
    popup: ['', '', 'width=600,height=400,left=200,top=200']
  })
  // window.open('', '', 'width=600,height=400,left=200,top=200')
```
<<<<<<< HEAD
- [X] make isomorphic
- [ ] see if it's reliable to rely on react's internals for determining whether we're on the server or not. [Here](https://github.com/JedWatson/exenv) it says not to, but that was also 3 years ago.
- [ ] make work without requiring the html synthetic event & document when you are required to have it and when you are not
=======
- [ ] make isomorphic
- [ ] make documentation for when the html synthetic event is required
>>>>>>> 090668bd4a707f6683ff2e2ad983ef48bae2e432
- [ ] clean up code
