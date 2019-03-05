import { TreeNode } from '../types/Node'

export const hasChild = (node: TreeNode): boolean => {
  return node.isBatch || node.child.length > 0
}

export function recurseDown(obj: TreeNode | TreeNode[], fn: (obj: TreeNode | TreeNode[]) => any, excludeSelf?: boolean): any {
  let res

  if (Array.isArray(obj)) {
    return obj.map(node => recurseDown(node, fn))
  }

  if (!excludeSelf) {
    res = fn(obj)
  }

  if (res !== false && obj.child && obj.child.length) {
    res = recurseDown(obj.child, fn)
  }

  return res
}

export function removeArrItem(targetArr: any[], targetItem: any) {
  const index: number = targetArr.indexOf(targetItem)

  if (~index) {
    targetArr.splice(index, 1)
  }
}