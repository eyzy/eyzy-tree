import { Node, TreeNode } from './Node'
import { TreeAPI } from '../TreeAPI'
import { State } from './State'

export interface Tree {
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
  props: Tree
  selected: string[]
  checked: string[]
  indeterminate: string[]
  focused: string
  _state: State

  getState: () => State
  updateState: (state: State) => void
  check: (node: TreeNode) => void
  select: (node: TreeNode, ignoreEvent?: boolean, extendSelection?: boolean) => void
  unselect: (node: TreeNode) => void
  uncheckAll: () => void
  unselectAll: () => void
  expand: (node: TreeNode) => void
}