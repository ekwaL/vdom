import { VNode } from '../node'

type Data = Record<string, string>

const updateDomNodeDataAttr = (oldVNode: VNode, vnode: VNode): void => {
  if (!(vnode.el instanceof Element)) {
    return
  }

  const el = vnode.el
  let oldData = oldVNode.options?.data
  let newData = vnode.options?.data

  if (oldData == null && newData == null) return
  if (oldData === newData) return

  oldData = oldData ?? {}
  newData = newData ?? {}

  for (const attr in oldData) {
    if (newData[attr] == null) {
      el.removeAttribute(`data-${attr.toLowerCase()}`)
    }
  }

  for (const [attr, val] of Object.entries(newData)) {
    if (oldData[attr] == null || oldData[attr] !== val) {
      el.setAttribute(`data-${attr.toLowerCase()}`, val)
    }
  }
}

export { Data, updateDomNodeDataAttr }
