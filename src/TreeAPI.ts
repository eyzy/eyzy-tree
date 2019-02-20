import { TreeNode } from './types/Node'
import { TreeComponent } from './types/Tree'

import State from './utils/state'
import { isNodeCheckable, isLeaf } from './utils/index'
import { find } from './utils/find'
import { walkBreadth } from './utils/traveler'

type CheckboxValueConsistency = 'ALL' | 'BRANCH' | 'LEAF' | 'WITH_INDETERMINATE'

export class TreeAPI {
  private state: State
  private tree: TreeComponent

  constructor(tree: TreeComponent, state: State) {
    this.tree = tree
    this.state = state
  }

  find(...criterias: any): TreeNode | null {
    return find(this.state.get(), walkBreadth, false, criterias)
  }

  findAll(...criterias: any): TreeNode | null {
    return find(this.state.get(), walkBreadth, true, criterias)
  }

  selected(): TreeNode[] {
    const state = this.state
    const selectedNodes: Array<TreeNode | null> = this.tree.selectedNodes
      .map((id: string): TreeNode | null => state.getNodeById(id))

    return selectedNodes.filter((item: TreeNode | null) => null !== item) as TreeNode[]
  }

  checked(valueConsistsOf: CheckboxValueConsistency, ignoreDisabled?: boolean): TreeNode[] {
    const state = this.state
    let checkedNodes: TreeNode[] = []

    this.tree.checkedNodes.forEach((id: string) => {
      const node = state.getNodeById(id)

      if (node) {
        checkedNodes.push(node)
      }
    })

    if ('WITH_INDETERMINATE' === valueConsistsOf) {
      this.tree.indeterminateNodes.forEach((id: string) => {
        const node = state.getNodeById(id)
  
        if (node) {
          checkedNodes.push(node)
        }
      })
    }

    if (ignoreDisabled) {
      checkedNodes = checkedNodes.filter(isNodeCheckable)
    }

    switch(valueConsistsOf) {
      case 'LEAF': return checkedNodes.filter((node: TreeNode) => isLeaf(node))
      case 'BRANCH': 
        return checkedNodes.filter((node: TreeNode) => {
          if (node.parent && node.parent.checked) {
            return false
          }

          return true
        })
    }

    return checkedNodes
  }
}