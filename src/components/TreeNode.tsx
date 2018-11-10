import React from 'react'
import { Node } from '../types/Node'

import cn from '../utils/cn'

export default class TreeNode extends React.PureComponent<Node> {
  getNode(): Node {
    const {
      id,
      checked,
      selected,
      text,
      child,
      expanded
    } = this.props

    return {
      id,
      checked,
      selected,
      text,
      child,
      expanded
    }
  }

  handleSelect = () => {
    if (this.props.onSelect) {
      this.props.onSelect(this.getNode())
    }
  }

  handleCheck = () => {
    if (this.props.onCheck) {
      this.props.onCheck(this.getNode())
    }
  }

  handleExpand = () => {
    if (this.props.onExpand) {
      this.props.onExpand(this.getNode())
    }
  }

  renderCheckbox = () => {
    if (!this.props.checkable) {
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
    const {
      child,
      arrowRenderer: ArrowRenderer 
    } = this.props

    const hasChild = Array.isArray(child) && child.length > 0

    if (!hasChild) {
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
      child,
      expanded,
      textRenderer: TextRenderer
    } = this.props

    const hasChild = Array.isArray(child) && child.length > 0
    const text = this.props.text

    const nodeClass = cn({
      'node-content': true,
      'selected': selected,
      'checked': checked,
      'expanded': expanded
    })

    return (
      <li className="tree-node">
        <div className={nodeClass}>

          { this.renderArrow() }
          { this.renderCheckbox() }

          <span className="node-text" onMouseUp={this.handleSelect}>
            { TextRenderer ? <TextRenderer node={this.getNode()} /> : text }
          </span>
        </div>

        { hasChild &&
          <ul className="node-child">{ children }</ul>
        }
      </li>
    )
  }
}
