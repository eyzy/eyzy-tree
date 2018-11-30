import { Node } from '../types/Node'
import uuid from './uuid'

export function parseNode(data: Node[] | string, parentNode?: Node | null): Node[] {
  if (!data || !Array.isArray(data)) {
    return []
  }

  const parent = parentNode || null

  if ('string' === typeof data) {
    return [
      { text: data, id: uuid(), parent, child: [] }
    ]
  }

  return data.map((node: Node) => {
    if ('string' === typeof node) {
      return {
        id: uuid(),
        text: node,
        parent,
        child: []
      }
    }

    node.id = node.id || uuid()
    node.child = Array.isArray(node.child) 
      ? parseNode(node.child, node)
      : []

    node.parent = parent

    return node
  })
}