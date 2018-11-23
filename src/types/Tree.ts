import { Node } from './Node'

export interface Tree {
  checkboxRenderer?: any
  arrowRenderer?: any
  textRenderer?: any
  checkable?: boolean
  selectOnExpand?: boolean
  expandOnSelect?: boolean
  checkOnSelect?: boolean
  theme?: string
  data: Node[]
  onSelect?: (node: Node) => void;
  onCheck?: (node: Node) => void;
}