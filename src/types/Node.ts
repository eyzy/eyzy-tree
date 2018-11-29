
export interface Node {
  id: string
  text: string
  checkable?: boolean
  checkboxRenderer?: any
  arrowRenderer?: any
  textRenderer?: any
  child?: Node[]
  selected?: boolean
  expanded?: boolean
  checked?: boolean
  disabled?: boolean
  disabledCheckbox?: boolean
  onSelect?: (node: Node) => void
  onCheck?: (node: Node) => void
  onExpand?: (node: Node) => void
  onDoubleClick?: (node: Node) => void
}
