import React from 'react'
import { TreeNodeProps, TreeNode } from '../types/Node'

import cn from '../utils/cn'
import { shallowEqual } from '../utils/shallowEqual'

const hasChild = (node: TreeNodeProps): boolean => {
  return node.isBatch || node.child.length > 0
}

const comparingKeys = [
  'id', 'checked', 'selected', 'child', 'checked', 'expanded', 'hash'
]

export default class Node extends React.Component<TreeNodeProps> {
  shouldComponentUpdate(nextProps: TreeNodeProps): boolean {
    if (0 === nextProps.depth && this.props.hash !== nextProps.hash) {
      return true
    }

    return !shallowEqual(this.props, nextProps, comparingKeys)
  }

  getNode(): TreeNode {
    return this.props.node
  }

  handleSelect = (event: React.MouseEvent) => {
    if (this.props.disabled) {
      return
    }

    if (this.props.onSelect) {
      this.props.onSelect(this.getNode(), event)
    }
  }

  handleCheck = () => {
    if (this.props.disabled || this.props.disabledCheckbox) {
      return
    }

    if (this.props.onCheck) {
      this.props.onCheck(this.getNode())
    }
  }

  handleExpand = () => {
    if (this.props.onExpand) {
      this.props.onExpand(this.getNode())
    }
  }

  handleDoubleClick = (e: any) => {
    if (this.props.onDoubleClick) {
      this.props.onDoubleClick(this.getNode())
    }
  }

  renderCheckbox = () => {
    if (!this.props.checkable || this.props.hidenCheckbox) {
      return null
    }

    const Checkbox = this.props.checkboxRenderer

    if (!Checkbox) {
      return <span className="node-checkbox" onMouseUp={this.handleCheck} /> 
    }

    return (
      <span className="node-checkbox-overrided" onMouseUp={this.handleCheck}>
        <Checkbox node={this.getNode()} />
      </span>
    )
  }

  renderArrow = () => {
    const ArrowRenderer = this.props.arrowRenderer

    if (!hasChild(this.props)) {
      return <span className="node-noop" />
    }

    if (!ArrowRenderer) {
      return <span className="node-arrow" onMouseUp={this.handleExpand} />
    }

    return (
      <span className="node-arrow-extended" onMouseUp={this.handleExpand}>
        <ArrowRenderer node={this.getNode()} />
      </span>
    )
  }

  render() {
    const {
      loading,
      checked,
      selected,
      children,
      expanded,
      disabled,
      disabledCheckbox,
      indeterminate,
      useIndeterminateState,
      textRenderer: TextRenderer
    } = this.props

    const text = this.props.text
    const nodeContentClass = cn({
      'node-content': true,
      'has-child': hasChild(this.props),
      'selected': selected,
      'checked': checked,
      'expanded': expanded,
      'disabled': disabled,
      'loading': loading,
      'disabled-checkbox': disabledCheckbox,
      'indeterminate': !checked && indeterminate && false !== useIndeterminateState
    })

    return (
      <li className="tree-node">
        <div className={nodeContentClass}>

          { this.renderArrow() }
          { this.renderCheckbox() }

          <span className="node-text" onMouseUp={this.handleSelect} onDoubleClick={this.handleDoubleClick}>
            { TextRenderer ? <TextRenderer node={this.getNode()} /> : text }
          </span>
        </div>

        { hasChild(this.props) && expanded &&
          <ul className="node-child">{ children }</ul>
        }
      </li>
    )
  }
}
