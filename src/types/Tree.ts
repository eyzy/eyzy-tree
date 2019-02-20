import { Node, TreeNode } from './Node'
import { TreeAPI } from '../TreeAPI'
import State from '../utils/state'

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
  selectedNodes: string[]
  checkedNodes: string[]
  indeterminateNodes: string[]
  focusedNode: string
  _state: State
}