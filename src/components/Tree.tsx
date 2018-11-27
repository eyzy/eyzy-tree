import React, { ReactElement } from 'react'
import '../assets/tree.scss'
import '../assets/node.scss'
import '../assets/theme.scss'

import TreeNode from './TreeNode'

import { Node } from '../types/Node'
import { Tree } from '../types/Tree'

import { parseNode } from '../utils/parser'
import { recurseDown } from '../utils/traveler'

interface State {
  data: Node[]
  selectedNodes: string[]
  checkedNodes: string[]
  expandedNodes: string[]
}

export default class EyzyTree extends React.Component<Tree, State> {
  static TreeNode = TreeNode

  constructor(props: Tree) {
    super(props)

    const data = parseNode(props.data)
    const checkedNodes: string[] = []
    const selectedNodes: string[] = []
    const expandedNodes: string[] = []

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
      expandedNodes
    }
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

    if (isChecked) {
      this.setState({
        checkedNodes: [...this.state.checkedNodes, id]
      })
    } else {
      this.setState({
        checkedNodes: this.state.checkedNodes.filter((checkedId: string) => id !== checkedId)
      })
    }

    if (this.props.onCheck) {
      this.props.onCheck(node)
    }
  }

  expand = (node: Node) => {
    const id = node.id

    if (node.child && !node.child.length) {
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

  handleSelect = (node: Node) => {
    this.select(node)

    const { checkOnSelect, expandOnSelect, checkable } = this.props

    if (checkable && checkOnSelect && !node.disabledCheckbox) {
      this.check(node)
    } else if (expandOnSelect) {
      this.handleExpand(node)
    }
  }

  handleCheck = (node: Node) => {
    this.check(node)
  }

  handleExpand = (node: Node) => {
    this.expand(node)
  }

  renderNode = (node: Node): ReactElement<Node> => {
    const isSelected = this.state.selectedNodes.indexOf(node.id) !== -1
    const isChecked = this.state.checkedNodes.indexOf(node.id) !== -1
    const isExpanded = node.child && node.child.length > 0 && this.state.expandedNodes.indexOf(node.id) !== -1

    return (
      <TreeNode
        id={node.id}
        text={node.text}
        child={node.child}
        onSelect={this.handleSelect}
        onCheck={this.handleCheck}
        onExpand={this.handleExpand}
        selected={isSelected}
        checked={isChecked}
        expanded={isExpanded}
        disabled={node.disabled}
        disabledCheckbox={node.disabledCheckbox}
        checkboxRenderer={this.props.checkboxRenderer}
        textRenderer={this.props.textRenderer}
        arrowRenderer={this.props.arrowRenderer}
        checkable={this.props.checkable}
        key={node.id}
      >
        { isExpanded && node.child ? node.child.map(this.renderNode) : null }
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
