import { Node } from '../types/Node'

export function copyArray<T>(arr: T[]): T[] {
  return arr.concat([])
}

export function isNodeIndeterminate(node: Node, treeCheckedNodes: string[]): boolean {
  if (!node.child.length) {
    return false
  }

  const uncheckedNodes = node.child.reduce((count: number, item: Node) => {
    if (true !== item.disabled && true !== item.disabledCheckbox && !isNodeChecked(item, treeCheckedNodes)) {
      count++
    }

    return count
  }, 0)

  return uncheckedNodes > 0 && uncheckedNodes < node.child.length
}

export function isNodeChecked(node: Node, treeCheckedNodes: string[]): boolean {
  return treeCheckedNodes.indexOf(node.id) !== -1
}

export function isNodeSelected(node: Node, treeSelectedNodes: string[]): boolean {
  return treeSelectedNodes.indexOf(node.id) !== -1
}