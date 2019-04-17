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
  readonly _operate: (criteria: any, operator: (node: IEyzyNodeAPI) => any) => boolean

  opts: APIOpts
  useMultiple: (isMultiple: boolean) => EyzyTreeAPI

  remove: (criteria: any) => boolean
  empty: (criteria: any) => boolean
  select: (extendSelection?: boolean) => boolean
  unselect: (criteria: any) => boolean
  unselectAll: () => boolean
  check: (criteria: any) => boolean
  uncheck: (criteria: any) => boolean
  disable: (criteria: any) => boolean
  enable: (criteria: any) => boolean
  disableCheckbox: (criteria: any) => boolean
  enableCheckbox: (criteria: any) => boolean
  expand: (criteria: any, includingDisabled?: boolean) => boolean
  collapse: (criteria: any, includingDisabled?: boolean) => boolean
  data: (criteria: any, key?: any, value?: any) => any
  hasClass: (criteria: any, className: string) => boolean
  addClass: (criteria: any, ...classNames: string[]) => boolean
  removeClass: (criteria: any, ...classNames: string[]) => boolean
  uncheckAll: () => void
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
  addClass: (...classNames: string[]) => boolean
  removeClass: (...classNames: string[]) => boolean
  find: (...query: any) => IEyzyNodeAPI
  findAll: (...query: any) => IEyzyNodeAPI
}