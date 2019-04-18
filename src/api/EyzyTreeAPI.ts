import { TreeComponent, TreeAPI, CheckboxValueConsistency } from '../types/Tree'
import { State } from '../types/State'
import { TreeNode } from '../types/Node'
import { IEyzyTreeAPI, IEyzyNodeAPI, APIOpts } from '../types/Api'

import EyzyNodeAPI from './EyzyNodeAPI'

const call = (api: IEyzyTreeAPI, name: string, query: any, args?: any[]): boolean => {
  return api._operate(query, (node: IEyzyNodeAPI) => {
    return args ? node[name].apply(node, args) : node[name]()
  })
}

export default class EyzyTreeAPI implements IEyzyTreeAPI {
  _tree: TreeComponent
  _state: State
  _api: TreeAPI

  opts: APIOpts

  constructor(api: TreeAPI, opts?: APIOpts) {
    this._tree = api.tree
    this._state = api.state
    this._api = api

    this.opts = opts || {}
  }

  useMultiple(isMultiple: boolean): EyzyTreeAPI {
    this.opts.multiple = isMultiple
    return this
  }

  _operate(query: any, operator: (node: IEyzyNodeAPI) => any): boolean {
    const nodes: TreeNode[] | (TreeNode | null) = this.opts.multiple
      ? this._api.findAll(query)
      : this._api.find(query)

    if (!nodes || Array.isArray(nodes) && !nodes.length) {
      return false
    }

    return operator(new EyzyNodeAPI(nodes, this._api, this.opts))
  }

  find(query: any): IEyzyNodeAPI {
    return new EyzyNodeAPI(this._api.find(query), this._api, this.opts)
  }

  findAll(query: any): IEyzyNodeAPI {
    return new EyzyNodeAPI(this._api.findAll(query), this._api, this.opts)
  }

  remove(query: any): boolean {
    return call(this, 'remove', query)
  }

  empty(query: any): boolean {
    return call(this, 'empty', query)
  }

  selected(): TreeNode | TreeNode[] | null {
    return this._api.selected()
  }

  select(query: any, extendSelection?: boolean): boolean {
    return call(this, 'select', query, [extendSelection])
  }

  unselectAll(): boolean {
    this._tree.unselectAll()
    return true
  }

  unselect(query: any): boolean {
    return call(this, 'unselect', query)
  }

  checked(valueConsistsOf?: CheckboxValueConsistency, ignoreDisabled?: boolean): TreeNode[] {
    return this._api.checked(valueConsistsOf, ignoreDisabled)
  }

  check(query: any): boolean {
    return call(this, 'check', query)
  }

  uncheck(query: any): boolean {
    return call(this, 'uncheck', query)
  }

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

  disable(query: any): boolean {
    return call(this, 'disable', query)
  }

  enable(query: any): boolean {
    return call(this, 'enable', query)
  }

  disableCheckbox(query: any): boolean {
    return call(this, 'disableCheckbox', query)
  }

  enableCheckbox(query: any): boolean {
    return call(this, 'enableCheckbox', query)
  }

  expand(query: any, includingDisabled?: boolean): boolean {
    return call(this, 'expand', query, [includingDisabled])
  }

  collapse(query: any, includingDisabled?: boolean): boolean {
    return call(this, 'collapse', query, [includingDisabled])
  }

  data(query: any, key: any, value?: any): any {
    return call(this, 'data', query, [key, value])
  }

  hasClass(query: any, className: string): boolean {
    return call(this, 'hasClass', query, [className])
  }

  addClass(query: any, classNames: string | string[]): any {
    return call(this, 'addClass', query, [classNames])
  }

  removeClass(query: any, classNames: string | string[]): any {
    return call(this, 'removeClass', query, [classNames])
  }
}