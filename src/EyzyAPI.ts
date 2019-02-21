import { TreeComponent} from './types/Tree'
import { TreeAPI, CheckboxValueConsistency } from './types/TreeAPI'
import { State } from './types/State'
import { TreeNode } from './types/Node';

export default class EyzyTreeAPI {
  protected tree: TreeComponent
  protected state: State
  protected api: TreeAPI

  constructor(api: TreeAPI) {
    this.tree = api.tree
    this.state = api.state
    this.api = api
  }

  empty(criteria: any): boolean {
    const node: TreeNode | null = this.api.find(criteria)

    if (!node) {
      return false
    }
  
    this.state.set(node.id, 'child', [])
    this.tree.updateState(this.state)

    return true
  }

  selected(): TreeNode[] {
    return this.api.selected()
  }

  select(criteria: any): boolean {
    const node: TreeNode | null = this.api.find(criteria)

    if (!node || node.selected) {
      return false
    }
    
    this.tree.select(node)

    return true
  }

  unselect(criteria: any): boolean {
    const node: TreeNode | null = this.api.find(criteria)

    if (!node || !node.selected) {
      return false
    }
    
    this.tree.unselect(node)

    return true
  }

  checked(valueConsistsOf?: CheckboxValueConsistency, ignoreDisabled?: boolean): TreeNode[] {
    return this.api.checked(valueConsistsOf, ignoreDisabled)
  }

  check(criteria: any): boolean {
    const node: TreeNode | null = this.api.find(criteria)

    if (!node || node.selected) {
      return false
    }
    
    this.tree.select(node)

    return true
  }

  uncheck(criteria: any): boolean {
    const node: TreeNode | null = this.api.find(criteria)

    if (!node || !node.selected) {
      return false
    }
    
    this.tree.unselect(node)

    return true
  }


  remove() {}
  removeChild() {}
  after() {}
  before() {}
  prepend() {}
  append() {}
  expand() {}
  collapse() {}
  disable() {}
  enable() {}
  hide() {}
  show() {}

  text() {} // ???? getter / setter
}