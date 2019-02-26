import { TreeComponent} from './types/Tree'
import { TreeAPI, CheckboxValueConsistency } from './types/TreeAPI'
import { State } from './types/State'
import { TreeNode } from './types/Node';

const hasChild = (node: TreeNode): boolean => {
  return node.isBatch || node.child.length > 0
}

export default class EyzyTreeAPI {
  private _tree: TreeComponent
  private _state: State
  private _api: TreeAPI

  isMultiple: boolean

  constructor(api: TreeAPI, isMultiple: boolean = false) {
    this._tree = api.tree
    this._state = api.state
    this._api = api
    this.isMultiple = isMultiple
  }

  useMultiple(isMultiple: boolean): EyzyTreeAPI {
    this.isMultiple = isMultiple
    return this
  }

  private _operate(criteria: any, operator: (node: TreeNode, state: State) => any): boolean {
    let result: boolean

    if (this.isMultiple) {
      const nodes: TreeNode[] = this.findAll(criteria)

      if (!nodes.length) {
        return false
      }

      result = nodes
        .map((node: TreeNode) => operator(node, this._state))
        .every(res => false !== res)
    } else {
      const node: TreeNode | null = this.find(criteria)

      if (!node) {
        return false
      }

      result = false !== operator(node, this._state)
    }

    if (result) {
      this._tree.updateState(this._state)
    }

    return result
  }

  find(...criteria: any): TreeNode | null {
    return this._api.find(...criteria)
  }

  findAll(...criteria: any): TreeNode[] {
    return this._api.findAll(...criteria)
  }

  empty(criteria: any): boolean {
    return this._operate(criteria, (node: TreeNode, state: State) => {
      state.set(node.id, 'child', [])
    })
  }

  selected(): TreeNode[] {
    return this._api.selected()
  }

  select(criteria: any, extendSelection?: boolean): boolean {
    if (this.isMultiple && !extendSelection) {
      this.unselectAll()
    }

    return this._operate(criteria, (node: TreeNode, state: State) => {
      if (node.selected) {
        return false
      }

      if (this.isMultiple) {
        this._tree.select(node, false, false !== extendSelection)
      } else {
        this._tree.select(node)
      }

      return false
    })
  }

  unselectAll(): boolean {
    this._tree.unselectAll()
    return true
  }

  unselect(criteria: any): boolean {
    return this._operate(criteria, (node: TreeNode, state: State) => {
      if (!node.selected) {
        return false
      }

      this._tree.unselect(node)
      return false
    })
  }

  checked(valueConsistsOf?: CheckboxValueConsistency, ignoreDisabled?: boolean): TreeNode[] {
    return this._api.checked(valueConsistsOf, ignoreDisabled)
  }

  check(criteria: any): boolean {
    if (!this._tree.props.checkable) {
      return false
    }

    return this._operate(criteria, (node: TreeNode, state: State) => {
      if (node.checked) {
        return false
      }

      this._tree.check(node)
      return false
    })
  }

  uncheck(criteria: any): boolean {
    if (!this._tree.props.checkable) {
      return false
    }

    return this._operate(criteria, (node: TreeNode, state: State) => {
      if (!node.checked) {
        return false
      }

      this._tree.check(node)
      return false
    })
  }

  // exclusive method that not implemented in component;
  uncheckAll(): boolean {
    if (!this._tree.props.checkable) {
      return false
    }

    const tree = this._tree
    const state = tree.getState()

    tree.checked = tree.checked.filter((id: string) => {
      state.set(id, 'checked', false)
      return false
    })

    tree.indeterminate = tree.indeterminate.filter((id: string) => {
      state.set(id, 'indeterminate', false)
      return false
    })

    tree.updateState(state)

    return true
  }

  disable(criteria: any): boolean {
    return this._operate(criteria, (node: TreeNode, state: State) => {
      if (node.disabled) {
        return false
      }

      state.set(node.id, 'disabled', true)
    })
  }

  enable(criteria: any): boolean {
    return this._operate(criteria, (node: TreeNode, state: State) => {
      if (!node.disabled) {
        return false
      }

      state.set(node.id, 'disabled', false)
    })
  }

  disableCheckbox(criteria: any): boolean {
    if (!this._tree.props.checkable) {
      return false
    }

    return this._operate(criteria, (node: TreeNode, state: State) => {
      if (node.disabledCheckbox) {
        return false
      }

      state.set(node.id, 'disabledCheckbox', true)
    })
  }

  enableCheckbox(criteria: any): boolean {
    if (!this._tree.props.checkable) {
      return false
    }

    return this._operate(criteria, (node: TreeNode, state: State) => {
      if (!node.disabledCheckbox) {
        return false
      }

      state.set(node.id, 'disabledCheckbox', false)
    })
  }

  // TODO: expandAll - api.findAll({ expanded: true }).expand()
  expand(criteria: any): boolean {
    return this._operate(criteria, (node: TreeNode, state: State) => {
      if (!hasChild(node) || node.expanded) {
        return false
      }

      this._tree.expand(node)
      return false
    })
  }

  // TODO: collapseAll - api.find(node => new EyzyNodeAPI(node).hasChild())
  collapse(criteria: any): boolean {
    return this._operate(criteria, (node: TreeNode, state: State) => {
      if (!hasChild(node) || !node.expanded) {
        return false
      }

      this._tree.expand(node)
      return false
    })
  }
}