import { useState, useRef, useEffect, useCallback, useMemo, ReactNode, DOMAttributes, EventHandler, SyntheticEvent , MutableRefObject} from 'react'
import { createPortal, findDOMNode } from 'react-dom'
import useSSR from 'use-ssr'

type HTMLElRef = MutableRefObject<HTMLElement>
type CustomEvent = { event?: SyntheticEvent<any, Event>, portal: HTMLElRef, targetEl: HTMLElement }
type CustomEventHandler = (customEvent: CustomEvent) => void | HTMLElRef
type EventHandlers = {
  [K in keyof DOMAttributes<K>]?: EventHandler<SyntheticEvent<any, Event>>
}

type UsePortalOptions = {
  closeOnOutsideClick?: boolean
  closeOnEsc?: boolean
  renderOnClickedElement?: boolean
  renderBelowClickedElement?: boolean // appear directly under the clicked element/node in the DOM
  bindTo?: HTMLElement // attach the portal to this node in the DOM
  isOpen?: boolean
  stateful?: boolean
  onOpen?: CustomEventHandler
  onClose?: CustomEventHandler
} & EventHandlers

export default function usePortal({
  closeOnOutsideClick = true,
  closeOnEsc = true,
  renderOnClickedElement,
  renderBelowClickedElement, // appear directly under the clicked element/node in the DOM
  bindTo, // attach the portal to this node in the DOM
  isOpen: defaultIsOpen = false,
  onOpen,
  onClose,
  ...eventHandlers
}: UsePortalOptions = {}): any {
  const { isServer, isBrowser } = useSSR()
  const [isOpen, makeOpen] = useState(defaultIsOpen)
  // we use this ref because `isOpen` is stale for handleOutsideMouseClick
  const open = useRef(isOpen)

  const setOpen = useCallback(v => {
    // workaround to not have stale `isOpen` in the handleOutsideMouseClick
    open.current = v
    makeOpen(v)
  }, [isOpen, open.current])

  const targetEl = useRef() as HTMLElRef // this is the element you are clicking/hovering/whatever, to trigger opening the portal
  const portal = useRef(isBrowser ? document.createElement('div') as HTMLElement : null) as HTMLElRef

  useEffect(() => {
    if (isBrowser && !portal.current) portal.current = document.createElement('div')
  }, [isBrowser])

  const elToMountTo = useMemo(() => {
    if (isServer) return
    return ((bindTo && findDOMNode(bindTo)) || document.body)
  }, [isServer, bindTo])

  const handleKeydown = useCallback(e => {
    var ESC = 27
    if (e.keyCode === ESC && closeOnEsc) closePortal()
  }, [closeOnEsc, setOpen])

  const openPortal = useCallback((event: SyntheticEvent<any, Event>) => {
    if (isServer) return
    // for some reason, when we don't have the event argument there
    // is a weird race condition, would like to see if we can remove
    // setTimeout, but for now this works
    if (event == null && targetEl.current == null) {
      setTimeout(() => setOpen(true), 0)
      throw Error('You must either bind to an element or pass an event to openPortal(e).')
    }
    if (event && event.nativeEvent) event.nativeEvent.stopImmediatePropagation()
    if (event) targetEl.current = event.currentTarget
    if (!targetEl.current) throw Error('You must either bind to an element or pass an event to openPortal(e).')
    const { left, top } = targetEl.current.getBoundingClientRect()
    if (onOpen) {
      handleEvent(onOpen, event)
    } else if (renderOnClickedElement && portal.current instanceof HTMLElement) {
      portal.current.style.cssText = `
        height: 0px;
        position: absolute;
        left: ${left}px;
        top: ${top}px;
      `
    } else if (renderBelowClickedElement && portal.current instanceof HTMLElement) {
      portal.current.style.cssText = `
        position: absolute;
        left: ${left};
        top: ${top};
      `
    }
    setOpen(true)
  }, [isServer, portal, setOpen, renderBelowClickedElement, renderOnClickedElement])

  const handleEvent = (func: CustomEventHandler, event?: SyntheticEvent<any, Event>) => {
    if (event && event.currentTarget) targetEl.current = event.currentTarget as HTMLElement
    // i.e. onClick, etc. inside usePortal({ onClick({ portal, targetEl }) {} })
    const maybePortal = func({ portal, targetEl: targetEl.current as HTMLElement, event })
    if (maybePortal) portal.current = maybePortal.current
  }

  const closePortal = useCallback((event?: SyntheticEvent<any, Event>) => {
    if (isServer) return
    if (onClose) handleEvent(onClose, event)
    if (open.current) setOpen(false)
  }, [isServer, isOpen, open.current, setOpen])

  const togglePortal = useCallback((e: SyntheticEvent<any, Event>) => (
    isOpen ? closePortal(e) : openPortal(e)
  ), [isOpen, open.current, closePortal, openPortal])

  const handleOutsideMouseClick = useCallback(e => {
    if (isServer) return
    if (!(portal.current instanceof HTMLElement)) return
    if (portal.current.contains(e.target) || e.button !== 0 || !open.current) return
    if (closeOnOutsideClick) closePortal(e)
  }, [isServer, isOpen, closePortal, closeOnOutsideClick])

  useEffect(() => {
    if (isServer) return
    if (!(elToMountTo instanceof HTMLElement) || !(portal.current instanceof HTMLElement)) return

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

  const Portal = useCallback(({ children }: { children: ReactNode }) => {
    if (portal.current != null) return createPortal(children, portal.current as HTMLElement)
    return null
  }, [portal.current])

  // this should handle all eventHandlers like onClick, onMouseOver, etc. passed into the config
  const customEventHandlers: EventHandlers = Object
    .entries(eventHandlers)
    .reduce<any>((acc, [handlerName, eventHandler]) => {
      acc[handlerName] = (event?: SyntheticEvent<any, Event>) => handleEvent(eventHandler, event)
      return acc
    },
    {}
  )

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
      ref: targetEl,
      closePortal,
      togglePortal,
      Portal,
      ...customEventHandlers,
      bind: {
        onMouseDown: handleKeydown,
        ref: targetEl,
        ...customEventHandlers,
      }
    }
  )
}
