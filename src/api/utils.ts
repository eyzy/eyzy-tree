import { TreeNode } from '../types/Node'

export const hasChild = (node: TreeNode): boolean => {
  return node.isBatch || node.child.length > 0
}

export const isArray = (obj: any): boolean => {
  return Array.isArray(obj)
}

export function toArray(value: any): any[] {
  return isArray(value) ? value : [value]
}