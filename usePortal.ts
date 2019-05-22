import { useState, useRef, useEffect, useCallback, useMemo, ReactNode } from 'react'
import { createPortal, findDOMNode } from 'react-dom'
import useSSR from 'use-ssr'

interface UsePortalOptions {
  closeOnOutsideClick?: boolean,
  closeOnEsc?: boolean,
  renderOnClickedElement?: boolean,
  renderBelowClickedElement?: boolean, // appear directly under the clicked element/node in the DOM
  bindTo?: HTMLElement, // attach the portal to this node in the DOM
  isOpen?: boolean,
  stateful?: boolean,
}


export default function usePortal({
  closeOnOutsideClick = true,
  closeOnEsc = true,
  renderOnClickedElement,
  renderBelowClickedElement, // appear directly under the clicked element/node in the DOM
  bindTo, // attach the portal to this node in the DOM
  isOpen: defaultIsOpen = false,
  stateful = true,
}: UsePortalOptions = {}) {
  const { isServer, isBrowser } = useSSR()
  const [isOpen, makeOpen] = useState(defaultIsOpen)
  // we use this ref because `isOpen` is stale for handleOutsideMouseClick
  const open = useRef(isOpen)

  const setOpen = useCallback(v => {
    // workaround to not have stale `isOpen` in the handleOutsideMouseClick
    open.current = v
    makeOpen(v)
  }, [isOpen, open.current])

  const renderByRef = useRef()
  const portal = useRef(isBrowser && document.createElement('div'))

  useEffect(() => {
    if (isBrowser && !portal.current) portal.current = document.createElement('div')
  }, [isBrowser])

  const elToMountTo = useMemo(() => {
    if (isServer) return
    return ((bindTo && findDOMNode(bindTo)) || document.body)
  }, [isServer, bindTo])

  const handleKeydown = useCallback(e => {
    var ESC = 27
    if (e.keyCode === ESC && stateful && closeOnEsc) setOpen(false)
  }, [closeOnEsc, stateful, setOpen])

  const openPortal = useCallback(e => {
    if (isServer) return
    // for some reason, when we don't have the event argument there
    // is a weird race condition, would like to see if we can remove
    // setTimeout, but for now this works
    if (e == null) return setTimeout(() => stateful && setOpen(true), 0)
    if (e && e.nativeEvent) e.nativeEvent.stopImmediatePropagation()
    const { left, top, height } = e.target.getBoundingClientRect()
    if (renderOnClickedElement && portal.current instanceof HTMLElement) {
      portal.current.style.height = '0px';
      portal.current.style.position = 'absolute';
      portal.current.style.left = left + 'px';
      portal.current.style.top = top + 'px';
    } else if (renderBelowClickedElement && portal.current instanceof HTMLElement) {
      portal.current.style.position = 'absolute';
      portal.current.style.left = left + 'px';
      portal.current.style.top = top + height + 'px';
    }
    stateful && setOpen(true)
  }, [isServer, stateful, portal, setOpen, renderBelowClickedElement, renderOnClickedElement])

  const closePortal = useCallback(() => {
    if (isServer) return
    if (open.current) setOpen(false)
  }, [isServer, isOpen, open.current, setOpen])

  const togglePortal = useCallback(e => (
    isOpen ? setOpen(false) : openPortal(e)
  ), [isOpen, open.current, setOpen, openPortal])

  const handleOutsideMouseClick = useCallback(({ target, button }) => {
    if (isServer || !(portal.current instanceof HTMLElement)) return
    if (portal.current.contains(target) || button !== 0 || !open.current) return
    if (stateful && closeOnOutsideClick) closePortal()
  }, [isServer, isOpen, stateful, closePortal, closeOnOutsideClick])

  useEffect(() => {
    if (isServer || !(elToMountTo instanceof HTMLElement) || !(portal.current instanceof HTMLElement)) return

    const node = portal.current
    elToMountTo.appendChild(portal.current)
    document && document.addEventListener('keydown', handleKeydown)
    document && document.addEventListener('click', handleOutsideMouseClick)

    return () => {
      document && document.removeEventListener('keydown', handleKeydown)
      document && document.removeEventListener('click', handleOutsideMouseClick)
      elToMountTo.removeChild(node)
    }

  }, [isServer, handleOutsideMouseClick, handleKeydown, elToMountTo])

  const Portal = ({ children }: { children: ReactNode }) => {
    if (portal.current instanceof HTMLElement) return createPortal(children, portal.current)
    return null
  }

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
