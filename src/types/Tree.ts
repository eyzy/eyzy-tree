import { Node, TreeNode } from './Node'
import { TreeAPI } from '../TreeAPI'
import { State } from './State'

export interface TreeProps {
  data: Array<Node | string>
  fetchData?: (node: TreeNode) => PromiseLike<Node[] | null>
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
  selectOnNavigate?: boolean
  theme?: string
  multiple?: boolean
  onReady?: (api: TreeAPI) => void
  onSelect?: (node: TreeNode) => void
  onUnSelect?: (node: TreeNode) => void
  onCheck?: (node: TreeNode, isChecked: boolean) => void
  onExpand?: (node: TreeNode, isExpanded: boolean) => void
  onDoubleClick?: (node: TreeNode) => void
}

export interface TreeComponent {
  props: TreeProps
  selected: string[]
  checked: string[]
  indeterminate: string[]
  focused: string
  _state: State

  fireEvent: (name: string, ...args: any) => void
  getState: () => State
  refreshIndeterminateState: (id: string, willBeChecked: boolean, shouldRender?: boolean) => void
  updateState: (state: State) => void
  check: (node: TreeNode) => void
  select: (node: TreeNode, ignoreEvent?: boolean, extendSelection?: boolean) => void
  unselect: (node: TreeNode) => void
  uncheckAll: () => void
  unselectAll: () => void
  expand: (node: TreeNode) => void
}

export type CheckboxValueConsistency = 'ALL' | 'BRANCH' | 'LEAF' | 'WITH_INDETERMINATE'

export interface TreeAPI {
  readonly state: State
  readonly tree: TreeComponent

  _clearKeys: (node: TreeNode) => void
  _data: (node: TreeNode, key?: any, value?: any) => any
  _hasClass: (node: TreeNode, className: string) => boolean
  _addClass: (node: TreeNode, ...classNames: string[]) => TreeNode
  _removeClass: (node: TreeNode, ...classNames: string[]) => TreeNode
  _remove: (node: TreeNode) => TreeNode | null  

  data: (criteria: any, key?: any, value?: any) => any
  hasClass: (criteria: any, className: string) => boolean
  addClass: (criteria: any, ...classNames: string[]) => TreeNode | null
  removeClass: (criteria: any, ...classNames: string[]) => TreeNode | null

  set: (query: any, key: string, value: any) => boolean  
  find: (...criterias: any) => TreeNode | null
  findAll: (...criterias: any) => TreeNode[]
  selected: () => TreeNode[] | TreeNode | null
  checked: (valueConsistsOf?: CheckboxValueConsistency, ignoreDisabled?: boolean) => TreeNode[]
  remove: (query: any) => TreeNode | null  
  toArray: () => TreeNode[]
}
