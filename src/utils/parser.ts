import { Node } from '../types/Node'
import uuid from './uuid'

export function parseNode(data: Node[] | string): Node[] {
  if (!data || !Array.isArray(data)) {
    return []
  }

  if ('string' === typeof data) {
    return [
      { text: data, id: uuid() }
    ]
  }

  return data.map((node: Node) => {
    if ('string' === typeof node) {
      return {
        id: uuid(),
        text: node
      }
    }

    node.id = node.id || uuid()
    node.child = Array.isArray(node.child) 
      ? parseNode(node.child)
      : []

    return node
  })
}