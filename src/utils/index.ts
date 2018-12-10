import { Node } from '../types/Node'

export const hasOwnProp = {}.hasOwnProperty

export function isArray(obj: any): boolean {
  return Array.isArray(obj)
}

export function copyArray<T>(arr: T[]): T[] {
  return arr.concat([])
}

export function copyObject(obj: any) {
  const newObj = {}

  for (let i in obj) {
    if (hasOwnProp.call(obj, i)) {
      newObj[i] = isArray(obj[i]) ? copyArray(obj[i]) : obj[i]
    }
  }

  return newObj
}

export function isRoot(node: Node): boolean {
  return node && !node.parent
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