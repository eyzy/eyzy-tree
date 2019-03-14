import { TreeNode } from '../types/Node'

export function recurseDown(obj: any, fn: (obj: TreeNode, depth: number) => any, excludeSelf?: boolean, depth: number = 0): any {
  let res

  if (Array.isArray(obj)) {
    return obj.map(node => recurseDown(node, fn, false, depth))
  }

  if (!excludeSelf) {
    res = fn(obj, depth)
  }

  if (res !== false && obj.child && obj.child.length) {
    res = recurseDown(obj.child, fn, false, depth + 1)
  }

  return res
}

export function rootElement(obj: TreeNode): TreeNode | null {
  let node = obj.parent

  while (node) {
    if (!node.parent) {
      return node
    }

    node = node.parent
  }

  return null
}

export function traverseUp(obj: TreeNode, fn: (obj: TreeNode) => any): any {
  let node = obj.parent

  while (node) {
    if (false === fn(node) || !node.parent) {
      return
    }

    node = node.parent
  }
}

export function getFirstChild(node: TreeNode, onlyEnabled?: boolean): TreeNode | null {
  if (onlyEnabled) {
    const enabledNodes: TreeNode[] = node.child.filter((n: TreeNode) => !n.disabled)

    return enabledNodes.length ? enabledNodes[0] : null
  }

  return node.child[0] || null
}

export function getLastChild(node: TreeNode, onlyEnabled?: boolean): TreeNode | null {
  const len: number = node.child ? node.child.length : 0

  if (!len) {
    return null
  }

  if (onlyEnabled) {
    const enabledNodes: TreeNode[] = node.child.filter((n: TreeNode) => !n.disabled)
    const enabledNodeLen: number = enabledNodes.length

    return enabledNodeLen ? enabledNodes[enabledNodeLen - 1] : null
  }

  return node.child[len - 1]
}

export interface FlatMap {
  nodes: TreeNode[]
  ids: string[]
}

function isRootParentCollapsed(node: TreeNode) {
  const root: TreeNode | null = rootElement(node)
  return !root ? false : !root.expanded
}

export function flatMap(collection: TreeNode[], ignoreCollapsed?: boolean): FlatMap {
  const result = {
    nodes: [],
    ids: []
  } as FlatMap

  recurseDown(collection, (node: TreeNode) => {
    if (node.disabled) {
      return
    }

    if (ignoreCollapsed && node.parent && !node.parent.expanded || isRootParentCollapsed(node)) {
      return
    }

    result.nodes.push(node)
    result.ids.push(node.id)
  })

  return result
}

export function walkBreadth(items: TreeNode[], cb: (node: TreeNode) => boolean): boolean {
  const levels = {}

  recurseDown(items, (item: TreeNode) => {
    const depth = item.depth || 0

    if (!levels[depth]) {
      levels[depth] = []
    }

    levels[depth].push(item)
  })

  const nodes: TreeNode[] = Object.keys(levels).reduce((nodes: TreeNode[], level: string): TreeNode[] => {
    nodes.push(...levels[level])
    return nodes
  }, [])

  return nodes.some((node: TreeNode) => false === cb(node))
}