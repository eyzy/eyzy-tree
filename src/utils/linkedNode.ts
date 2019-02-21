import { getFirstChild, getLastChild } from './traveler'
import { TreeNode } from '../types/Node'

interface LinkedNode {
  current: TreeNode
  parent?: TreeNode,
  next?: TreeNode,
  prev?: TreeNode
}

export function linkedNode(node: TreeNode, state: any, ignoreExpanded?: boolean): LinkedNode {
  const result: LinkedNode = {
    current: node
  }

  const currentNodeId: string = node.id
  const parent = node.parent
  const neighborIds: string[] = (parent ? parent.child : state.toArray())
    .map((n: TreeNode) => n.id)

  const currentPos: number = neighborIds.indexOf(currentNodeId)

  let i: number = 0

  if (node.expanded && node.child.length && true !== ignoreExpanded) {
    const firstChild: TreeNode | null = getFirstChild(node, true)

    if (firstChild) {
      result.next = state.byId(firstChild.id)
    }
  }

  while (i++ < neighborIds.length) {
    if (!result.next) {
      const node: TreeNode | null = state.byId(neighborIds[currentPos + i])

      if (node && !node.disabled) {
        result.next = node
      }
    }

    if (!result.prev) {
      const node: TreeNode | null = state.byId(neighborIds[currentPos - i])

      if (node && !node.disabled) {
        if (node.expanded) {
          const lastChild: TreeNode | null = getLastChild(node, true)

          if (lastChild) {
            result.prev =  state.byId(lastChild.id)
          }
        } else {
          result.prev = node
        }
      }
    }
  }

  if (parent) {
    if (!result.prev) {
      result.prev = state.byId(parent.id)
    }

    if (!result.next) {
      result.next = linkedNode(parent, state, true).next
    }
  }


  return result
}