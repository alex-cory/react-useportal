<p style="text-align: center;" align="center">
    <h1 align="center">usePortal</h1>
</p>
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
    <a href="https://bundlephobia.com/result?p=react-useportal">
      <img alt="undefined" src="https://img.shields.io/bundlephobia/minzip/react-useportal.svg">
    </a>
    <a href="https://greenkeeper.io/">
      <img src="https://badges.greenkeeper.io/alex-cory/react-useportal.svg">
    </a>
    <a href="https://circleci.com/gh/alex-cory/react-useportal">
      <img src="https://img.shields.io/circleci/project/github/alex-cory/react-useportal/master.svg" />
    <a href="https://codeclimate.com/github/alex-cory/react-useportal/maintainability">
      <img src="https://api.codeclimate.com/v1/badges/609840b6dc914e035d15/maintainability" />
    </a>
    <a href="https://github.com/alex-cory/react-useportal/blob/master/license.md">
      <img alt="undefined" src="https://img.shields.io/github/license/alex-cory/react-useportal.svg">
    </a>
    <a href="https://snyk.io/test/github/alex-cory/react-useportal?targetFile=package.json">
      <img src="https://snyk.io/test/github/alex-cory/react-useportal/badge.svg?targetFile=package.json" alt="Known Vulnerabilities" data-canonical-src="https://snyk.io/test/github/alex-cory/react-useportal?targetFile=package.json" style="max-width:100%;">
    </a>
    <a href="https://www.npmjs.com/package/react-useportal">
      <img src="https://img.shields.io/npm/v/react-useportal.svg" alt="Known Vulnerabilities" data-canonical-src="https://snyk.io/test/github/alex-cory/react-useportal?targetFile=package.json" style="max-width:100%;">
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
- TypeScript support
- 1 dependency ([use-ssr](https://github.com/alex-cory/use-ssr))
- Built in state

### Examples
- [Modal Example - Next.js - codesandbox container](https://codesandbox.io/s/useportal-in-nextjs-codesandbox-container-9rm5o) (sometimes buggy, if so try [this example](https://codesandbox.io/s/useportal-in-nextjs-ux9nb))
- [Modal Example (useModal) - create-react-app](https://codesandbox.io/s/w6jp7z4pkk)
- [Dropdown Example (useDropdown) - Next.js](https://codesandbox.io/s/useportal-usedropdown-587fo)
- [Tooltip Example (useTooltip) - Next.js](https://codesandbox.io/s/useportal-usedropdown-dgesf)


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

const App = () => {
  const { Portal } = usePortal()

  return (
    <Portal>
      This text is portaled at the end of document.body!
    </Portal>
  )
}

const App = () => {
  const { Portal } = usePortal()

  return (
    <Portal bindTo={document && document.getElementById('san-francisco')}>
      This text is portaled into San Francisco!
    </Portal>
  )
}
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

### Customizing the Portal directly
By using `onOpen`, `onClose` or any other event handler, you can modify the `portal` and return it. See [useDropdown](https://codesandbox.io/s/useportal-usedropdown-587fo) for a working example. It's important that you pass the `event` object to `openPortal`.

```jsx
const App = () => {
  const { openPortal, isOpen } = usePortal({
    onOpen({ portal }) {
      portal.current.style.cssText = `
        position: absolute;
        /* add your custom styles here! */
      `
      return portal
    }
  })
  
  return <button onClick={e => openPortal(e)}>Click Me<button>
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
| `onOpen` | This is used to call something when the portal is opened and to modify the css of the portal directly |
| `onClose` | This is used to call something when the portal is closed and to modify the css of the portal directly |
| html event handlers (i.e. `onClick`) | These can be used instead of `onOpen` to modify the css of the portal directly. [`onMouseEnter` and `onMouseLeave` example](https://codesandbox.io/s/useportal-usedropdown-dgesf) |

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
  onOpen: ({ event, portal, targetEl }) => {},
  onClose({ event, portal, targetEl }) {},
  // in addition, any event handler such as onClick, onMouseOver, etc will be handled like
  onClick({ event, portal, targetEl }) {}
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
- [ ] tests (priority)
- [ ] maybe have a `<Provider order={['Portal', 'openPortal']} />` then you can change the order of the array destructuring syntax
- [ ] instead of having a `stateful` option, just make `usePortal` stateful, and allow `import { Portal } from 'react-useportal'`
- [ ] make work without requiring the html synthetic event
- [ ] add example for tooltip (like [this one](https://codepen.io/davidgilbertson/pen/ooXVyw))
- [ ] add as many examples as possible 😊
- [ ] fix code so maintainability is A
- [ ] set up code climate test coverage
- [ ] optimize badges [see awesome badge list](https://github.com/boennemann/badges)
  - [ ] add code climate test coverage badge
- [X] document when you are required to have synthetic event
- [X] make isomorphic
- [X] continuous integration
- [X] greenkeeper
