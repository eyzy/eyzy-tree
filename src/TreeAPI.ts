import { Node } from './types/Node'

import State from './utils/state'
import { isNodeCheckable, isLeaf } from './utils/index'
import { TreeComponent } from './types/TreeComponent'
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

  find(...criterias: any): Node | null {
    return find(this.state.get(), walkBreadth, false, criterias)
  }

  findAll(...criterias: any): Node | null {
    return find(this.state.get(), walkBreadth, true, criterias)
  }

  selected(): Node[] {
    const state = this.state
    const selectedNodes: Array<Node | null> = this.tree.selectedNodes
      .map((id: string): Node | null => state.getNodeById(id))

    return selectedNodes.filter((item: Node | null) => null !== item) as Node[]
  }

  checked(valueConsistsOf: CheckboxValueConsistency, ignoreDisabled?: boolean): Node[] {
    const state = this.state
    let checkedNodes: Node[] = []

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
      case 'LEAF': return checkedNodes.filter((node: Node) => isLeaf(node))
      case 'BRANCH': 
        return checkedNodes.filter((node: Node) => {
          if (node.parent && node.parent.checked) {
            return false
          }

          return true
        })
    }

    return checkedNodes
  }
}