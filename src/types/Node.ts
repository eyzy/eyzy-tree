import React from 'react'

export interface Node {
  id: string
  text: string
  child: Node[]
  depth?: number
  isBatch?: boolean
  loading? :boolean
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
  onSelect?: (node: Node, event: React.MouseEvent) => void
  onCheck?: (node: Node) => void
  onExpand?: (node: Node) => void
  onDoubleClick?: (node: Node) => void

  // it needs only for  home use
  useIndeterminateState?: boolean
  hash?: string
}
