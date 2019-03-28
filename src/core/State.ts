import { TreeNode } from '../types/Node'
import { IterableValue, State as StateType } from '../types/State'

import { recurseDown, rootElement } from '../utils/traveler'
import {
  isRoot,
  copyObject,
  copyArray,
  hasOwnProp
} from '../utils/index'

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

function replace(node: TreeNode): TreeNode {
  if (!node || !node.child) {
    return node
  }

  node.child = copyArray(node.child)
  node.child.forEach((child: TreeNode) => {
    const replaced = replace(child)
    replaced.parent = node

    return replaced
  })

  return node
}

function itemById(id: string, targetState: any): any {
  return Object.keys(targetState)
    .find((k: string) => targetState[k].id === id) || null
}

function updateChild(parentNode: TreeNode) {
  parentNode.child.forEach((child: TreeNode) => {
    child.parent = parentNode
  })

  return parentNode
}

export default class State {
  nodes: TreeNode[]

  constructor(state: TreeNode[]) {
    this.nodes = state
  }

  updateRoot(node: TreeNode, iterableValue?: IterableValue[]) {
    const i = itemById(node.id, this.nodes)
    const newObj = copyObject(node)

    if (iterableValue) {
      iterableValue.forEach(([key, value]: IterableValue) => {
        node[key] = value
        newObj[key] = value
      })
    }

    if (null !== i) {
      this.nodes[i] = updateChild(newObj as TreeNode)
    }
  }

  updateLeaf(node: TreeNode, iterableValue?: IterableValue[]) {
    const root: TreeNode | null = rootElement(node)
    const parentNode: TreeNode | null | undefined = node.parent

    if (!parentNode || !root || !parentNode.child) {
      return
    }

    const index = this.getIndex(node)

    if (null === index) {
      return
    }

    if (iterableValue) {
      iterableValue.forEach(([key, value]: IterableValue) => {
        node[key] = value
        parentNode.child[index][key] = value
      })
    }

    this.updateRoot(replace(root))
  }

  set(id: string, key: any, value?: any): StateType {
    const node = this.byId(id)

    if (!node) {
      return this
    }

    if (isRoot(node)) {
      this.updateRoot(node, iterable(key, value))
    } else {
      this.updateLeaf(node, iterable(key, value))
    }

    return this
  }

  getIndex(node: TreeNode): number | null {
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

  insertAt(parent: TreeNode | null, nodes: TreeNode[], index: number): TreeNode[] | TreeNode {
    if (parent && parent.child) {
      const child: TreeNode[] = copyArray(parent.child)
      child.splice(index, 0, ...nodes)
    } else {
      this.nodes.splice(index, 0, ...nodes)
    }

    return nodes
  }

  remove(id: string): TreeNode | null {
    const node: TreeNode | null = this.byId(id)

    if (!node) {
      return null
    }

    const index: number | null = this.getIndex(node)

    if (null === index || !~index) {
      return null
    }

    const parent: TreeNode | null = node.parent

    if (!parent) {
      this.nodes.splice(index, 1)
    } else {
      const child = copyArray(parent.child)
      child.splice(index, 1)
      this.set(parent.id, 'child', child)
    }

    return node
  }

  byId(id: string): TreeNode | null {
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

  toArray(): TreeNode[] {
    const result: TreeNode[] = []
    const state = this.nodes

    for (const i in state) {
      if (hasOwnProp.call(state, i)) {
        result.push(state[i])
      }
    }

    return result
  }
}