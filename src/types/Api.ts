import { State } from './State'
import { TreeComponent, TreeAPI } from './Tree'
import { TreeNode } from './Node'
import { InsertOptions } from './Core'

export interface APIOpts {
  silence?: boolean
}

export type APIResult = TreeNode[] | TreeNode | null
export type APIBooleanResult = boolean | null

export interface IEyzyTreeAPI {
  readonly _tree: TreeComponent
  readonly _state: State
  readonly _api: TreeAPI
  readonly _operate: <T>(query: any, multiple: boolean, operator: (node: IEyzyNodeAPI) => any) => T | null

  opts: APIOpts

  find: (query: any) => IEyzyNodeAPI
  findAll: (query: any) => IEyzyNodeAPI
  remove: (query: any, multiple?: boolean) => APIResult
  empty: (query: any, multiple?: boolean) => APIBooleanResult
  select: (extendSelection?: boolean, expandOnSelect?: boolean) => APIBooleanResult
  unselect: (query: any, multiple?: boolean) => APIBooleanResult
  unselectAll: () => void
  check: (query: any, multiple?: boolean) => APIBooleanResult
  uncheck: (query: any, multiple?: boolean) => APIBooleanResult
  uncheckAll: () => void
  disable: (query: any, multiple?: boolean) => APIBooleanResult
  enable: (query: any, multiple?: boolean) => APIBooleanResult
  disableCheckbox: (query: any, multiple?: boolean) => APIBooleanResult
  enableCheckbox: (query: any, multiple?: boolean) => APIBooleanResult
  expand: (query: any, multiple?: boolean, includingDisabled?: boolean) => APIBooleanResult
  collapse: (query: any, multiple?: boolean, includingDisabled?: boolean) => APIBooleanResult
  data: (query: any, key?: any, value?: any) => any
  hasClass: (query: any, className: string) => boolean
  addClass: (query: any, classNames: string | string[], multiple?: boolean) => boolean
  removeClass: (query: any, classNames: string | string[], multiple?: boolean) => boolean
  after: (query: any, source: any) => PromiseLike<IEyzyNodeAPI>
  before: (query: any, source: any) => PromiseLike<IEyzyNodeAPI>
  append: (query: any, source: any, opts?: InsertOptions) => PromiseLike<IEyzyNodeAPI>
  prepend: (query: any, source: any, opts?: InsertOptions) => PromiseLike<IEyzyNodeAPI>
}

export interface IEyzyNodeAPI {
  readonly _tree: TreeComponent
  readonly _state: State
  readonly _api: TreeAPI
  readonly _nodes: TreeNode[] | TreeNode | null

  length: number
  result: TreeNode | TreeNode[] | null

  find: (query: any) => IEyzyNodeAPI
  findAll: (query: any) => IEyzyNodeAPI
  remove: () => APIResult
  empty: () => APIBooleanResult
  select: (extendSelection?: boolean, expandOnSelect?: boolean) => APIBooleanResult
  unselect: () => APIBooleanResult
  check: () => APIBooleanResult
  uncheck: () => APIBooleanResult
  disable: () => APIBooleanResult
  enable: () => APIBooleanResult
  disableCheckbox: () => APIBooleanResult
  enableCheckbox: () => APIBooleanResult
  expand: (includingDisabled?: boolean) => APIBooleanResult
  collapse: (includingDisabled?: boolean) => APIBooleanResult
  data: (key?: any, value?: any) => any
  hasClass: (className: string) => any
  addClass: (classNames: string | string[]) => APIBooleanResult
  removeClass: (classNames: string | string[]) => APIBooleanResult
  after: (source: any) => PromiseLike<IEyzyNodeAPI>
  before: (source: any) => PromiseLike<IEyzyNodeAPI>
  append: (source: any, opts?: InsertOptions) => PromiseLike<IEyzyNodeAPI>
  prepend: (source: any, opts?: InsertOptions) => PromiseLike<IEyzyNodeAPI>
}