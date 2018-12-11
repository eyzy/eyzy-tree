import { Node } from '../types/Node'

import { recurseDown, traverseUp, rootElement } from './traveler'
import {
  isRoot,
  copyObject,
  copyArray
} from './index'

function replaceChild(node: Node): Node {
  if (!node || !node.child) {
    return node
  }

  node.child = copyArray(node.child)
  node.child.forEach(replaceChild)

  return node
}

function getItemById(id: string, targetState: any): any {
  return Object.keys(targetState)
    .find((k: string) => targetState[k].id === id) || null
}

function getNodeIndex(nodeId: string, parent: any, nodesLength: number): number | null {
  if (parent.child) {
    let childIndex: number | null = null

    parent.child.some((node: Node, i: number): boolean => {
      if (nodeId === node.id) {
        childIndex = i
        return true
      }

      return false
    })

    return childIndex
  }

  for (let i = 0; i < nodesLength; i++ ) {
    if (parent[i].id === nodeId) {
      return i
    }
  }

  return null
}

export default class State<T> {
  private state: T
  private stateLength: number

  constructor(state: T, stateLength: number) {
    this.state = state
    this.stateLength = stateLength
  }

  updateRootNode(node: Node, key?: string, value?: any) {
    const i = getItemById(node.id, this.state)
    const newObj = copyObject(node)

    if (key) {
      node[key] = value
      newObj[key] = value
    }

    if (null !== i) {
      this.state[i] = newObj
    }
  }

  updateLeafNode(node: Node, key: string, value: any) {
    const root: Node | null = rootElement(node)
    const parentNode: Node | null | undefined = node.parent

    if (!parentNode || !root || !parentNode.child) {
      return
    }

    const index = getNodeIndex(node.id, parentNode, this.stateLength)

    if (null === index) {
      return
    }

    node[key] = value
    parentNode.child[index][key] = value

    this.updateRootNode(replaceChild(root))
  }

  set(node: Node, key: string, value: any): T {
    if (isRoot(node)) {
      this.updateRootNode(node, key, value)
    } else {
      this.updateLeafNode(node, key, value)
    }

    return this.state
  }

  getNodeById(id: string): Node | null {
    let node: Node | null = null

    recurseDown(this.state, (obj: Node): any => {
      if (obj.id === id) {
        node = obj
        return false
      }
    })

    return node
  }

  get(): T {
    return this.state
  }
}