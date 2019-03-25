import { TreeNode } from '../types/Node'

export const hasChild = (node: TreeNode): boolean => {
  return node.isBatch || node.child.length > 0
}
