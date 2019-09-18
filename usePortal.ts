import { useState, useRef, useEffect, useCallback, useMemo, ReactNode, DOMAttributes, EventHandler, SyntheticEvent, MutableRefObject } from 'react'
import { createPortal, findDOMNode } from 'react-dom'
import useSSR from 'use-ssr'

type HTMLElRef = MutableRefObject<HTMLElement>
type CustomEvent = {
  event?: SyntheticEvent<any, Event>
  portal: HTMLElRef
  targetEl: HTMLElement
}
type CustomEventHandler = (customEvent: CustomEvent) => void | HTMLElRef
type EventHandlers = {
  [K in keyof DOMAttributes<K>]?: EventHandler<SyntheticEvent<any, Event>>
}

type UsePortalOptions = {
  closeOnOutsideClick?: boolean
  closeOnEsc?: boolean
  bindTo?: HTMLElement // attach the portal to this node in the DOM
  isOpen?: boolean
  stateful?: boolean
  onOpen?: CustomEventHandler
  onClose?: CustomEventHandler
} & EventHandlers

type UsePortalObjectReturn = {} // TODO
type UsePortalArrayReturn = [] // TODO

const errorMessage1 = 'You must either bind to an element or pass an event to openPortal(e).'

export default function usePortal({
  closeOnOutsideClick = true,
  closeOnEsc = true,
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

  const setOpen = useCallback((v: boolean) => {
    // workaround to not have stale `isOpen` in the handleOutsideMouseClick
    open.current = v
    makeOpen(v)
  }, [])

  const targetEl = useRef() as HTMLElRef // this is the element you are clicking/hovering/whatever, to trigger opening the portal
  const portal = useRef(isBrowser ? document.createElement('div') : null) as HTMLElRef

  useEffect(() => {
    if (isBrowser && !portal.current) portal.current = document.createElement('div')
  }, [isBrowser, portal])

  const elToMountTo = useMemo(() => {
    if (isServer) return
    return (bindTo && findDOMNode(bindTo)) || document.body
  }, [isServer, bindTo])

  const handleEvent = useCallback((func: CustomEventHandler, event?: SyntheticEvent<any, Event>) => {
    if (event && event.currentTarget) targetEl.current = event.currentTarget as HTMLElement
    // i.e. onClick, etc. inside usePortal({ onClick({ portal, targetEl }) {} })
    func({ portal, targetEl: targetEl.current as HTMLElement, event })
  }, [portal, targetEl]) 

  const openPortal = useCallback((event: SyntheticEvent<any, Event>) => {
    if (isServer) return
    // for some reason, when we don't have the event argument there
    // is a weird race condition, would like to see if we can remove
    // setTimeout, but for now this works
    if (event == null && targetEl.current == null) {
      setTimeout(() => setOpen(true), 0)
      throw Error(errorMessage1)
    }
    if (event && event.nativeEvent) event.nativeEvent.stopImmediatePropagation()
    if (event) targetEl.current = event.currentTarget
    if (!targetEl.current) throw Error(errorMessage1)
    if (onOpen) handleEvent(onOpen, event)
    setOpen(true)
  }, [isServer, portal, setOpen, handleEvent, targetEl, onOpen])

  const closePortal = useCallback((event?: SyntheticEvent<any, Event>) => {
    if (isServer) return
    if (onClose) handleEvent(onClose, event)
    if (open.current) setOpen(false)
  }, [isServer, handleEvent, onClose, setOpen])

  const togglePortal = useCallback((e: SyntheticEvent<any, Event>) => 
    open.current ? closePortal(e) : openPortal(e),
    [closePortal, openPortal]
  )

  const handleKeydown = useCallback(e => {
    var ESC = 27
    if (e.keyCode === ESC && closeOnEsc) closePortal(e)
  }, [closeOnEsc, closePortal])

  const handleOutsideMouseClick = useCallback(e  => {
    if (isServer) return
    if (!(portal.current instanceof HTMLElement)) return
    if (portal.current.contains(e.target) || e.button !== 0 || !open.current || targetEl.current.contains(e.target)) return
    if (closeOnOutsideClick) closePortal(e)
  }, [isServer, closePortal, closeOnOutsideClick, portal])

  useEffect(() => {
    if (isServer) return
    if (!(elToMountTo instanceof HTMLElement) || !(portal.current instanceof HTMLElement)) return

    const node = portal.current
    elToMountTo.appendChild(portal.current)
    document && document.addEventListener('keydown', handleKeydown)
    document && document.addEventListener('mousedown', handleOutsideMouseClick)

    return () => {
      document && document.removeEventListener('keydown', handleKeydown)
      document && document.removeEventListener('mousedown', handleOutsideMouseClick)
      elToMountTo.removeChild(node)
    }
  }, [isServer, handleOutsideMouseClick, handleKeydown, elToMountTo, portal])

  const Portal = useCallback(({ children }: { children: ReactNode }) => {
    if (portal.current != null) return createPortal(children, portal.current)
    return null
  }, [portal])

  // this should handle all eventHandlers like onClick, onMouseOver, etc. passed into the config
  const customEventHandlers: EventHandlers = Object
    .entries(eventHandlers)
    .reduce<any>((acc, [handlerName, eventHandler]) => {
      acc[handlerName] = (event?: SyntheticEvent<any, Event>) => handleEvent(eventHandler, event)
      return acc
    }, {})

  return Object.assign(
    [openPortal, closePortal, open.current, Portal, togglePortal],
    {
      isOpen: open.current,
      openPortal,
      ref: targetEl,
      closePortal,
      togglePortal,
      Portal,
      ...customEventHandlers,
      bind: {
        ref: targetEl,
        ...customEventHandlers
      }
    }
  )
}
