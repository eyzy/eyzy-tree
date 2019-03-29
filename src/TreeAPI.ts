import { TreeNode } from './types/Node'
import { TreeComponent } from './types/Tree'
import { State } from './types/State'
import { Core, PromiseNodes, InsertOptions } from './types/Core'
import { CheckboxValueConsistency, TreeAPI as ITreeAPI } from './types/Tree'

import { isString, isNodeCheckable, isLeaf, has, remove } from './utils/index'
import { find } from './utils/find'
import { walkBreadth, recurseDown } from './utils/traveler'

export class TreeAPI implements ITreeAPI {
  readonly state: State
  readonly tree: TreeComponent
  private core: Core

  constructor(tree: TreeComponent, state: State, core: Core) {
    this.tree = tree
    this.state = state
    this.core = core
  }

  _clearKeys(node: TreeNode, includeSelf: boolean = false): void {
    const selected: string[] = this.tree.selected
    const checked: string[] = this.tree.checked
    const indeterminate: string[] = this.tree.indeterminate

    recurseDown(node, (child: TreeNode) => {
      if (child.selected) {
        remove(selected, child.id)
      }

      if (child.checked) {
        remove(checked, child.id)
      }

      remove(indeterminate, child.id)
    }, includeSelf)
  }

  _remove(node: TreeNode): TreeNode | null {
    const removedNode: TreeNode | null = this.state.remove(node.id)

    if (removedNode) {
      this._clearKeys(removedNode)
      this.tree.updateState()
      this.tree.$emit('onRemove', removedNode)
    }

    return removedNode
  }

  _addClass(node: TreeNode, ...classNames: string[]): TreeNode {
    const className: string[] = node.className ? node.className.split(' ') : []  

    classNames.forEach((klazz: string) => {
      if (!has(className, "" + klazz)) {
        className.push(klazz)
      }
    })

    this.state.set(node.id, 'className', className.join(' '))
    this.tree.updateState()

    return node
  }

  _removeClass(node: TreeNode, ...classNames: string[]): TreeNode {
    const className: string = (node.className || "")
      .split(' ')  
      .filter((klazz: string) => !has(classNames, klazz))
      .join(' ')

    this.state.set(node.id, 'className', className)
    this.tree.updateState()

    return node
  }

  _hasClass(node: TreeNode, className: string): boolean {
    return !!node.className && new RegExp(className).test(node.className)
  }

  _data(node: TreeNode, key: any, value?: any): any {
    if (!key && !value) {
      return node.data
    }

    if (undefined === value && isString(key)) {
      return node.data[key]
    }

    let data

    if (!isString(key)) {
      data = key
    } else {
      node.data[key] = value
      data = node.data
    }

    this.state.set(node.id, 'data', data)
    this.tree.updateState()

    return node
  }

  after(query: any, source: any): TreeNode[] | PromiseNodes | null {
    const node: TreeNode | null = this.find(query)

    if (!node) {
      return null
    }

    const insertIndex: number | null = this.state.getIndex(node)

    if (!insertIndex) {
      return null
    }

    return this.core.insertAt(node, source, insertIndex + 1)
  }

  before(query: any, source: any): TreeNode[] | PromiseNodes | null {
    const node: TreeNode | null = this.find(query)

    if (!node) {
      return null
    }

    const insertIndex: number | null = this.state.getIndex(node)

    if (!insertIndex) {
      return null
    }

    return this.core.insertAt(node, source, insertIndex)
  }

  append(query: any, source: any, opts?: InsertOptions): any {
    const node: TreeNode | null = this.find(query)

    if (!node) {
      return null
    }

    return this.core.addChild(node, source, undefined, opts)
  }

  prepend(query: any, source: any, opts?: InsertOptions): any {
    const node: TreeNode | null = this.find(query)

    if (!node) {
      return null
    }

    return this.core.addChild(node, source, 0, opts)
  }

  addClass(query: any, ...classNames: string[]): TreeNode | null {
    const node: TreeNode | null = this.find(query)

    if (!node) {
      return null
    }

    return this._addClass(node, ...classNames)
  }

  removeClass(query: any, ...classNames: string[]): TreeNode | null {
    const node: TreeNode | null = this.find(query)

    if (!node) {
      return null
    }

    return this._removeClass(node, ...classNames)
  }

  hasClass(query: any, className: string): boolean {
    const node: TreeNode | null = this.find(query)

    if (!node) {
      return false
    }

    return this._hasClass(node, className)
  }

  data(query: any, key: any, value?: any): any {
    const node: TreeNode | null = this.find(query)

    if (!node) {
      return
    }

    return this._data(node, key, value)
  }

  set(query: any, key: string, value: any): boolean {
    const node: TreeNode | null = this.find(query)

    if (!node) {
      return false
    }

    // TODO: selected, checked should be dublicated in the tree state
    this.state.set(node.id, key, value)
    this.tree.updateState()

    return true
  }

  find(...criterias: any): TreeNode | null {
    return find(this.state.get(), walkBreadth, false, criterias)
  }

  findAll(...criterias: any): TreeNode[] {
    return find(this.state.get(), walkBreadth, true, criterias)
  }

  selected(): TreeNode[] | TreeNode | null {
    const state = this.state
    const selected: Array<TreeNode | null> = this.tree.selected
      .map((id: string): TreeNode | null => state.byId(id))

    if (true !== this.tree.props.multiple) {
      return selected.length ? selected[0] : null
    }

    return selected.filter((item: TreeNode | null) => null !== item) as TreeNode[]
  }

  checked(valueConsistsOf?: CheckboxValueConsistency, showDisabled?: boolean): TreeNode[] {
    const state = this.state
    let checked: TreeNode[] = []

    this.tree.checked.forEach((id: string) => {
      const node = state.byId(id)

      if (node) {
        checked.push(node)
      }
    })

    if ('WITH_INDETERMINATE' === valueConsistsOf) {
      this.tree.indeterminate.forEach((id: string) => {
        const node = state.byId(id)
  
        if (node) {
          checked.push(node)
        }
      })
    }

    if (!showDisabled) {
      checked = checked.filter(isNodeCheckable)
    }

    switch(valueConsistsOf) {
      case 'LEAF': return checked.filter((node: TreeNode) => isLeaf(node))
      case 'BRANCH': 
        return checked.filter((node: TreeNode) => {
          if (node.parent && node.parent.checked) {
            return false
          }

          return true
        })
    }

    return checked
  }

  remove(query: any): TreeNode | null {
    const node: TreeNode | null = this.find(query)

    if (!node) {
      return null
    }

    return this._remove(node)
  }

  // TODO:
  toArray(): TreeNode[] {
    return this.state.get()
  }
}