import { TreeNode } from './types/Node'
import { TreeComponent } from './types/Tree'
import { State } from './types/State'
import { Core, PromiseNodes, InsertOptions } from './types/Core'
import { CheckboxValueConsistency, TreeAPI as ITreeAPI } from './types/Tree'

import { isNodeCheckable, isLeaf } from './utils/index'
import { find } from './utils/find'
import { walkBreadth } from './utils/traveler'

export class TreeAPI implements ITreeAPI {
  readonly state: State
  readonly tree: TreeComponent
  readonly core: Core

  constructor(tree: TreeComponent, state: State, core: Core) {
    this.tree = tree
    this.state = state
    this.core = core
  }

  private _operate<T = any>(query: any, operator: (node: TreeNode) => T | null): T | null {
    const node: TreeNode | null = this.find(query)

    if (!node) {
      return null
    }

    return operator(node)
  }

  after(query: any, source: any): TreeNode[] | PromiseNodes | null {
    return this._operate<TreeNode[] | PromiseNodes>(query, (node: TreeNode) => {
      return this.core.beside(node, source, 1)
    })
  }

  before(query: any, source: any): TreeNode[] | PromiseNodes | null {
    return this._operate<TreeNode[] | PromiseNodes>(query, (node: TreeNode) => {
      return this.core.beside(node, source, 0)
    })
  }

  append(query: any, source: any, opts?: InsertOptions): PromiseNodes | null {
    return this._operate<PromiseNodes>(query, (node: TreeNode) => {
      return this.core.insert(node, source, opts)
    })
  }

  prepend(query: any, source: any, opts?: InsertOptions): PromiseNodes | null {
    return this._operate<PromiseNodes>(query, (node: TreeNode) => {
      return this.core.insert(node, source, Object.assign({}, opts, {index: 0}))
    })
  }

  addClass(query: any, ...classNames: string[]): TreeNode | null {
    return this._operate<TreeNode>(query, (node: TreeNode) => {
      return this.core.addClass(node, classNames)
    })
  }

  removeClass(query: any, ...classNames: string[]): TreeNode | null {
    return this._operate<TreeNode>(query, (node: TreeNode) => {
      return this.core.removeClass(node, classNames)
    })
  }

  hasClass(query: any, className: string): boolean | null {
    return this._operate<boolean>(query, (node: TreeNode) => {
      return this.core.hasClass(node, className)
    })
  }

  data(query: any, key: any, value?: any): any {
    return this._operate<TreeNode>(query, (node: TreeNode) => {
      return this.core.data(node, key, value)
    })
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
    return this._operate<TreeNode>(query, (node: TreeNode) => {
      return this.core.remove(node)
    })
  }

  toArray(): TreeNode[] {
    return this.state.get()
  }
}