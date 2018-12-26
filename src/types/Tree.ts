import { Node } from './Node'

export interface Tree {
  data: Node[]
  fetchData?: (node: Node) => PromiseLike<Node[] | null>
  checkboxRenderer?: any
  arrowRenderer?: any
  textRenderer?: any
  checkable?: boolean
  autoCheckChildren?: boolean
  selectOnExpand?: boolean
  expandOnSelect?: boolean
  checkOnSelect?: boolean
  selectOnCheck?: boolean
  theme?: string
  onSelect?: (node: Node) => void
  onUnSelect?: (node: Node) => void
  onCheck?: (node: Node, isChecked: boolean) => void
  onExpand?: (node: Node, isExpanded: boolean) => void
  onDoubleClick?: (node: Node) => void
}