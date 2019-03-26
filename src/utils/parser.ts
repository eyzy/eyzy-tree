import { TreeNode } from '../types/Node'
import uuid from './uuid'
import { isArray } from './index'

export function parseNode(data: any, parentNode?: TreeNode | null): TreeNode[] {
  if (!isArray(data)) {
    return parseNode([data], parentNode)
  }

  const parent = parentNode || null

  return data.map((node: TreeNode): TreeNode => {
    if ('string' === typeof node) {
      return {
        id: uuid(),
        text: node,
        parent,
        child: [],
        data: {}
      }
    }

    node.id = node.id || uuid()
    node.child = Array.isArray(node.child) 
      ? parseNode(node.child, node)
      : []

    if (!node.data) {
      node.data = {}
    }

    node.parent = parent

    return node
  })
}