import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal, findDOMNode } from 'react-dom'

export const usePortal = ({
  closeOnOutsideClick = true,
  closeOnEsc = true,
  renderOnClickedElement,
  renderBelowClickedElement, // appear directly under the clicked element/node in the DOM
  bindTo, // attach the portal to this node in the DOM
  isOpen: defaultIsOpen = false,
  stateful = true
} = {}) => {
  const [isOpen, setOpen] = useState(defaultIsOpen)

  const renderByRef = useRef()
  const portal = useRef(document.createElement('div'))
  const elToMountTo = (bindTo && findDOMNode(bindTo)) || (document && document.body)

  const handleKeydown = useCallback(e => {
      var ESC = 27
      if (!closeOnEsc) return
      e.keyCode === ESC && stateful && setOpen(false)
    }, [stateful])

  const openPortal = useCallback(e => {
    if (e && e.nativeEvent) e.nativeEvent.stopImmediatePropagation()
    const { left, top, height } = e.target.getBoundingClientRect()
    if (renderOnClickedElement) {
      portal.current.style = `
      height: 0px;
      position: absolute;
      left: ${left}px;
      top: ${top}px;
    `
    } else if (renderBelowClickedElement) {
      portal.current.style = `
      position: absolute;
      left: ${left}px;
      top: ${top + height}px;
    `
    }
    stateful && setOpen(true)
  }, [stateful, setOpen, portal, renderOnClickedElement])

  const handleOutsideMouseClick = useCallback(
    ({ target, button }) => {
      if (portal.current.contains(target) || button !== 0) return
      stateful && setOpen(false)
    },
    [stateful, setOpen]
  )

  useEffect(() => {
    elToMountTo.appendChild(portal.current)
    document.addEventListener('keydown', handleKeydown)
    document.addEventListener('click', handleOutsideMouseClick)
    return () => {
      document.removeEventListener('keydown', handleKeydown)
      document.removeEventListener('click', handleOutsideMouseClick)
      elToMountTo.removeChild(portal.current)
    }
  }, [elToMountTo, handleKeydown, handleOutsideMouseClick])

  return {
    isOpen,
    openPortal,
    onMouseDown: handleKeydown,
    ref: renderByRef,
    closePortal: () => setOpen(false),
    togglePortal: e => (isOpen ? setOpen(false) : openPortal(e)),
    Portal: ({ children }) => createPortal(children, portal.current),
    bind: {
      onMouseDown: handleKeydown,
      ref: renderByRef
    }
  }
}
