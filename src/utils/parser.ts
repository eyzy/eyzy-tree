import { TreeNode } from '../types/Node'
import uuid from './uuid'
import { isArray, isString } from './index'

export function parseNode(data: any, parentNode?: TreeNode | null): TreeNode[] {
  if (!isArray(data)) {
    return parseNode([data], parentNode)
  }

  const parent = parentNode || null

  return data
    .reduce((result: TreeNode[], node: TreeNode): TreeNode[] => {
      if ('number' === typeof node || !node) {
        return result
      }
      
      if ('string' === typeof node) {
        result.push({
          id: uuid(),
          text: node,
          parent,
          child: [],
          data: {}
        })
      } else if (isArray(node)) {
        result.push(...parseNode(node, parentNode))
      } else {
        node.id = node.id || uuid()
        node.child = isArray(node.child)
          ? parseNode(node.child, node)
          : []

        if (!node.data) {
          node.data = {}
        }

        node.parent = parent

        result.push(node)
      }

      return result
    }, [])
  .filter((node: TreeNode) => node.text && isString(node.text))
}