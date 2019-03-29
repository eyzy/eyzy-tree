import { TreeNode } from '../types/Node'
import { TreeComponent } from '../types/Tree'
import { State } from '../types/State'
import { Core, PromiseCallback, PromiseNodes, Resource, InsertOptions } from '../types/Core'
import { callFetcher, isCallable } from '../utils'
import { parseNode } from '../utils/parser'

function parseOpts(opts?: InsertOptions): InsertOptions {
  try {
    return Object.assign({}, {loading: true}, opts)
  } catch(e) {
    return {
      loading: true
    }
  }
}

export default class CoreTree implements Core {
  private state: State
  private tree: TreeComponent

  constructor(tree: TreeComponent, state: State) {
    this.state = state
    this.tree = tree
  }

  set = (node: TreeNode, key: string, value: any): void => {
    // TODO: selected, checked should be dublicated in the tree state
    this.state.set(node.id, key, value)
    this.tree.updateState()
  }

  load = (node: TreeNode, resource: Resource, showLoading?: boolean): PromiseNodes => {
    const result = callFetcher(node, resource)

    if (showLoading) {
      this.set(node, 'loading', true)
    }

    return result.then((items: any) => {
      if (showLoading) {
        this.state.set(node.id, 'loading', false)
      }

      return parseNode(items)
    })
  }

  insertAt = (targetNode: TreeNode, resource: Resource, insertIndex: number): PromiseNodes | TreeNode[] => {
    const parent: TreeNode | null = targetNode.parent || null
    const insert = (nodes: TreeNode[]) => {
      this.state.insertAt(
        parent ? parent : null,
        nodes,
        insertIndex
      )
      this.tree.updateState()
      return nodes
    }

    if (isCallable(resource)) {
      return this.load(targetNode, resource as PromiseCallback, false).then(insert)
    } else {
      return insert(parseNode(resource))
    }
  }

  addChild = (targetNode: TreeNode, resource: Resource, insertIndex: number | undefined, opts?: InsertOptions): PromiseNodes | TreeNode => {
    const id: string = targetNode.id
    const {expand, loading} = parseOpts(opts)

    if (isCallable(resource)) {
      return this.load(targetNode, resource, loading).then((nodes: TreeNode[]) => {
        this.tree.addChild(id, nodes, insertIndex)

        const updatedNode: TreeNode | null = this.state.byId(id)

        if (expand && updatedNode && !updatedNode.expanded) {
          this.tree.expand(updatedNode)
        }

        this.tree.updateState()

        return targetNode
      })
    } else {
      this.tree.addChild(id, resource)

      if (expand && !targetNode.expanded) {
        this.tree.expand(targetNode)
      }

      this.tree.updateState()
    }

    return targetNode
  }
}