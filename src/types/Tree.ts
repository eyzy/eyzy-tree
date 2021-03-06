import { Node, TreeNode } from './Node'
import { TreeAPI } from '../TreeAPI'
import { State } from './State'
import { InsertOptions, PromiseNodes, Core } from './Core'

export interface TreeProps {
  data: Array<Node | string>
  fetchData?: (node: TreeNode) => PromiseLike<any>
  checkboxRenderer?: any
  arrowRenderer?: any
  textRenderer?: any
  checkable?: boolean
  noCascade?: boolean
  useIndeterminateState?: boolean
  preventSelectParent?: boolean
  keyboardNavigation?: boolean
  selectOnExpand?: boolean
  expandOnSelect?: boolean
  checkOnSelect?: boolean
  selectOnCheck?: boolean
  // TODO: not implemented
  selectOnNavigate?: boolean
  theme?: string
  multiple?: boolean
  onReady?: (api: TreeAPI) => void
  onSelect?: (node: TreeNode) => void
  onUnSelect?: (node: TreeNode) => void
  onCheck?: (node: TreeNode, isChecked: boolean) => void
  onExpand?: (node: TreeNode, isExpanded: boolean) => void
  onDoubleClick?: (node: TreeNode) => void
  onRemove?: (node: TreeNode) => void
  onAdd?: (node: TreeNode) => void
  onChange?: (tree: TreeNode[]) => void
}

export interface TreeComponent {
  props: TreeProps
  silence: boolean
  selected: string[]
  checked: string[]
  indeterminate: string[]
  focused: string
  _state: State

  loadChild: (node: TreeNode, customFetch: (node: TreeNode) => PromiseLike<TreeNode[] | null>) => PromiseNodes | void
  $emit: (name: string, ...args: any) => void
  getState: () => State
  refreshDefinite: (id: string, willBeChecked: boolean, shouldRender?: boolean) => void
  updateState: (state?: State) => void
  check: (node: TreeNode) => void
  select: (node: TreeNode, ignoreEvent?: boolean, extendSelection?: boolean, ignoreUpdating?: boolean) => void
  unselect: (node: TreeNode) => void
  expand: (node: TreeNode, includingDisabled?: boolean) => void
}

export type CheckboxValueConsistency = 'ALL' | 'BRANCH' | 'LEAF' | 'WITH_INDETERMINATE'

export interface TreeAPI {
  state: State
  tree: TreeComponent
  core: Core

  find: (criteria: any) => TreeNode | null
  findAll: (criteria: any) => TreeNode[]
  selected: () => TreeNode[] | TreeNode | null
  checked: (valueConsistsOf?: CheckboxValueConsistency, ignoreDisabled?: boolean) => TreeNode[]
  data: (criteria: any, key?: any, value?: any) => any
  set: (query: any, key: string, value: any) => boolean
  addClass: (criteria: any, classNames: string | string[]) => TreeNode | null
  removeClass: (criteria: any, classNames: string | string[]) => TreeNode | null
  hasClass: (criteria: any, className: string) => boolean | null
  append: (query: any, source: any, opts?: InsertOptions) => PromiseNodes | null
  prepend: (query: any, source: any, opts?: InsertOptions) => PromiseNodes | null
  after: (query: any, source: any) => PromiseNodes | null
  before: (query: any, source: any) => PromiseNodes | null
  remove: (query: any) => TreeNode | null  
  toArray: () => TreeNode[]
  unselectAll: () => void
  uncheckAll: () => void
}
