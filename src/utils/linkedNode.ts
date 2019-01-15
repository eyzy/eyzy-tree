import { getFirstChild, getLastChild } from './traveler'
import { Node } from '../types/Node'

interface LinkedNode {
  current: Node
  parent?: Node,
  next?: Node,
  prev?: Node
}

export function linkedNode(node: Node, state: any, ignoreExpanded?: boolean): LinkedNode {
  const result: LinkedNode = {
    current: node
  }

  const currentNodeId: string = node.id
  const parent = node.parent
  const neighborIds: string[] = (parent ? parent.child : state.toArray())
    .map((n: Node) => n.id)

  const currentPos: number = neighborIds.indexOf(currentNodeId)

  let i: number = 0

  if (node.expanded && node.child.length && true !== ignoreExpanded) {
    const firstChild: Node | null = getFirstChild(node, true)

    if (firstChild) {
      result.next = state.getNodeById(firstChild.id)
    }
  }

  while (i++ < neighborIds.length) {
    if (!result.next) {
      const _node = state.getNodeById(neighborIds[currentPos + i])

      if (_node && !_node.disabled) {
        result.next = _node
      }
    }

    if (!result.prev) {
      const _node = state.getNodeById(neighborIds[currentPos - i])

      if (_node && !_node.disabled) {
        if (_node.expanded) {
          const lastChild: Node | null = getLastChild(_node, true)

          if (lastChild) {
            result.prev =  state.getNodeById(lastChild.id)
          }
        } else {
          result.prev = _node
        }
      }
    }
  }

  if (parent) {
    if (!result.prev) {
      result.prev = state.getNodeById(parent.id)
    }

    if (!result.next) {
      result.next = linkedNode(parent, state, true).next
    }
  }


  return result
}