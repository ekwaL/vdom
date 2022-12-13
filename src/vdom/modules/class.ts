import { VNode } from '../node'
import { isArray } from '../utils'

type ClassList = Record<string, boolean>
type Classes = string | string[] | ClassList

const stringToRecord = (classes: string): ClassList => ({ [classes]: true })

const arrayToRecord = (arr: string[]): ClassList => {
  const obj: ClassList = {}
  for (const c of arr) {
    obj[c] = true
  }
  return obj
}

const unifyClasses = (classes: Classes | undefined): ClassList => {
  if (isArray(classes)) {
    return arrayToRecord(classes)
  }
  if (typeof classes === 'string') {
    return stringToRecord(classes)
  }
  if (classes == null) {
    return {}
  }
  return classes
}

const updateDomNodeClass = (oldVNode: VNode, vnode: VNode): void => {
  if (!(vnode.el instanceof Element)) {
    return
  }

  const el = vnode.el
  let oldClass = oldVNode.options?.class
  let newClass = vnode.options?.class

  if (oldClass == null && newClass == null) return
  if (oldClass === newClass) return

  oldClass = unifyClasses(oldClass)
  newClass = unifyClasses(newClass)

  for (const [klass, val] of Object.entries(oldClass)) {
    if (klass.length !== 0 && val && !newClass[klass]) {
      el.classList.remove(klass)
    }
  }

  for (const [klass, val] of Object.entries(newClass)) {
    if (klass.length !== 0 && val && !oldClass[klass]) {
      el.classList.add(klass)
    }
  }
}

export { Classes, updateDomNodeClass }
