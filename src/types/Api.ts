import { State } from './State'
import { TreeComponent, TreeAPI } from './Tree'
import { TreeNode } from './Node'
import EyzyTreeAPI from '../api/EyzyTreeAPI'

export interface APIOpts {
  multiple?: boolean
  silence?: boolean
}

export interface IEyzyTreeAPI {
  readonly _tree: TreeComponent
  readonly _state: State
  readonly _api: TreeAPI
  readonly _operate: (query: any, multiple: boolean, operator: (node: IEyzyNodeAPI) => any) => boolean

  opts: APIOpts

  find: (query: any) => IEyzyNodeAPI
  findAll: (query: any) => IEyzyNodeAPI
  remove: (query: any, multiple?: boolean) => boolean
  empty: (query: any, multiple?: boolean) => boolean
  select: (extendSelection?: boolean) => boolean
  unselect: (query: any, multiple?: boolean) => boolean
  unselectAll: () => void
  check: (query: any, multiple?: boolean) => boolean
  uncheck: (query: any, multiple?: boolean) => boolean
  uncheckAll: () => void
  disable: (query: any, multiple?: boolean) => boolean
  enable: (query: any, multiple?: boolean) => boolean
  disableCheckbox: (query: any, multiple?: boolean) => boolean
  enableCheckbox: (query: any, multiple?: boolean) => boolean
  expand: (query: any, includingDisabled?: boolean, multiple?: boolean) => boolean
  collapse: (query: any, includingDisabled?: boolean, multiple?: boolean) => boolean
  data: (query: any, key?: any, value?: any) => any
  hasClass: (query: any, className: string) => boolean
  addClass: (query: any, classNames: string | string[], multiple?: boolean) => boolean
  removeClass: (query: any, classNames: string | string[], multiple?: boolean) => boolean
}

export interface IEyzyNodeAPI {
  readonly _tree: TreeComponent
  readonly _state: State
  readonly _api: TreeAPI
  readonly _nodes: TreeNode[]

  length: number
  result: TreeNode[] | null

  select: (extendSelection?: boolean) => boolean
  unselect: () => boolean
  check: () => boolean
  uncheck: () => boolean
  empty: () => boolean
  remove: () => boolean
  disable: () => boolean
  enable: () => boolean
  disableCheckbox: () => boolean
  enableCheckbox: () => boolean
  expand: (includingDisabled?: boolean) => boolean
  collapse: (includingDisabled?: boolean) => boolean
  data: (key?: any, value?: any) => any
  hasClass: (className: string) => any
  addClass: (classNames: string | string[]) => boolean
  removeClass: (classNames: string | string[]) => boolean
  find: (query: any) => IEyzyNodeAPI
  findAll: (query: any) => IEyzyNodeAPI
}