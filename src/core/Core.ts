import { TreeNode } from '../types/Node'
import { TreeComponent } from '../types/Tree'
import { State } from '../types/State'
import { Core } from '../types/Core'
import { callFetcher } from '../utils'
import { parseNode } from '../utils/parser'

type PromiseNodes = PromiseLike<TreeNode[]>

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

  load = (node: TreeNode, resource: (node: TreeNode) => PromiseNodes, skipLoading?: boolean): PromiseNodes => {
    const result = callFetcher(node, resource)

    if (!skipLoading) {
      this.set(node, 'loading', true)
    }

    return result.then((items: any) => {
      if (!skipLoading) {
        this.state.set(node.id, 'loading', false)
      }

      return parseNode(items)
    })
  }
}