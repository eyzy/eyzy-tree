import { TreeNode } from '../types/Node'
import { State } from '../types/State'

import { flatMap } from './traveler'

interface LinkedNode {
  current: TreeNode
  parent?: TreeNode | null,
  next?: TreeNode | null,
  prev?: TreeNode | null
}

export function linkedNode(node: TreeNode, state: State, ignoreExpanded?: boolean): LinkedNode {
  const result: LinkedNode = {
    current: node
  }

  const { ids } = flatMap(state.get(), true)
  const currentIndex: number = ids.indexOf(node.id)

  if (!~currentIndex) {
    return result
  }

  return {
    current: node,
    parent: node.parent,
    next: state.byId(ids[currentIndex + 1]),
    prev: state.byId(ids[currentIndex - 1])
  } as LinkedNode
}