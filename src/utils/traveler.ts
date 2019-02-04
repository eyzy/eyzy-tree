import { Node } from '../types/Node'
import { StateObject } from './state'

export function recurseDown(obj: any, fn: (obj: Node, depth: number) => any, excludeSelf?: boolean, depth: number = 0): any {
  let res

  if (Array.isArray(obj)) {
    return obj.map(node => recurseDown(node, fn, false, depth))
  }

  // TODO: get rid of it: create a State interface
  if (obj[0]) {
    return Object.keys(obj)
      .filter(key => isFinite(+key))
      .map(key => recurseDown(obj[key], fn, false, depth))
  }

  if (!excludeSelf) {
    res = fn(obj, depth)
  }

  if (res !== false && obj.child && obj.child.length) {
    res = recurseDown(obj.child, fn, false, depth + 1)
  }

  return res
}

export function rootElement(obj: Node): Node | null {
  let node = obj.parent

  while (node) {
    if (!node.parent) {
      return node
    }

    node = node.parent
  }

  return null
}

export function traverseUp(obj: Node, fn: (obj: Node) => any): any {
  let node = obj.parent

  while (node) {
    if (false === fn(node) || !node.parent) {
      return
    }

    node = node.parent
  }
}

export function getFirstChild(node: Node, onlyEnabled?: boolean): Node | null {
  if (onlyEnabled) {
    const enabledNode: Node[] = node.child.filter((n: Node) => !n.disabled)

    return enabledNode.length ? enabledNode[0] : null
  }

  return node.child[0] || null
}

export function getLastChild(node: Node, onlyEnabled?: boolean): Node | null {
  const len: number = node.child ? node.child.length : 0

  if (!len) {
    return null
  }

  if (onlyEnabled) {
    const enabledNode: Node[] = node.child.filter((n: Node) => !n.disabled)
    const enabledNodeLen: number = enabledNode.length

    return enabledNodeLen ? enabledNode[enabledNodeLen - 1] : null
  }

  return node.child[len - 1]
}

export interface FlatMap {
  nodes: Node[]
  ids: string[]
}

export function flatMap(collection: StateObject, ignoreCollapsed?: boolean): FlatMap {
  const result = {
    nodes: [],
    ids: []
  } as FlatMap

  recurseDown(collection, (node: Node) => {
    if (node.disabled) {
      return
    }

    if (ignoreCollapsed && node.parent && !node.parent.expanded) {
      return
    }

    result.nodes.push(node)
    result.ids.push(node.id)
  })

  return result
}