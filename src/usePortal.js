import { useRef, useEffect, useState } from 'react'
import { findDOMNode, createPortal } from 'react-dom'


export default function usePortal({
  closeOnOutsideClick = true,
  closeOnEsc = true,
  renderBelowClickedElement, // appear directly under the clicked element/node in the DOM
  bindTo, // attach the portal to this node in the DOM
  isOpen: defaultIsOpen = false
} = {}) {
  const [isOpen, setOpen] = useState(defaultIsOpen)

  const portal = useRef(document.createElement('div'))
  const elToMountTo = (bindTo && findDOMNode(bindTo)) || (document && document.body)

  useEffect(() => {
    elToMountTo.appendChild(portal.current);
    document.addEventListener('keydown', handleKeydown)
    document.addEventListener('click', handleOutsideMouseClick)
    return () => {
      document.removeEventListener('keydown', handleKeydown)
      document.removeEventListener('click', handleOutsideMouseClick)
      elToMountTo.removeChild(portal.current)
    }
  }, [elToMountTo])

  var ESC = 27;
  const handleKeydown = e => closeOnEsc && e.keyCode === ESC && setOpen(false)

  const openPortal = e => {
    if (e && e.nativeEvent) e.nativeEvent.stopImmediatePropagation()
    if (renderBelowClickedElement) {
      const { left, top, height } = e.target.getBoundingClientRect()
      // TODO: not sure why this isn't working
      // https://www.w3schools.com/jsref/prop_style_csstext.asp
      // portal.current.cssText = `
      //   position: absolute;
      //   left: ${left}px;
      //   top: ${top + height}px;
      // `
      portal.current.style.position = 'absolute'
      portal.current.style.left = left + 'px'
      portal.current.style.top = top + height + 'px'
    }
    setOpen(true)
  }

  const handleOutsideMouseClick = ({ target, button }) => {
    if (closeOnOutsideClick) {
      if (portal.current.contains(target) || (button !== 0)) return
      setOpen(false)
    }
  }

  return {
    isOpen,
    openPortal,
    closePortal: () => setOpen(false),
    togglePortal: e => isOpen ? setOpen(false) : openPortal(e),
    Portal: ({ children }) => createPortal(children, portal.current)
  }
}
