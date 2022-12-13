import { VNode } from '../node'

type Properties = Record<string, unknown>

const updateDomNodeProperties = (oldVNode: VNode, newVNode: VNode): void => {
  const newEl = newVNode.el

  let oldProps = oldVNode.options?.props
  let newProps = newVNode?.options?.props

  if (oldProps == null && newProps == null) return
  if (oldProps === newProps) return

  oldProps = oldProps ?? {}
  newProps = newProps ?? {}

  for (const [prop, val] of Object.entries(oldProps)) {
    if (newEl != null) {
      if (val !== undefined && newProps[prop] === undefined) {
        ;(newEl as any)[prop] = undefined
      }
    }
  }

  for (const [prop, val] of Object.entries(newProps)) {
    const oldVal = oldProps[prop]
    if (
      oldVal !== val &&
      (prop !== 'value' || (newEl as any)?.[prop] !== val)
    ) {
      ;(newEl as any)[prop] = val
    }
  }
}

export { Properties, updateDomNodeProperties }
