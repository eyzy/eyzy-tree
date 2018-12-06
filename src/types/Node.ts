
export interface Node {
  id: string
  text: string
  child: Node[]
  node?: Node
  parent?: Node | null
  checkable?: boolean
  checkboxRenderer?: any
  arrowRenderer?: any
  textRenderer?: any
  selected?: boolean
  expanded?: boolean
  checked?: boolean
  indeterminate?: boolean
  disabled?: boolean
  disabledCheckbox?: boolean
  hidenCheckbox?: boolean
  onSelect?: (node: Node) => void
  onCheck?: (node: Node) => void
  onExpand?: (node: Node) => void
  onDoubleClick?: (node: Node) => void
}
