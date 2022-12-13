import {
  domAppendChild,
  domCreateComment,
  domCreateElement,
  domCreateTextNode,
  domRemoveNode
} from './dom'
import { updateDomNodeAttrs } from './modules/attributes'
import { updateDomNodeClass } from './modules/class'
import { updateDomNodeDataAttr } from './modules/data'
import { updateDomNodeListeners } from './modules/listeners'
import { updateDomNodeProperties } from './modules/props'
import { updateDomNodeStyles } from './modules/style'
import { emptyVNode, vNode, VNode } from './node'
import { isArray } from './utils'

const textFrom = (txt: string | undefined): string =>
  txt === undefined ? '' : txt

const updateDomNode = (oldVNode: VNode, newVNode: VNode): void => {
  updateDomNodeProperties(oldVNode, newVNode)
  updateDomNodeAttrs(oldVNode, newVNode)
  updateDomNodeClass(oldVNode, newVNode)
  updateDomNodeDataAttr(oldVNode, newVNode)
  updateDomNodeListeners(oldVNode, newVNode)
  updateDomNodeStyles(oldVNode, newVNode)
}

const createDomNode = (vnode: VNode): Node => {
  const tag = vnode.tag

  switch (tag) {
    case undefined:
      return (vnode.el = domCreateTextNode(textFrom(vnode.text)))
    case '!':
      return (vnode.el = domCreateComment(textFrom(vnode.text)))
    case '':
      console.warn('!WARN! emptyVNode was rendered')
      return (vnode.el = domCreateComment('!WARN! emptyVNode was rendered'))
    default:
      vnode.el = domCreateElement(tag)
      updateDomNode(emptyVNode, vnode)

      if (isArray(vnode.children)) {
        for (const child of vnode.children) {
          domAppendChild(vnode.el, createDomNode(child))
        }
      }

      return vnode.el
  }
}

const isSameVNode = (first: VNode, second: VNode): boolean =>
  first === second || (first.tag === second.tag && first.key === second.key)

const isTextOrNotSameVNode = (first: VNode, second: VNode): boolean =>
  first.tag === undefined || !isSameVNode(first, second)

const vNodeForElement = (el: Element): VNode => {
  const id = el.id
  const classes = el.className?.split(' ')
  return vNode(
    el.tagName.toLocaleLowerCase(),
    {
      class: classes,
      attrs: { id }
    },
    undefined,
    undefined,
    el
  )
}

const isElement = (el: unknown): el is Element => el instanceof Element

const patch = (oldVNode: VNode | Element, newVNode: VNode): VNode => {
  if (isElement(oldVNode)) {
    oldVNode = vNodeForElement(oldVNode)
  }
  if (isTextOrNotSameVNode(oldVNode, newVNode)) {
    newVNode.el = render(newVNode)
    oldVNode.el?.parentNode?.replaceChild(newVNode.el, oldVNode.el)
    return newVNode
  }
  if (!(oldVNode.el instanceof HTMLElement)) {
    console.warn('!WARN: ', oldVNode.text, ' is not HTMLElement')
    return oldVNode
  }

  newVNode.el = oldVNode.el

  updateDomNode(oldVNode, newVNode)
  patchChild(newVNode.el, oldVNode.children, newVNode.children)

  return newVNode
}

const patchChild = (
  parentEl: Node,
  oldChildren: VNode[] = [],
  newChildren: VNode[] = []
): void => {
  let oldStartIdx = 0
  let newStartIdx = 0
  let oldEndIdx = oldChildren.length - 1
  let newEndIdx = newChildren.length - 1
  let oldStartNode: VNode | undefined = oldChildren[0]
  let newStartNode: VNode | undefined = newChildren[0]
  let oldEndNode: VNode | undefined = oldChildren[oldEndIdx]
  let newEndNode: VNode | undefined = newChildren[newEndIdx]

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (oldStartNode == null) {
      oldStartNode = oldChildren[++oldStartIdx]
    } else if (oldEndNode == null) {
      oldEndNode = oldChildren[--oldEndIdx]
    } else if (isSameVNode(oldStartNode, newStartNode)) {
      patch(oldStartNode, newStartNode)
      oldStartNode = oldChildren[++oldStartIdx]
      newStartNode = newChildren[++newStartIdx]
    } else if (isSameVNode(oldEndNode, newEndNode)) {
      patch(oldEndNode, newEndNode)
      oldEndNode = oldChildren[--oldEndIdx]
      newEndNode = newChildren[--newEndIdx]
    } else if (isSameVNode(oldStartNode, newEndNode)) {
      patch(oldStartNode, newEndNode)
      parentEl.insertBefore(
        newEndNode.el as Node,
        oldEndNode.el?.nextSibling as ChildNode | null
      ) /* oldStartNode patched to newEndNode (--move right to--) newEndNode position */
      oldStartNode = oldChildren[++oldStartIdx]
      newEndNode = newChildren[--newEndIdx]
    } else if (isSameVNode(oldEndNode, newStartNode)) {
      patch(oldEndNode, newStartNode)
      parentEl.insertBefore(
        newStartNode.el as Node,
        oldStartNode.el as Node
      ) /* newStartNode position (--move left to--) oldEndNode patched to newStartNode */
      oldEndNode = oldChildren[--oldEndIdx]
      newStartNode = newChildren[++newStartIdx]
    } else {
      const sameNodeIdx = findVNodeIdxInArray(
        newStartNode,
        oldChildren,
        oldStartIdx,
        oldEndIdx
      )
      if (sameNodeIdx === null) {
        newStartNode.el = render(newStartNode)
        insertNode(parentEl, newStartNode.el, oldStartNode.el)
      } else {
        // oldChildren[sameNodeIdx] is same to newStartNode
        const sameNode = oldChildren[sameNodeIdx]
        patch(sameNode, newStartNode)
        oldChildren[sameNodeIdx] = emptyVNode
        insertNode(parentEl, newStartNode.el as Node, oldStartNode.el)
      }
      newStartNode = newChildren[++newStartIdx]
    }
  }
  if (oldStartIdx > oldEndIdx) {
    const ref = newChildren[newEndIdx + 1]?.el ?? null
    addVNodes(parentEl, ref, newChildren, newStartIdx, newEndIdx)
  } else if (newStartIdx > newEndIdx) {
    removeNodes(oldChildren, oldStartIdx, oldEndIdx)
  }
}

const insertNode = (parent: Node, el: Node, ref: Node | undefined): void => {
  if (ref != null) {
    if (ref.parentNode === parent) {
      parent.insertBefore(el, ref)
    }
  } else {
    parent.appendChild(el)
  }
}

const addVNodes = (
  parentEl: Node,
  ref: Node | null,
  vnodes: VNode[],
  start: number = 0,
  end: number = vnodes.length - 1
): void => {
  for (let i = start; i <= end; i++) {
    const el = render(vnodes[i])
    parentEl.insertBefore(el, ref)
  }
}

const removeNodes = (
  vnodes: VNode[],
  start: number = 0,
  end: number = vnodes.length
): void => {
  for (let i = start; i <= end; i++) {
    if (vnodes[i]?.el != null) domRemoveNode(vnodes[i].el as Node)
  }
}

const findVNodeIdxInArray = (
  vnode: VNode,
  array: VNode[],
  start: number = 0,
  end: number = array.length - 1
): number | null => {
  for (let i = start; i <= end; i++) {
    const vn = array[i]
    if (vn != null && isSameVNode(vnode, vn)) return i
  }
  return null
}

const render = createDomNode

export { render, patch, createDomNode }
