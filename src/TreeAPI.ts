import { TreeNode } from './types/Node'
import { TreeComponent } from './types/Tree'
import { State } from './types/State'
import { CheckboxValueConsistency, TreeAPI as ITreeAPI } from './types/Tree'

import { isString, isNodeCheckable, isLeaf, isFunction, has, remove, callFetcher } from './utils/index'
import { find } from './utils/find'
import { walkBreadth, recurseDown } from './utils/traveler'

/*
this._api.append({selected: true}, 'AAAAAAa', true); // autoexpand
this._api.append({selected: true}, {text: 'BBBBB', selected: true});
this._api.append(/Angular/, (node) => {
 return fetch(`/api/getChildren?id=${node.id}`).then(response => response.json())
});

*/


export class TreeAPI implements ITreeAPI {
  readonly state: State
  readonly tree: TreeComponent

  constructor(tree: TreeComponent, state: State) {
    this.tree = tree
    this.state = state
  }

  _clearKeys(node: TreeNode): void {
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
    })
  }

  _append(node: TreeNode, source: any): any {
    if (isFunction(source)) {
      const result = callFetcher(node, source)

      if (result) {
        this.state.set(node.id, 'loading', true)
        this.tree.updateState(this.state)
  
        return result.then((nodes: any[]) => {
          this.set(node.id, 'loading', false)
          this.tree.appendChild(node.id, nodes)

          if (true) {
            this.tree.expand(node)
          }

          return nodes as TreeNode[]
        })
      }
    } else {
      this.tree.appendChild(node.id, source)
      this.tree.updateState(this.state)
    }
  }

  _remove(node: TreeNode): TreeNode | null {
    const removedNode: TreeNode | null = this.state.remove(node.id)

    if (removedNode) {
      this._clearKeys(removedNode)
      this.tree.updateState(this.state)
      this.tree.fireEvent('onRemove', removedNode)
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
    this.tree.updateState(this.state)

    return node
  }

  _removeClass(node: TreeNode, ...classNames: string[]): TreeNode {
    const className: string = (node.className || "")
      .split(' ')  
      .filter((klazz: string) => !has(classNames, klazz))
      .join(' ')

    this.state.set(node.id, 'className', className)
    this.tree.updateState(this.state)

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
    this.tree.updateState(this.state)

    return node
  }

  append(query: any, source: any): any {
    const node: TreeNode | null = this.find(query)

    if (!node) {
      return null
    }

    return this._append(node, source)
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
    this.tree.updateState(this.state)

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