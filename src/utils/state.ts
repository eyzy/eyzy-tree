import { Node } from '../types/Node'

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

function updateChildNodes(parentNode: Node) {
  parentNode.child.forEach((child: Node) => {
    child.parent = parentNode
  })

  return parentNode
}

export default class State {
  private nodes: Node[]

  constructor(state: Node[]) {
    this.nodes = state
  }

  updateRootNode(node: Node, iterableValue?: IterableValue[]) {
    const i = getItemById(node.id, this.nodes)
    const newObj = copyObject(node)

    if (iterableValue) {
      iterableValue.forEach(([key, value]: IterableValue) => {
        node[key] = value
        newObj[key] = value
      })
    }

    if (null !== i) {
      this.nodes[i] = updateChildNodes(newObj as Node)
    }
  }

  updateLeafNode(node: Node, iterableValue: IterableValue[]) {
    const root: Node | null = rootElement(node)
    const parentNode: Node | null | undefined = node.parent

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

  set(id: string, key: any, value?: any): Node[] {
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

  getNodeIndex(node: Node): number | null {
    const parent: Node | null = node.parent
    const nodeId: string = node.id

    if (parent && parent.child) {
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

    for (let i = 0; i < this.nodes.length; i++ ) {
      if (this.nodes[i].id === nodeId) {
        return i
      }
    }
  
    return null
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

  get(): Node[] {
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