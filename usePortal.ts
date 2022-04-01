import { useState, useRef, useEffect, useCallback, useMemo, ReactNode, DOMAttributes, SyntheticEvent, MutableRefObject, MouseEvent } from 'react'
import { createPortal, findDOMNode } from 'react-dom'
import useSSR from 'use-ssr'

type HTMLElRef = MutableRefObject<HTMLElement>
type CustomEvent = {
  event?: SyntheticEvent<any, Event>
  portal: HTMLElRef
  targetEl: HTMLElRef
} & SyntheticEvent<any, Event>

type CustomEventHandler = (customEvent: CustomEvent) => void
type CustomEventHandlers = {
  [K in keyof DOMAttributes<K>]?: CustomEventHandler
}

type EventListenerMap = { [K in keyof DOMAttributes<K>]: keyof GlobalEventHandlersEventMap }
type EventListenersRef = MutableRefObject<{
  [K in keyof DOMAttributes<K>]?: (event: SyntheticEvent<any, Event>) => void
}>

export type UsePortalOptions = {
  closeOnOutsideClick?: boolean
  closeOnEsc?: boolean
  bindTo?: HTMLElement // attach the portal to this node in the DOM
  isOpen?: boolean
  onOpen?: CustomEventHandler
  onClose?: CustomEventHandler
  onPortalClick?: CustomEventHandler
} & CustomEventHandlers

type UsePortalObjectReturn = {} // TODO
type UsePortalArrayReturn = [] // TODO

export const errorMessage1 = 'You must either add a `ref` to the element you are interacting with or pass an `event` to openPortal(e) or togglePortal(e).'

export default function usePortal({
  closeOnOutsideClick = true,
  closeOnEsc = true,
  bindTo, // attach the portal to this node in the DOM
  isOpen: defaultIsOpen = false,
  onOpen,
  onClose,
  onPortalClick,
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

  const createCustomEvent = (e: any) => {
    if (!e) return { portal, targetEl, event: e }
    const event = e || {}
    if (event.persist) event.persist()
    event.portal = portal
    event.targetEl = targetEl
    event.event = e
    const { currentTarget } = e
    if (!targetEl.current && currentTarget && currentTarget !== document) targetEl.current = event.currentTarget
    return event
  }

  // this should handle all eventHandlers like onClick, onMouseOver, etc. passed into the config
  const customEventHandlers: CustomEventHandlers = Object
    .entries(eventHandlers)
    .reduce<any>((acc, [handlerName, eventHandler]) => {
      acc[handlerName] = (event?: SyntheticEvent<any, Event>) => {
        if (isServer) return
        eventHandler(createCustomEvent(event))
      }
      return acc
    }, {})

  const openPortal = useCallback((e: any) => {
    if (isServer) return
    const customEvent = createCustomEvent(e)
    // for some reason, when we don't have the event argument, there
    // is a weird race condition. Would like to see if we can remove
    // setTimeout, but for now this works
    if (targetEl.current == null) {
      setTimeout(() => setOpen(true), 0)
      throw Error(errorMessage1)
    }
    if (onOpen) onOpen(customEvent)
    setOpen(true)
  }, [isServer, portal, setOpen, targetEl, onOpen])

  const closePortal = useCallback((e: any) => {
    if (isServer) return
    const customEvent = createCustomEvent(e)
    if (onClose && open.current) onClose(customEvent)
    if (open.current) setOpen(false)
  }, [isServer, onClose, setOpen])

  const togglePortal = useCallback((e: SyntheticEvent<any, Event>): void => 
    open.current ? closePortal(e) : openPortal(e),
    [closePortal, openPortal]
  )

  const handleKeydown = useCallback((e: KeyboardEvent): void => 
    (e.key === 'Escape' && closeOnEsc) ? closePortal(e) : undefined,
    [closeOnEsc, closePortal]
  )

  const handleOutsideMouseClick = useCallback((e: MouseEvent): void => {
    const containsTarget = (target: HTMLElRef) => target.current.contains(e.target as HTMLElement)
    if (containsTarget(portal) || (e as any).button !== 0 || !open.current || containsTarget(targetEl)) return
    if (closeOnOutsideClick) closePortal(e)
  }, [isServer, closePortal, closeOnOutsideClick, portal])

  const handleMouseDown = useCallback((e: MouseEvent): void => {
    if (isServer || !(portal.current instanceof HTMLElement)) return
    const customEvent = createCustomEvent(e)
    if (portal.current.contains(customEvent.target as HTMLElement) && onPortalClick) onPortalClick(customEvent)
    handleOutsideMouseClick(e)
  }, [handleOutsideMouseClick])

  // used to remove the event listeners on unmount
  const eventListeners = useRef({}) as EventListenersRef

  useEffect(() => {
    if (isServer) return
    if (!(elToMountTo instanceof HTMLElement) || !(portal.current instanceof HTMLElement)) return

    // TODO: eventually will need to figure out a better solution for this.
    // Surely we can find a way to map onScroll/onWheel -> scroll/wheel better,
    // but for all other event handlers. For now this works.
    const eventHandlerMap: EventListenerMap = {
      onScroll: 'scroll',
      onWheel: 'wheel',
    }
    const node = portal.current
    // handles all special case handlers. Currently only onScroll and onWheel
    Object.entries(eventHandlerMap).forEach(([handlerName /* onScroll */, eventListenerName /* scroll */]) => {
      if (!eventHandlers[handlerName as keyof EventListenerMap]) return
      eventListeners.current[handlerName as keyof EventListenerMap] = (e: any) => (eventHandlers[handlerName as keyof EventListenerMap] as any)(createCustomEvent(e))
      document.addEventListener(eventListenerName as keyof GlobalEventHandlersEventMap, eventListeners.current[handlerName as keyof EventListenerMap] as any)
    })
    document.addEventListener('keydown', handleKeydown)
    document.addEventListener('mousedown', handleMouseDown as any)

    return () => {
      // handles all special case handlers. Currently only onScroll and onWheel
      Object.entries(eventHandlerMap).forEach(([handlerName, eventListenerName]) => {
        if (!eventHandlers[handlerName as keyof EventListenerMap]) return
        document.removeEventListener(eventListenerName as keyof GlobalEventHandlersEventMap, eventListeners.current[handlerName as keyof EventListenerMap] as any)
        delete eventListeners.current[handlerName as keyof EventListenerMap]
      })
      document.removeEventListener('keydown', handleKeydown)
      document.removeEventListener('mousedown', handleMouseDown as any)
      // in case for some reason, we didn't remove the node when destroying Portal
      if (elToMountTo instanceof HTMLElement && node instanceof HTMLElement && elToMountTo.contains(node)) {
        elToMountTo.removeChild(node)
      }
    }
  }, [isServer, handleOutsideMouseClick, handleKeydown, elToMountTo, portal])

  const Portal = useCallback(({ children }: { children: ReactNode }) => {
    useEffect(() => {
      const node = portal.current
      if (!(elToMountTo instanceof HTMLElement) || !(portal.current instanceof HTMLElement)) return
      elToMountTo.appendChild(portal.current)
      return () => {
        if (!(elToMountTo instanceof HTMLElement) || !(portal.current instanceof HTMLElement)) return
        if (elToMountTo.contains(node)) elToMountTo.removeChild(node)
      }
    }, [])
    if (portal.current != null) return createPortal(children, portal.current)
    return null
  }, [portal])

  return Object.assign(
    [openPortal, closePortal, open.current, Portal, togglePortal, targetEl, portal],
    {
      isOpen: open.current,
      openPortal,
      ref: targetEl,
      closePortal,
      togglePortal,
      Portal,
      portalRef: portal,
      ...customEventHandlers,
      bind: { // used if you want to spread all html attributes onto the target element
        ref: targetEl,
        ...customEventHandlers
      }
    }
  )
}
