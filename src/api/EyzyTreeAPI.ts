import { TreeComponent, TreeAPI, CheckboxValueConsistency } from '../types/Tree'
import { State } from '../types/State'
import { TreeNode } from '../types/Node'
import { IEyzyTreeAPI, IEyzyNodeAPI } from '../types/Api'

import EyzyNodeAPI from './EyzyNodeAPI'

const callMethod = (api: IEyzyTreeAPI, name: string, criteria: any, args?: any[]): boolean => {
  return api._operate(criteria, (node: IEyzyNodeAPI) => {
    return args ? node[name].apply(node, args) : node[name]()
  })
}

export const hasChild = (node: TreeNode): boolean => {
  return node.isBatch || node.child.length > 0
}

export default class EyzyTreeAPI implements IEyzyTreeAPI {
  _tree: TreeComponent
  _state: State
  _api: TreeAPI

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

  _operate(criteria: any, operator: (node: IEyzyNodeAPI) => any): boolean {
    const nodes: TreeNode[] | (TreeNode | null) = this.isMultiple
      ? this.findAll(criteria)
      : this.find(criteria)

    if (!nodes || Array.isArray(nodes) && !nodes.length) {
      return false
    }

    return operator(new EyzyNodeAPI(nodes, this))
  }

  find(...criteria: any): TreeNode | null {
    return this._api.find(...criteria)
  }

  findAll(...criteria: any): TreeNode[] {
    return this._api.findAll(...criteria)
  }

  remove(criteria: any): boolean {
    return true
  }

  empty(criteria: any): boolean {
    return callMethod(this, 'empty', criteria)
  }

  selected(): TreeNode[] {
    return this._api.selected()
  }

  select(criteria: any, extendSelection?: boolean): boolean {
    return callMethod(this, 'select', criteria, [extendSelection])
  }

  unselectAll(): boolean {
    this._tree.unselectAll()
    return true
  }

  unselect(criteria: any): boolean {
    return callMethod(this, 'unselect', criteria)
  }

  checked(valueConsistsOf?: CheckboxValueConsistency, ignoreDisabled?: boolean): TreeNode[] {
    return this._api.checked(valueConsistsOf, ignoreDisabled)
  }

  check(criteria: any): boolean {
    return callMethod(this, 'check', criteria)
  }

  uncheck(criteria: any): boolean {
    return callMethod(this, 'uncheck', criteria)
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
    return callMethod(this, 'disable', criteria)
  }

  enable(criteria: any): boolean {
    return callMethod(this, 'enable', criteria)
  }

  disableCheckbox(criteria: any): boolean {
    return callMethod(this, 'disableCheckbox', criteria)
  }

  enableCheckbox(criteria: any): boolean {
    return callMethod(this, 'enableCheckbox', criteria)
  }

  // TODO: expandAll - api.findAll({ expanded: true }).expand()
  expand(criteria: any): boolean {
    return callMethod(this, 'expand', criteria)
  }

  // TODO: collapseAll - api.find(node => new EyzyNodeAPI(node).hasChild())
  collapse(criteria: any): boolean {
    return callMethod(this, 'collapse', criteria)
  }
}