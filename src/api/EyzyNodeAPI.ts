import { IEyzyNodeAPI, IEyzyTreeAPI } from '../types/Api'
import { TreeComponent } from '../types/Tree'
import { TreeNode } from '../types/Node'
import { State } from '../types/State'

import { hasChild } from './EyzyTreeAPI'

export default class EyzyNode implements IEyzyNodeAPI {
  _tree: TreeComponent
  _state: State
  _api: IEyzyTreeAPI
  _nodes: TreeNode[]

  constructor(nodes: TreeNode[] | TreeNode | null, api: IEyzyTreeAPI) {
    this._api = api
    this._state = api._state
    this._tree = api._tree
    this._nodes = Array.isArray(nodes) 
      ? nodes 
      : (nodes ? [nodes] : [])
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

  remove: () => boolean

  // TODO: 
  // - checked, selected, indeterminate nodes must be removed from the tree
  empty(): boolean {
    return this._operate(true, (node: TreeNode, state: State) => {
      if (!node.child.length) {
        return false
      }

      state.set(node.id, 'child', [])
    })
  }

  select(extendSelection?: boolean): boolean {
    const multiple: boolean = !!this._tree.props.multiple

    if (multiple && !extendSelection) {
      this._api.unselectAll()
    }

    return this._operate(false, (node: TreeNode) => {
      if (node.selected) {
        return false
      }

      if (multiple) {
        this._tree.select(node, false, false !== extendSelection)
      } else {
        this._tree.select(node)
      }
    })
  }

  unselect(): boolean {
    return this._operate(false, (node: TreeNode) => {
      if (!node.selected) {
        return false
      }

      this._tree.unselect(node)
    })
  }

  check(): boolean {
    if (!this._tree.props.checkable) {
      return false
    }

    return this._operate(false, (node: TreeNode) => {
      if (node.checked) {
        return false
      }

      this._tree.check(node)
    })
  }

  uncheck(): boolean {
    if (!this._tree.props.checkable) {
      return false
    }

    return this._operate(false, (node: TreeNode, state: State) => {
      if (!node.checked) {
        return false
      }

      this._tree.check(node)
    })
  }

  disable(): boolean {
    return this._operate(true, (node: TreeNode, state: State) => {
      if (node.disabled) {
        return false
      }

      state.set(node.id, 'disabled', true)
    })
  }

  enable(): boolean {
    return this._operate(true, (node: TreeNode, state: State) => {
      if (!node.disabled) {
        return false
      }

      state.set(node.id, 'disabled', false)
    })
  }
  
  disableCheckbox(): boolean {
    if (!this._tree.props.checkable) {
      return false
    }

    return this._operate(true, (node: TreeNode, state: State) => {
      if (node.disabledCheckbox) {
        return false
      }

      state.set(node.id, 'disabledCheckbox', true)
    })
  }
  
  enableCheckbox(): boolean {
    if (!this._tree.props.checkable) {
      return false
    }

    return this._operate(true, (node: TreeNode, state: State) => {
      if (!node.disabledCheckbox) {
        return false
      }

      state.set(node.id, 'disabledCheckbox', false)
    })
  }
  
  expand(): boolean {
    return this._operate(false, (node: TreeNode) => {
      if (!hasChild(node) || node.expanded) {
        return false
      }

      this._tree.expand(node)
    })
  }
  
  collapse(): boolean {
    return this._operate(false, (node: TreeNode) => {
      if (!hasChild(node) || !node.expanded) {
        return false
      }

      this._tree.expand(node)
    })
  }
}