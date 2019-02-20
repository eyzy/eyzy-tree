import { Node, TreeNode } from '../types/Node'
import uuid from './uuid'

export function parseNode(data: Array<string | Node>, parentNode?: TreeNode | null): TreeNode[] {
  if (!data || !Array.isArray(data)) {
    return []
  }

  const parent = parentNode || null

  if ('string' === typeof data) {
    return parseNode([data], parent)
  }

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