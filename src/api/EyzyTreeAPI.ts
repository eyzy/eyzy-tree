import { TreeComponent, TreeAPI, CheckboxValueConsistency } from '../types/Tree'
import { State } from '../types/State'
import { TreeNode } from '../types/Node'
import { IEyzyTreeAPI, IEyzyNodeAPI, APIOpts } from '../types/Api'

import EyzyNodeAPI from './EyzyNodeAPI'

const call = (api: IEyzyTreeAPI, name: string, query: any, multiple?: boolean, args?: any[]): boolean => {
  return api._operate(query, !!multiple, (node: IEyzyNodeAPI) => {
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

  _operate(query: any, multiple: boolean, operator: (node: IEyzyNodeAPI) => any): boolean {
    const nodes: TreeNode[] | (TreeNode | null) = multiple
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

  remove(query: any, multiple?: boolean): boolean {
    return call(this, 'remove', query, multiple)
  }

  empty(query: any, multiple?: boolean): boolean {
    return call(this, 'empty', query, multiple)
  }

  selected(): IEyzyNodeAPI {
    return new EyzyNodeAPI(this._api.selected(), this._api, this.opts)
  }

  select(query: any, extendSelection?: boolean): boolean {
    return call(this, 'select', query, false, [extendSelection])
  }

  unselectAll() {
    this._api.unselectAll()
  }

  unselect(query: any, multiple?: boolean): boolean {
    return call(this, 'unselect', query, multiple)
  }

  checked(valueConsistsOf?: CheckboxValueConsistency, ignoreDisabled?: boolean): TreeNode[] {
    return this._api.checked(valueConsistsOf, ignoreDisabled)
  }

  check(query: any, multiple?: boolean): boolean {
    return call(this, 'check', query, multiple)
  }

  uncheck(query: any, multiple?: boolean): boolean {
    return call(this, 'uncheck', query, multiple)
  }

  uncheckAll() {
    this._api.uncheckAll()
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