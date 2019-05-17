import { TreeComponent, TreeAPI, CheckboxValueConsistency } from '../types/Tree'
import { State } from '../types/State'
import { TreeNode } from '../types/Node'
import { APIResult, APIBooleanResult, IEyzyTreeAPI, IEyzyNodeAPI, APIOpts } from '../types/Api'
import { InsertOptions } from '../types/Core'
import { isArray } from './utils'

import EyzyNodeAPI from './EyzyNodeAPI'

const call = <T>(api: IEyzyTreeAPI, name: string, query: any, multiple?: boolean, args?: any[]): T | null => {
  return api._operate<T>(query, !!multiple, (node: IEyzyNodeAPI) => {
    return node[name].apply(node, args || [])
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

  _operate<T>(query: any, multiple: boolean, operator: (node: IEyzyNodeAPI) => any): T | null {
    const nodes: TreeNode[] | (TreeNode | null) = multiple
      ? this._api.findAll(query)
      : this._api.find(query)

    if (!nodes || isArray(nodes) && !(nodes as TreeNode[]).length) {
      return null
    }

    return operator(new EyzyNodeAPI(nodes, this._api, this.opts))
  }

  find(query: any): IEyzyNodeAPI {
    return new EyzyNodeAPI(
      this._api.find(query), 
      this._api, 
      this.opts
    )
  }

  findAll(query: any): IEyzyNodeAPI {
    return new EyzyNodeAPI(
      this._api.findAll(query), 
      this._api, 
      this.opts
    )
  }

  remove(query: any, multiple?: boolean): APIResult {
    return call<TreeNode | TreeNode[]>(this, 'remove', query, multiple)
  }

  empty(query: any, multiple?: boolean): APIBooleanResult {
    return call<APIBooleanResult>(this, 'empty', query, multiple)
  }

  selected(): IEyzyNodeAPI {
    return new EyzyNodeAPI(this._api.selected(), this._api, this.opts)
  }

  select(query: any, extendSelection?: boolean, expandOnSelect?: boolean): APIBooleanResult {
    return call<APIBooleanResult>(this, 'select', query, false, [extendSelection, expandOnSelect])
  }

  unselectAll() {
    this._api.unselectAll()
  }

  unselect(query: any, multiple?: boolean): boolean {
    return call<any>(this, 'unselect', query, multiple)
  }

  checked(valueConsistsOf?: CheckboxValueConsistency, ignoreDisabled?: boolean): IEyzyNodeAPI {
    return new EyzyNodeAPI(this._api.checked(valueConsistsOf, ignoreDisabled), this._api, this.opts)
  }

  check(query: any, multiple?: boolean): boolean {
    return call<any>(this, 'check', query, multiple)
  }

  uncheck(query: any, multiple?: boolean): boolean {
    return call<any>(this, 'uncheck', query, multiple)
  }

  uncheckAll() {
    this._api.uncheckAll()
  }

  disable(query: any, multiple?: boolean): boolean {
    return call<any>(this, 'disable', query, multiple)
  }

  enable(query: any, multiple?: boolean): boolean {
    return call<any>(this, 'enable', query, multiple)
  }

  disableCheckbox(query: any, multiple?: boolean): boolean {
    return call<any>(this, 'disableCheckbox', query, multiple)
  }

  enableCheckbox(query: any, multiple?: boolean): boolean {
    return call<any>(this, 'enableCheckbox', query, multiple)
  }

  expand(query: any, multiple?: boolean, includingDisabled?: boolean): boolean {
    return call<any>(this, 'expand', query, multiple, [includingDisabled])
  }

  collapse(query: any, multiple?: boolean, includingDisabled?: boolean): boolean {
    return call<any>(this, 'collapse', query, multiple, [includingDisabled])
  }

  data(query: any, key: any, value?: any): any {
    return call(this, 'data', query, false, [key, value])
  }

  hasClass(query: any, className: string): boolean {
    return call<any>(this, 'hasClass', query, false, [className])
  }

  addClass(query: any, classNames: string | string[], multiple?: boolean): any {
    return call(this, 'addClass', query, multiple, [classNames])
  }

  removeClass(query: any, classNames: string | string[], multiple?: boolean): any {
    return call(this, 'removeClass', query, multiple, [classNames])
  }

  append(query: any, source: any, opts?: InsertOptions): PromiseLike<IEyzyNodeAPI> {
    return this.find(query).append(source, opts)
  }

  prepend(query: any, source: any, opts?: InsertOptions): PromiseLike<IEyzyNodeAPI> {
    return this.find(query).prepend(source, opts)
  }

  before(query: any, source: any): PromiseLike<IEyzyNodeAPI> {
    return this.find(query).before(source)
  }

  after(query: any, source: any): PromiseLike<IEyzyNodeAPI> {
    return this.find(query).after(source)
  }
}