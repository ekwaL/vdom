import { Attributes } from './modules/attributes'
import { Classes } from './modules/class'
import { Data } from './modules/data'
import { Listeners } from './modules/listeners'
import { Properties } from './modules/props'
import { Styles } from './modules/style'
import { isArray, isPrimitive } from './utils'

type Key = string | number

interface VNodeOptions {
  id?: string
  props?: Properties
  attrs?: Attributes
  class?: Classes
  style?: Styles
  data?: Data
  on?: Listeners
  // props:
  [key: string]: any
}

interface VNode {
  tag: string | undefined
  options: VNodeOptions | undefined
  children: VNode[] | undefined
  text: string | undefined
  el: Node | undefined
  key: Key | undefined

  _listener?: EventListener
}

const vNode = (
  tag?: string,
  options?: VNodeOptions,
  children?: VNode[],
  text?: string,
  el?: Node,
  key?: Key,
  _listener?: EventListener
): VNode => ({ tag, options, children, text, el, key, _listener })

const emptyVNode = vNode('', {}, [])

const textVNode = (text: string): VNode =>
  vNode(undefined, undefined, undefined, text)

type VNodeChildElement = VNode | string | number | undefined | null
type VNodeChildren = VNodeChildElement[] | VNodeChildElement

function createElement(tag: string): VNode
function createElement(tag: string, attr: VNodeOptions | null): VNode
function createElement(tag: string, children: VNodeChildren): VNode
function createElement(
  tag: string,
  attr: VNodeOptions | null,
  children: VNodeChildren
): VNode
function createElement(
  tag: string,
  optsOrChildren?: VNodeOptions | VNodeChildren | null,
  chldrn?: VNodeChildren
): VNode {
  let opts: VNodeOptions = {}
  let children: VNodeChildElement[] | undefined
  let text: string | undefined

  if (chldrn !== undefined) {
    if (optsOrChildren != null) {
      opts = optsOrChildren as VNodeOptions
    }
    if (isArray(chldrn)) {
      children = chldrn
    } else if (isPrimitive(chldrn)) {
      children = [textVNode(String(chldrn))]
    } else if (chldrn?.tag !== undefined) {
      children = [chldrn]
    }
  } else if (optsOrChildren != null) {
    if (isArray(optsOrChildren)) {
      children = optsOrChildren
    } else if (isPrimitive(optsOrChildren)) {
      children = [textVNode(String(optsOrChildren))]
    } else if (optsOrChildren.tag !== undefined) {
      // at this point attrOrChildren can be VNode or Attr
      // and if it has `tag` for now we're assuming it's VNode
      children = [optsOrChildren as VNode]
    } else {
      opts = optsOrChildren as VNodeOptions
    }
  }

  const childVNodes = children
          ?.map(child =>
            typeof child === 'string' || typeof child === 'number'
              ? textVNode(String(child))
              : child
          )
          .filter((child): child is VNode => child != null)

  return vNode(tag, opts, childVNodes, text)
}

export { Key, VNodeOptions, VNode, vNode, createElement, emptyVNode }
