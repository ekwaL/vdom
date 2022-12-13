import { VNode } from '../node'

type Events = keyof HTMLElementEventMap
type EventsType = HTMLElementEventMap[Events]

type Listener<E> = (this: VNode, event: E, vnode: VNode) => void

type Listeners = {
  [E in keyof HTMLElementEventMap]?:
    | Listener<HTMLElementEventMap[E]>
    | Array<Listener<HTMLElementEventMap[E]>>
}

const invokeHandler = <E extends Events>(
  handler:
    | Listener<HTMLElementEventMap[E]>
    | Array<Listener<HTMLElementEventMap[E]>>
    | Listener<unknown>
    | Array<Listener<unknown>>,
  event: HTMLElementEventMap[E],
  vnode: VNode
): void => {
  switch (typeof handler) {
    case 'function':
      handler.call(vnode, event, vnode)
      break
    case 'object':
      for (const hndlr of handler) {
        invokeHandler(hndlr, event, vnode)
      }
  }
}

const handleEvent = (event: EventsType, vnode: VNode): void => {
  const name = event.type as Events
  const on = vnode?.options?.on

  const handler = on?.[name]
  if (handler != null) {
    // TODO: FIX handler / listener typings
    invokeHandler(handler as Listener<unknown>, event, vnode)
  }
}

const createVNodeEventListener = (vnode: VNode): EventListener => (
  event: EventsType
): void => {
  handleEvent(event, vnode)
}

const updateDomNodeListeners = (oldVNode: VNode, vnode?: VNode): void => {
  const oldEl = oldVNode.el instanceof HTMLElement ? oldVNode.el : undefined
  const newEl = vnode?.el instanceof HTMLElement ? vnode.el : undefined

  const oldOn = oldVNode.options?.on
  const newOn = vnode?.options?.on

  const oldListener = oldVNode._listener

  if (oldOn == null && newOn == null) return
  if (oldOn === newOn) return

  if (oldOn != null && oldListener != null) {
    for (const evt in oldOn) {
      oldEl?.removeEventListener(evt, oldListener, false)
    }
  }

  if (newOn != null && vnode != null) {
    const listener = (vnode._listener = createVNodeEventListener(vnode))
    for (const evt in newOn) {
      newEl?.addEventListener(evt, listener, false)
    }
  }
}

export { Listeners, updateDomNodeListeners }
