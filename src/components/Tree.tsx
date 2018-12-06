import React, { ReactElement } from 'react'
import '../assets/tree.scss'
import '../assets/node.scss'
import '../assets/theme.scss'

import TreeNode from './TreeNode'

import { Node } from '../types/Node'
import { Tree } from '../types/Tree'

import { parseNode } from '../utils/parser'
import { recurseDown, traverseUp, rootElement } from '../utils/traveler'
import { 
  copyArray,
  copyObject,
  isNodeSelected,
  isNodeChecked,
  isNodeIndeterminate 
} from '../utils'

export default class EyzyTree extends React.Component<Tree> {
  static TreeNode = TreeNode

  nodesLength: number

  constructor(props: Tree) {
    super(props)

    const data = parseNode(props.data)
    const stateObject = {}

    data.forEach((item: Node, i: number) => {
      stateObject[i] = item
    })

    this.nodesLength = data.length

    this.state = stateObject
  }

  getNodeIndex = (node: Node, parent: any) => {
    if (parent.child) {
      return parent.child.indexOf(node)
    }

    for (let i = 0; i < this.nodesLength; i++ ) {
      if (parent[i] === node) {
        return i
      }
    }

    return -1
  }

  updateItemState = (node: Node) => {
    if (node.parent) {
      const parent = node.parent
      const index: number = this.getNodeIndex(node, parent)

      parent["child"][index] = copyObject(node)

      const root = rootElement(node)

      if (root) {
        const rootIndex = this.getNodeIndex(root, this.state)

        this.setState({
          [rootIndex]: copyObject(root)
        })
      }
    } else {
      const index: number = this.getNodeIndex(node, this.state)

      this.setState({
        [index]: copyObject(node)
      })
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

    traverseUp(node, (parentNode): any => {
      if (parentNode.disabledCheckbox || parentNode.disabled) {
        return false
      }

      const isIndeterminate = isNodeIndeterminate(parentNode, checkedNodes)
      const id = parentNode.id

      if (isIndeterminate) {
        indeterminateNodes.push(id)
        checkedNodes = checkedNodes.filter(nodeId => nodeId !== id)
      } else {
        indeterminateNodes = indeterminateNodes.filter(nodeId => nodeId !== id)

        if (isChecked) {
          checkedNodes.push(id)
        } else {
          checkedNodes = checkedNodes.filter(nodeId => nodeId !== id)
        }
      }
    })

    indeterminateNodes = indeterminateNodes.filter(nodeId => !~checkedNodes.indexOf(nodeId))

    this.setState({
      checkedNodes,
      indeterminateNodes
    })
  }

  select = (node: Node, ignoreEvent: boolean = false) => {
    console.log(node)

    node.selected = true

    this.updateItemState(node)

    // this.setState({
    //   selectedNodes: [node.id]
    // })

    // if (false !== ignoreEvent && this.props.onSelect) {
    //   this.props.onSelect(node)
    // }
  }

  check = (node: Node) => {
    const id = node.id
    const isNotChecked = !isNodeChecked(node, this.state.checkedNodes)

    let checkedNodes;

    if (isNotChecked) {
      checkedNodes = [...this.state.checkedNodes, id]
    } else {
      checkedNodes = this.state.checkedNodes.filter((checkedId: string) => id !== checkedId)
    }
    
    if (this.props.autoCheckChildren !== false) {
      this.refreshIndeterminateState(node, isNotChecked)
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
    const isSelected = isNodeSelected(node, this.state.selectedNodes)
    const isChecked = isNodeChecked(node, this.state.checkedNodes)
    const isIndeterminate = this.state.indeterminateNodes.indexOf(node.id) !== -1
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
        indeterminate={isIndeterminate}
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

  nodeRenderer = (node: Node): ReactElement<Node> => {
    return (
      <TreeNode
        key={node.id}
        node={node}
        checkboxRenderer={this.props.checkboxRenderer}
        textRenderer={this.props.textRenderer}
        arrowRenderer={this.props.arrowRenderer}
        checkable={this.props.checkable}
        onSelect={this.handleSelect}
        onDoubleClick={this.handleDoubleClick}
        onCheck={this.check}
        onExpand={this.expand}
        {...node}
      >
        { node.expanded ? node.child.map(this.nodeRenderer) : null }
      </TreeNode>
    )
  }

  render() {
    const props = this.props
    const treeClass = 'theme' in props 
      ? 'eyzy-tree ' + props.theme
      : 'eyzy-tree eyzy-theme'

    const nodes = []

    for (let i = 0; i < this.nodesLength; i++) {
      nodes.push(this.nodeRenderer(this.state[i]))
    }

    return (
      <ul className={treeClass}>
        { nodes }
      </ul>
    )
  }
}
