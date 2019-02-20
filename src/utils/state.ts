import { TreeNode } from '../types/Node'

import { recurseDown, rootElement } from './traveler'
import {
  isRoot,
  copyObject,
  copyArray,
  hasOwnProp
} from './index'

type IterableValue = [string, any]

function iterable(key: any, value: any): IterableValue[] {
  if ('string' === typeof key) {
    return [[key, value]]
  }

  if (!value) {
    const res: IterableValue[] = []

    for (const i in key) {
      if (hasOwnProp.call(key, i)) {
        res.push([i, key[i]])
      }
    }

    return res
  }

  return []
}

function replaceChild(node: TreeNode): TreeNode {
  if (!node || !node.child) {
    return node
  }

  node.child = copyArray(node.child)
  node.child.forEach((child: TreeNode) => {
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

function updateChildNodes(parentNode: TreeNode) {
  parentNode.child.forEach((child: TreeNode) => {
    child.parent = parentNode
  })

  return parentNode
}

export default class State {
  private nodes: TreeNode[]

  constructor(state: TreeNode[]) {
    this.nodes = state
  }

  updateRootNode(node: TreeNode, iterableValue?: IterableValue[]) {
    const i = getItemById(node.id, this.nodes)
    const newObj = copyObject(node)

    if (iterableValue) {
      iterableValue.forEach(([key, value]: IterableValue) => {
        node[key] = value
        newObj[key] = value
      })
    }

    if (null !== i) {
      this.nodes[i] = updateChildNodes(newObj as TreeNode)
    }
  }

  updateLeafNode(node: TreeNode, iterableValue: IterableValue[]) {
    const root: TreeNode | null = rootElement(node)
    const parentNode: TreeNode | null | undefined = node.parent

    if (!parentNode || !root || !parentNode.child) {
      return
    }

    const index = this.getNodeIndex(node)

    if (null === index) {
      return
    }

    if (iterableValue) {
      iterableValue.forEach(([key, value]: IterableValue) => {
        node[key] = value
        parentNode.child[index][key] = value
      })
    }

    this.updateRootNode(replaceChild(root))
  }

  set(id: string, key: any, value?: any): TreeNode[] {
    const node = this.getNodeById(id)

    if (!node) {
      return this.nodes
    }

    if (isRoot(node)) {
      this.updateRootNode(node, iterable(key, value))
    } else {
      this.updateLeafNode(node, iterable(key, value))
    }

    return this.nodes
  }

  getNodeIndex(node: TreeNode): number | null {
    const parent: TreeNode | null = node.parent
    const nodeId: string = node.id

    if (parent && parent.child) {
      let childIndex: number | null = null
  
      parent.child.some((node: TreeNode, i: number): boolean => {
        if (nodeId === node.id) {
          childIndex = i
          return true
        }
  
        return false
      })
  
      return childIndex
    }

    for (let i = 0; i < this.nodes.length; i++ ) {
      if (this.nodes[i].id === nodeId) {
        return i
      }
    }
  
    return null
  }

  getNodeById(id: string): TreeNode | null {
    let node: TreeNode | null = null

    recurseDown(this.nodes, (obj: TreeNode): any => {
      if (obj.id === id) {
        node = obj
        return false
      }
    })

    return node
  }

  get(): TreeNode[] {
    return this.nodes
  }

  toArray() {
    const result = []
    const state = this.nodes

    for (const i in state) {
      if (hasOwnProp.call(state, i)) {
        result.push(state[i])
      }
    }

    return result
  }
}