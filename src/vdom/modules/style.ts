import { CSSProperties } from '../../css'
import { VNode } from '../node'
import { camelToDash } from '../utils'

type Styles = Partial<CSSProperties>

const updateDomNodeStyles = (oldVNode: VNode, newVNode: VNode): void => {
  if (!(newVNode.el instanceof HTMLElement)) {
    return
  }

  const el = newVNode.el
  let oldStyles = oldVNode.options?.style
  let newStyles = newVNode.options?.style

  if (oldStyles == null && newStyles == null) return
  if (oldStyles === newStyles) return

  oldStyles = oldStyles ?? {}
  newStyles = newStyles ?? {}

  for (const rule in oldStyles) {
    if (newStyles[rule] == null) {
      el.style.removeProperty(camelToDash(rule))
    }
  }

  for (const [rule, value] of Object.entries(newStyles)) {
    if (oldStyles[rule] == null || oldStyles[rule] !== value) {
      el.style.setProperty(
        camelToDash(rule),
        value === undefined ? null : value
      )
    }
  }
}

export { Styles, updateDomNodeStyles }
