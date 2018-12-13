import React from 'react'
import { Node } from '../types/Node'

import cn from '../utils/cn'
import { shallowEqual } from '../utils/shallowEqual'

const hasChild = (node: Node): boolean => {
  return Array.isArray(node.child) && node.child.length > 0
}

const comparingKeys = [
  'id', 'checked', 'selected', 'child'
]

export default class TreeNode extends React.Component<Node> {
  shouldComponentUpdate(nextProps: Node): boolean {
    return !shallowEqual(this.props, nextProps, comparingKeys)
  }

  getNode(): Node {
    const {
      id,
      checked,
      selected,
      text,
      child,
      expanded,
      disabled,
      parent
    } = this.props

    const node: Node = {
      id,
      checked,
      selected,
      text,
      child,
      parent
    } 

    if (void 0 !== expanded) {
      node.expanded = expanded
    }

    if (void 0 !== disabled) {
      node.disabled = disabled
    }

    return node
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
      checked,
      selected,
      children,
      expanded,
      disabled,
      disabledCheckbox,
      indeterminate,
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
      'disabled-checkbox': disabledCheckbox,
      'indeterminate': !checked && indeterminate
    })

    // console.log('RENDERING:', text)

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
