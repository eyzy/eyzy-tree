import { IEyzyNodeAPI } from '../types/Api'
import { TreeComponent, TreeProps, TreeAPI } from '../types/Tree'
import { TreeNode } from '../types/Node'
import { State } from '../types/State'

import { hasChild } from './utils'

export default class EyzyNode implements IEyzyNodeAPI {
  _tree: TreeComponent
  _props: TreeProps
  _state: State
  _api: TreeAPI
  _nodes: TreeNode[]

  constructor(nodes: TreeNode[] | TreeNode | null, api: TreeAPI) {
    this._api = api
    this._state = api.state
    this._tree = api.tree
    this._props = api.tree.props
    this._nodes = Array.isArray(nodes) 
      ? nodes 
      : (nodes ? [nodes] : [])
  }

  get length(): number {
    return this._nodes.length
  }

  get result(): TreeNode[] | null {
    return this._nodes.length ? this._nodes : null
  }

  private _operate(updateState: boolean, operator: (node: TreeNode, state: State) => any): boolean {
    const result: boolean = this._nodes
      .map((node: TreeNode) => operator(node, this._state))
      .every(res => false !== res)

    if (updateState) {
      this._tree.updateState(this._state)
    }

    return result
  }

  remove(): boolean {
    return this._operate(false, (node: TreeNode, state: State): any => {
      return this._api.remove(node.id)
    })
  }

  empty(): boolean {
    return this._operate(true, (node: TreeNode, state: State): any => {
      if (!hasChild(node)) {
        return false
      }

      this._api._clearKeys(node)

      state.set(node.id, {
        child: [],
        indeterminate: false,
        isBatch: false
      })

      if (node.parent) {
        this._tree.refreshIndeterminateState(node.id, !!node.checked, false)
      }
    })
  }

  select(extendSelection?: boolean): boolean {
    return this._operate(false, (node: TreeNode): any => {
      if (node.selected) {
        return false
      }

      if (this._props.multiple) {
        this._tree.select(node, false, extendSelection)
      } else {
        this._tree.select(node)
      }
    })
  }

  unselect(): boolean {
    return this._operate(false, (node: TreeNode): any => {
      if (!node.selected) {
        return false
      }

      this._tree.unselect(node)
    })
  }

  check(): boolean {
    if (!this._props.checkable) {
      return false
    }

    return this._operate(false, (node: TreeNode): any => {
      if (node.checked) {
        return false
      }

      this._tree.check(node)
    })
  }

  uncheck(): boolean {
    if (!this._props.checkable) {
      return false
    }

    return this._operate(false, (node: TreeNode, state: State): any => {
      if (!node.checked) {
        return false
      }

      this._tree.check(node)
    })
  }

  disable(): boolean {
    return this._operate(true, (node: TreeNode, state: State): any => {
      if (node.disabled) {
        return false
      }

      state.set(node.id, 'disabled', true)
    })
  }

  enable(): boolean {
    return this._operate(true, (node: TreeNode, state: State): any => {
      if (!node.disabled) {
        return false
      }

      state.set(node.id, 'disabled', false)
    })
  }

  disableCheckbox(): boolean {
    if (!this._props.checkable) {
      return false
    }

    return this._operate(true, (node: TreeNode, state: State): any => {
      if (node.disabledCheckbox) {
        return false
      }

      state.set(node.id, 'disabledCheckbox', true)
    })
  }

  enableCheckbox(): boolean {
    if (!this._props.checkable) {
      return false
    }

    return this._operate(true, (node: TreeNode, state: State): any => {
      if (!node.disabledCheckbox) {
        return false
      }

      state.set(node.id, 'disabledCheckbox', false)

      if (hasChild(node) && this._props.useIndeterminateState) {
        const iNode: TreeNode = node.checked
          ? node
          : node.child[0]

        this._tree.refreshIndeterminateState(iNode.id, !!iNode.checked, false)
      }
    })
  }

  expand(): boolean {
    return this._operate(false, (node: TreeNode): any => {
      if (!hasChild(node) || node.expanded) {
        return false
      }

      this._tree.expand(node)
    })
  }

  collapse(): boolean {
    return this._operate(false, (node: TreeNode): any => {
      if (!hasChild(node) || !node.expanded) {
        return false
      }

      this._tree.expand(node)
    })
  }

  data(key: any, value?: any): any {
    const nodes = this._nodes
    
    if (1 === nodes.length) {
      return this._api._data(nodes[0], key, value)
    }

    return nodes.map((node: TreeNode) => this._api._data(node, key, value))
  }

  hasClass(className: string): boolean {
    return this._nodes.some((node: TreeNode) => this._api._hasClass(node, className))
  }

  addClass(...classNames: string[]): boolean {
    this._nodes.forEach((node: TreeNode) => this._api._addClass(node, ...classNames))

    return true
  }

  removeClass(...classNames: string[]): boolean {
    return this._operate(false, (node: TreeNode) => {
      if (!node.className) {
        return
      }

      const oldClassNames = node.className
      const updatedNode = this._api._removeClass(node, ...classNames)

      return oldClassNames !== updatedNode.className
    })
  }
}