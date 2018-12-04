import { Node } from '../types/Node'

export function copyArray<T>(arr: T[]): T[] {
  return arr.concat([])
}

export function isNodeIndeterminate(node: Node, treeCheckedNodes: string[]): boolean {
  if (!node.child.length) {
    return false
  }

  return node.child.some((item: Node) => {
    if (item.disabled || item.disabledCheckbox) {
      return false
    }

    return !isNodeChecked(item, treeCheckedNodes)
  })
}

export function isNodeChecked(node: Node, treeCheckedNodes: string[]): boolean {
  return treeCheckedNodes.indexOf(node.id) !== -1
}

export function isNodeSelected(node: Node, treeSelectedNodes: string[]): boolean {
  return treeSelectedNodes.indexOf(node.id) !== -1
}