import { Node } from './Node'
import { TreeAPI } from '../TreeAPI'

export interface Tree {
  data: Node[]
  fetchData?: (node: Node) => PromiseLike<Node[] | null>
  checkboxRenderer?: any
  arrowRenderer?: any
  textRenderer?: any
  checkable?: boolean
  autoCheckChildren?: boolean
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
  onSelect?: (node: Node) => void
  onUnSelect?: (node: Node) => void
  onCheck?: (node: Node, isChecked: boolean) => void
  onExpand?: (node: Node, isExpanded: boolean) => void
  onDoubleClick?: (node: Node) => void
}