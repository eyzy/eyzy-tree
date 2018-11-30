import React, { ReactElement } from 'react'
import '../assets/tree.scss'
import '../assets/node.scss'
import '../assets/theme.scss'

import TreeNode from './TreeNode'

import { Node } from '../types/Node'
import { Tree } from '../types/Tree'

import { copyArray } from '../utils'
import { parseNode } from '../utils/parser'
import { recurseDown, traverseUp } from '../utils/traveler'

interface State {
  data: Node[]
  selectedNodes: string[]
  checkedNodes: string[]
  expandedNodes: string[]
  indeterminateNodes: string[]
}

export default class EyzyTree extends React.Component<Tree, State> {
  static TreeNode = TreeNode

  constructor(props: Tree) {
    super(props)

    const data = parseNode(props.data)

    const checkedNodes: string[] = []
    const selectedNodes: string[] = []
    const expandedNodes: string[] = []
    const indeterminateNodes: string[] = []

    recurseDown(data, (node: Node) => {
      if (node.checked) {
        checkedNodes.push(node.id)
      }

      if (node.selected) {
        selectedNodes.push(node.id)
      }

      if (node.expanded) {
        expandedNodes.push(node.id)
      }
    })

    this.state = {
      data,
      selectedNodes,
      checkedNodes,
      expandedNodes,
      indeterminateNodes
    }
  }

  refreshIndeterminateState = (node: Node, isChecked: boolean) => {
    let checkedNodes: string[] = copyArray(this.state.checkedNodes)
    let indeterminateNodes = copyArray(this.state.indeterminateNodes)

    const childIds: string[] = []

    recurseDown(node, (child: Node) => {
      if (!child.disabled && !child.disabledCheckbox) {
        childIds.push(child.id)
      }
    })

    if (isChecked) {
      checkedNodes.push(...childIds)
    } else {
      checkedNodes = checkedNodes.filter(nodeId => !~childIds.indexOf(nodeId))
    }

    traverseUp(node, (obj) => {
      console.log(obj.text)
    })

    indeterminateNodes = indeterminateNodes.filter(nodeId => !~checkedNodes.indexOf(nodeId))

    this.setState({
      checkedNodes,
      indeterminateNodes
    })
  }

  select = (node: Node, ignoreEvent: boolean = false) => {
    this.setState({
      selectedNodes: [node.id]
    })

    if (false !== ignoreEvent && this.props.onSelect) {
      this.props.onSelect(node)
    }
  }

  check = (node: Node) => {
    const id = node.id
    const isChecked = this.state.checkedNodes.indexOf(id) === -1
    
    let checkedNodes;

    if (isChecked) {
      checkedNodes = [...this.state.checkedNodes, id]
    } else {
      checkedNodes = this.state.checkedNodes.filter((checkedId: string) => id !== checkedId)
    }
    
    if (this.props.autoCheckChildren !== false) {
      this.refreshIndeterminateState(node, isChecked)
    } else {
      this.setState({checkedNodes})
    }

    if (this.props.onCheck) {
      this.props.onCheck(node)
    }
  }

  expand = (node: Node) => {
    const id = node.id

    if (!node.child.length) {
      return
    }

    if (node.expanded) {
      this.setState({
        expandedNodes: this.state.expandedNodes.filter((nodeid: string) => id !== nodeid)
      })
    } else {
      this.setState({
        expandedNodes: [...this.state.expandedNodes, id]
      })
    }

    if (this.props.selectOnExpand && !node.selected) {
      this.select(node)
    }

    if (this.props.onExpand) {
      this.props.onExpand(node, !!node.expanded)
    }
  }

  handleDoubleClick = (node: Node) => {
    if (node.disabled || !node.child.length || this.props.expandOnSelect) {
      return
    }

    this.expand(node)

    if (this.props.onDoubleClick) {
      this.props.onDoubleClick(node)
    }
  }

  handleSelect = (node: Node) => {
    this.select(node)

    const { checkOnSelect, expandOnSelect, checkable } = this.props

    if (checkable && checkOnSelect && !node.disabledCheckbox) {
      this.check(node)
    } else if (expandOnSelect) {
      this.expand(node)
    }
  }

  renderNode = (node: Node): ReactElement<Node> => {
    const isSelected = this.state.selectedNodes.indexOf(node.id) !== -1
    const isChecked = this.state.checkedNodes.indexOf(node.id) !== -1
    const isExpanded = node.child.length > 0 && this.state.expandedNodes.indexOf(node.id) !== -1

    return (
      <TreeNode
        id={node.id}
        key={node.id}
        text={node.text}
        child={node.child}
        parent={node.parent}
        onSelect={this.handleSelect}
        onDoubleClick={this.handleDoubleClick}
        onCheck={this.check}
        onExpand={this.expand}
        selected={isSelected}
        checked={isChecked}
        expanded={isExpanded}
        disabled={node.disabled}
        disabledCheckbox={node.disabledCheckbox}
        checkboxRenderer={this.props.checkboxRenderer}
        textRenderer={this.props.textRenderer}
        arrowRenderer={this.props.arrowRenderer}
        checkable={this.props.checkable}
        hidenCheckbox={node.hidenCheckbox}
      >
        { isExpanded ? node.child.map(this.renderNode) : null }
      </TreeNode>
    )
  }

  render() {
    const props = this.props
    const treeClass = 'theme' in props 
      ? 'eyzy-tree ' + props.theme
      : 'eyzy-tree eyzy-theme'
    
    return (
      <ul className={treeClass}>
        { this.state.data.map(this.renderNode) }
      </ul>
    )
  }
}
