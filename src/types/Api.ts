import { State } from './State'
import { TreeComponent, TreeAPI } from './Tree'
import { TreeNode } from './Node'
import EyzyTreeAPI from '../api/EyzyTreeAPI'

export interface IEyzyTreeAPI {
  readonly _tree: TreeComponent
  readonly _state: State
  readonly _api: TreeAPI
  readonly _operate: (criteria: any, operator: (node: IEyzyNodeAPI) => any) => boolean

  isMultiple: boolean
  useMultiple: (isMultiple: boolean) => EyzyTreeAPI

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
  expand: (criteria: any) => boolean
  collapse: (criteria: any) => boolean
}

export interface IEyzyNodeAPI {
  readonly _tree: TreeComponent
  readonly _state: State
  readonly _api: IEyzyTreeAPI
  readonly _nodes: TreeNode[]

  length: number
  result: TreeNode[] | null

  select: (extendSelection?: boolean) => boolean
  unselect: () => boolean
  check: () => boolean
  uncheck: () => boolean
  empty: () => boolean
  disable: () => boolean
  enable: () => boolean
  disableCheckbox: () => boolean
  enableCheckbox: () => boolean
  expand: () => boolean
  collapse: () => boolean

  // TODO
  next?: () => IEyzyTreeAPI | null
  prev?: () => IEyzyTreeAPI | null
  parent?: () => IEyzyTreeAPI | null
  recurseUp?: (node: IEyzyTreeAPI) => void 
  recurseDown?: (node: IEyzyTreeAPI) => void
  find?: (criteria: any) => void
}