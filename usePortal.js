import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { createPortal, findDOMNode } from 'react-dom'

export function usePortal({
  closeOnOutsideClick = true,
  closeOnEsc = true,
  renderOnClickedElement,
  renderBelowClickedElement, // appear directly under the clicked element/node in the DOM
  bindTo, // attach the portal to this node in the DOM
  isOpen: defaultIsOpen = false,
  stateful = true,
} = {}) {
  const [isOpen, makeOpen] = useState(defaultIsOpen)
  const open = useRef(isOpen)
  const setOpen = useCallback(v => {
    // workaround to not have stale `isOpen` in the handleOutsideMouseClick
    open.current = v
    makeOpen(v)
  }, [isOpen, open.current])

  const renderByRef = useRef()
  const portal = useRef(document.createElement('div'))
  const elToMountTo = useMemo(() => (bindTo && findDOMNode(bindTo)) || (document && document.body), [])

  const handleKeydown = useCallback(e => {
    var ESC = 27
    if (e.keyCode === ESC && stateful && closeOnEsc) setOpen(false)
  }, [])

  const openPortal = useCallback(e => {
    // for some reason, when we don't have the event argument there
    // is a weird race condition, would like to see if we can remove
    // setTimeout, but for now this works
    if (e == null) return setTimeout(() => stateful && setOpen(true), 0)
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
  }, [stateful, portal])

  const closePortal = useCallback(() => {
    if (open.current) setOpen(false)
  }, [isOpen, open.current])

  const handleOutsideMouseClick = useCallback(({ target, button }) => {
    if (portal.current.contains(target) || button !== 0 || !portal.current || !open.current) return
    if (stateful && closeOnOutsideClick) closePortal()
  }, [isOpen])

  useEffect(() => {
    elToMountTo.appendChild(portal.current)
    document.addEventListener('keydown', handleKeydown)
    document.addEventListener('click', handleOutsideMouseClick)
    return () => {
      document.removeEventListener('keydown', handleKeydown)
      document.removeEventListener('click', handleOutsideMouseClick)
      elToMountTo.removeChild(portal.current)
    }
  }, [handleOutsideMouseClick, handleKeydown])

  const togglePortal = useCallback(e => isOpen ? setOpen(false) : openPortal(e), [isOpen, open.current])
  const Portal = ({ children }) => createPortal(children, portal.current)

  return Object.assign([
      openPortal,
      closePortal,
      open.current,
      Portal,
      togglePortal
    ],
    {
      isOpen: open.current,
      openPortal,
      onMouseDown: handleKeydown,
      ref: renderByRef,
      closePortal,
      togglePortal,
      Portal,
      bind: {
        onMouseDown: handleKeydown,
        ref: renderByRef
      }
    }
  )
}

export default usePortal