import { Node } from './types/Node'

import State, { StateObject } from './utils/state'
import { isNodeCheckable, isLeaf } from './utils/index'
import { TreeComponent } from './types/TreeComponent'

type CheckboxValueConsistency = 'ALL' | 'TOP' | 'BRANCH' | 'LEAF' | 'WITH_INDETERMINATE' | 'BRANCH_PRIORITY'

export class TreeAPI {
  private state: State<StateObject>
  private tree: TreeComponent

  constructor(tree: TreeComponent, state: State<StateObject>) {
    this.tree = tree
    this.state = state
  }

  selected(): Node[] {
    const state = this.state
    const selectedNodes: (Node | null)[] = this.tree.selectedNodes
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
      case 'TOP': return checkedNodes.filter((node: Node) => !isLeaf(node) && !(node.parent && node.parent.checked))
      case 'BRANCH': return checkedNodes.filter((node: Node) => !isLeaf(node))
      case 'LEAF': return checkedNodes.filter((node: Node) => isLeaf(node))
    }

    return checkedNodes
  }
}