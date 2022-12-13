import { VNode } from '../node'

type Attributes = Record<string, string | number | boolean>

const updateDomNodeAttrs = (oldVNode: VNode, vnode: VNode): void => {
  if (!(vnode.el instanceof Element)) {
    return
  }

  const el = vnode.el
  let oldAttrs = oldVNode.options?.attrs
  let attrs = vnode.options?.attrs

  if (oldAttrs == null && attrs == null) return
  if (oldAttrs === attrs) return

  oldAttrs = oldAttrs ?? {}
  attrs = attrs ?? {}

  // set new attributes
  for (const [k, v] of Object.entries(attrs)) {
    const oldV = oldAttrs[k]
    if (oldV === v) {
      continue
    }
    switch (v) {
      case true:
        el.setAttribute(k, '')
        break
      case false:
        el.removeAttribute(k)
        break
      // TODO: Add cases for xml and xlink
      default:
        el.setAttribute(k, String(v))
    }
  }

  // remove old attributes
  for (const key in oldAttrs) {
    if (!(key in attrs)) {
      el.removeAttribute(key)
    }
  }
}

export { Attributes, updateDomNodeAttrs }
