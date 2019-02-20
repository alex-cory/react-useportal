# usePortal
⏱ A React hook for using Portals

> Struggling with modals, lightboxes or loading bars in React? React-portal creates a new top-level React tree and injects its children into it. That's necessary for proper styling (especially positioning).

## Installation

```shell
yarn add react react-dom react-useportal
```

## Usage

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
  const { openPortal, closePortal, Portal } = usePortal()
  return (
    <React.Fragment>
      <button onClick={openPortal}>
        Open Portal
      </button>
      <Portal>
        <p>
          This is more advanced Portal. It handles its own state.{' '}
          <button onClick={closePortal}>Close me!</button>, hit ESC or
          click outside of me.
        </p>
      </Portal>
    </React.Fragment>
  )
}
```

### Examples
- [Modal Codepen Example](https://codepen.io/alex-cory/pen/zeJxOo?editors=0010)
- [Select Dropdown Codepen Example](https://codepen.io/alex-cory/pen/GzyQLa)

Options
-----
| Option                | Description                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------- |
| `closeOnOutsideClick` | This will close the portal when not clicking within the portal. Default is `true` |
| `closeOnEsc`   | This will allow you to hit ESC and it will close the modal. Default is `true`    |
| `renderBelowClickedElement` | This will put the portal right under the element that you click on. Great for dropdowns. |
| `bindTo` | This is the DOM node you want to attach the portal to. By default it attaches to `document.body` |
| `isOpen` | This will be the default for the portal. Default is `false` |
