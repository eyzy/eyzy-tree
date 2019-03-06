import React from 'react'

/**
 * The interface of the node that will be passed in the data property of the tree
 */
export interface Node {
  id?: string
  text: string
  child?: Node[]
  data?: any
  isBatch?: boolean
  className?: string
  checkable?: boolean
  checkboxRenderer?: React.ReactType<{node: TreeNode}>
  arrowRenderer?: React.ReactType<{node: TreeNode}>
  textRenderer?: React.ReactType<{node: TreeNode}>
  selected?: boolean
  expanded?: boolean
  checked?: boolean
  disabled?: boolean
  disabledCheckbox?: boolean
  hidenCheckbox?: boolean
  onSelect?: (node: TreeNode, event: React.MouseEvent) => void
  onCheck?: (node: TreeNode) => void
  onExpand?: (node: TreeNode) => void
  onDoubleClick?: (node: TreeNode) => void
}

/**
 * Parsed node.
 */
export interface TreeNode extends Node {
  id: string
  text: string
  child: TreeNode[]
  data: any
  parent: TreeNode | null
  depth?: number
}

export interface TreeNodeProps extends TreeNode {
  loading?: boolean
  node: TreeNode
  indeterminate?: boolean
  // it needs only for  home use
  useIndeterminateState?: boolean
  hash?: string
}
