import { IEyzyNodeAPI, IEyzyTreeAPI } from '../types/Api'
import { TreeComponent, TreeProps } from '../types/Tree'
import { TreeNode } from '../types/Node'
import { State } from '../types/State'

import { hasChild, recurseDown, removeArrItem } from './utils'

export default class EyzyNode implements IEyzyNodeAPI {
  _tree: TreeComponent
  _props: TreeProps
  _state: State
  _api: IEyzyTreeAPI
  _nodes: TreeNode[]

  constructor(nodes: TreeNode[] | TreeNode | null, api: IEyzyTreeAPI) {
    this._api = api
    this._state = api._state
    this._tree = api._tree
    this._props = api._tree.props
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

  private _clearKeys(node: TreeNode): void {
    const selected: string[] = this._tree.selected
    const checked: string[] = this._tree.checked
    const indeterminate: string[] = this._tree.indeterminate

    recurseDown(node, (child: TreeNode) => {
      if (child.selected) {
        removeArrItem(selected, child.id)
      }

      if (child.checked) {
        removeArrItem(checked, child.id)
      }

      removeArrItem(indeterminate, child.id)
    }, true)

    removeArrItem(indeterminate, node.id)
  }

  remove: () => boolean

  empty(): boolean {
    return this._operate(true, (node: TreeNode, state: State): any => {
      if (!hasChild(node)) {
        return false
      }

      this._clearKeys(node)

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
    return this._operate(false, (node: TreeNode) => {
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
}