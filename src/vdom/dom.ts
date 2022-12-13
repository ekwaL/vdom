const domCreateElement = (tag: string): HTMLElement =>
  document.createElement(tag)

const domCreateTextNode = (text: string): Text => document.createTextNode(text)

const domCreateComment = (text: string): Comment => document.createComment(text)

const domAppendChild = (parent: Node, child: Node): void => {
  parent.appendChild(child)
}

const domRemoveNode = (node: Node): void => {
  node.parentNode?.removeChild(node)
}

const domIsTextNode = (node: Node): boolean => node.nodeType === 3

export {
  domCreateElement,
  domCreateTextNode,
  domCreateComment,
  domAppendChild,
  domRemoveNode,
  domIsTextNode
}
