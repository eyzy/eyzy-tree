import { Node } from '../types/Node'

import { recurseDown, rootElement } from './traveler'
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
  node.child.forEach((child: Node) => {
    const replaced = replaceChild(child)
    replaced.parent = node

    return replaced
  })

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

function updateChildNodes(parentNode: Node) {
  parentNode.child.forEach((child: Node) => {
    child.parent = parentNode
  })

  return parentNode
}

export type StateObject = { stirng: Node }

export default class State<T> {
  public length: number
  private nodes: T

  constructor(state: T, stateLength: number) {
    this.length = stateLength
    this.nodes = state
  }

  updateRootNode(node: Node, key?: string, value?: any) {
    const i = getItemById(node.id, this.nodes)
    const newObj = copyObject(node)

    if (key) {
      node[key] = value
      newObj[key] = value
    }

    if (null !== i) {
      this.nodes[i] = updateChildNodes(newObj as Node)
    }
  }

  updateLeafNode(node: Node, key: string, value: any) {
    const root: Node | null = rootElement(node)
    const parentNode: Node | null | undefined = node.parent

    if (!parentNode || !root || !parentNode.child) {
      return
    }

    const index = getNodeIndex(node.id, parentNode, this.length)

    if (null === index) {
      return
    }

    node[key] = value
    parentNode.child[index][key] = value

    this.updateRootNode(replaceChild(root))
  }

  set(id: string, key: string, value: any): T {
    const node = this.getNodeById(id)

    if (!node) {
      return this.nodes
    }

    if (isRoot(node)) {
      this.updateRootNode(node, key, value)
    } else {
      this.updateLeafNode(node, key, value)
    }

    return this.nodes
  }

  getNodeById(id: string): Node | null {
    let node: Node | null = null

    recurseDown(this.nodes, (obj: Node): any => {
      if (obj.id === id) {
        node = obj
        return false
      }
    })

    return node
  }

  get(): T {
    return this.nodes
  }

  toArray() {
    const result = []
    const state = this.nodes

    for (let i in state) {
      result.push(state[i])
    }

    return result
  }
}