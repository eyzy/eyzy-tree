import { IEyzyNodeAPI, APIOpts, APIResult, APIBooleanResult } from '../types/Api'
import { TreeComponent, TreeProps, TreeAPI } from '../types/Tree'
import { TreeNode } from '../types/Node'
import { State } from '../types/State'
import { InsertOptions } from '../types/Core'

import { hasChild, isArray, toArray } from './utils'

export default class EyzyNode implements IEyzyNodeAPI {
  _tree: TreeComponent
  _props: TreeProps
  _state: State
  _api: TreeAPI
  _nodes: TreeNode[] | TreeNode | null
  _opts: APIOpts

  constructor(nodes: TreeNode[] | TreeNode | null, api: TreeAPI, opts: APIOpts) {
    this._api = api
    this._state = api.state
    this._tree = api.tree
    this._props = api.tree.props
    this._nodes = nodes
    this._opts = opts
  }

  get length(): number {
    const nodes = this._nodes

    return isArray(nodes)
      ? (nodes as TreeNode[]).length
      : nodes ? 1 : 0
  }

  get result(): TreeNode | TreeNode[] | null {
    return this._nodes
  }

  private isSilence() {
    return this._opts && this._opts.silence
  }

  private _insert(operator: (node: TreeNode, state: State) => any): PromiseLike<IEyzyNodeAPI> {
    if (!this._nodes) {
      return Promise.resolve(this)
    }

    return operator(this._nodes as TreeNode, this._state).then((node: TreeNode) => {
      return new EyzyNode(
        node,
        this._api, 
        this._opts
      )
    })
  }

  private _operate<T>(updateState: boolean, operator: (node: TreeNode, state: State) => any): T | null {
    const nodes = this._nodes

    if (!nodes || isArray(nodes) && !(nodes as TreeNode[]).length) {
      return null
    }

    const tree = this._tree
    const state = this._state

    if (this.isSilence()) {
      tree.silence = true
    }

    let result

    if (isArray(nodes)) {
      result = (nodes as Array<TreeNode>).map((node: TreeNode) => operator(node, state))
    } else {
      result = operator(nodes as TreeNode, state)
    }

    const arrResult = toArray(result)

    if ('boolean' === typeof arrResult[0] || undefined === arrResult[0]) {
      result = arrResult.every(res => false !== res)
    }

    if (updateState) {
      tree.updateState(state)
    }

    if (this.isSilence()) {
      tree.silence = false
    }

    return result
  }

  remove(): APIResult {
    return this._operate<APIResult>(false, (node: TreeNode): APIResult => {
      return this._api.remove(node.id)
    })
  }

  empty(): APIBooleanResult {
    return this._operate<APIBooleanResult>(true, (node: TreeNode, state: State): any => {
      if (!hasChild(node)) {
        return false
      }

      this._api.core.clearKeys(node, true)

      state.set(node.id, {
        child: [],
        indeterminate: false,
        isBatch: false
      })

      if (node.parent) {
        this._tree.refreshDefinite(node.id, !!node.checked, false)
      }
    })
  }

  select(extendSelection?: boolean, expandOnSelect?: boolean): APIBooleanResult {
    if (undefined === expandOnSelect) {
      expandOnSelect = this._props.expandOnSelect
    }

    return this._operate<APIBooleanResult>(false, (node: TreeNode): any => {
      if (node.selected) {
        return false
      }

      if (this._props.multiple) {
        this._tree.select(node, false, extendSelection)
      } else {
        this._tree.select(node)
      }

      if (expandOnSelect && !node.expanded) {
        this._tree.expand(node)
      }
    })
  }

  unselect(): APIBooleanResult {
    return this._operate<APIBooleanResult>(false, (node: TreeNode): any => {
      if (!node.selected) {
        return false
      }

      this._tree.unselect(node)
    })
  }

  check(): APIBooleanResult {
    if (!this._props.checkable) {
      return false
    }

    return this._operate<APIBooleanResult>(false, (node: TreeNode): any => {
      if (node.checked) {
        return false
      }

      this._tree.check(node)
    })
  }

  uncheck(): APIBooleanResult {
    if (!this._props.checkable) {
      return false
    }

    return this._operate<APIBooleanResult>(false, (node: TreeNode, state: State): any => {
      if (!node.checked) {
        return false
      }

      this._tree.check(node)
    })
  }

  disable(): APIBooleanResult {
    return this._operate<APIBooleanResult>(true, (node: TreeNode, state: State): any => {
      if (node.disabled) {
        return false
      }

      state.set(node.id, 'disabled', true)
    })
  }

  enable(): APIBooleanResult {
    return this._operate<APIBooleanResult>(true, (node: TreeNode, state: State): any => {
      if (!node.disabled) {
        return false
      }

      state.set(node.id, 'disabled', false)
    })
  }

  disableCheckbox(): APIBooleanResult {
    if (!this._props.checkable) {
      return false
    }

    return this._operate<APIBooleanResult>(true, (node: TreeNode, state: State): any => {
      if (node.disabledCheckbox) {
        return false
      }

      state.set(node.id, 'disabledCheckbox', true)
    })
  }

  enableCheckbox(): APIBooleanResult {
    if (!this._props.checkable) {
      return false
    }

    return this._operate<APIBooleanResult>(true, (node: TreeNode, state: State): any => {
      if (!node.disabledCheckbox) {
        return false
      }

      state.set(node.id, 'disabledCheckbox', false)

      if (hasChild(node) && this._props.useIndeterminateState) {
        const iNode: TreeNode = node.checked
          ? node
          : node.child[0]

        this._tree.refreshDefinite(iNode.id, !!iNode.checked, false)
      }
    })
  }

  expand(includingDisabled?: boolean): APIBooleanResult {
    return this._operate<APIBooleanResult>(false, (node: TreeNode): any => {
      if (!hasChild(node) || node.expanded) {
        return false
      }

      if (node.disabled && !includingDisabled) {
        return false
      }

      this._tree.expand(node, includingDisabled)
    })
  }

  collapse(includingDisabled?: boolean): APIBooleanResult {
    return this._operate<APIBooleanResult>(false, (node: TreeNode): any => {
      if (!hasChild(node) || !node.expanded) {
        return false
      }

      if (node.disabled && !includingDisabled) {
        return false
      }

      this._tree.expand(node, includingDisabled)
    })
  }

  data(key: any, value?: any): any {
    if (!this._nodes) {
      return null
    }

    const nodes = toArray(this._nodes)

    if (1 === nodes.length) {
      const result: any = this._api.core.data(nodes[0], key, value)

      if (nodes[0] === result) {
        return new EyzyNode(nodes[0], this._api, this._opts)
      }

      return result
    }

    return nodes.map((node: TreeNode) => this._api.core.data(node, key, value))
  }

  hasClass(className: string): APIBooleanResult {
    if (!this._nodes) {
      return null
    }

    return toArray(this._nodes).every((node: TreeNode) => this._api.core.hasClass(node, className))
  }

  addClass(classNames: string | string[]): APIBooleanResult {
    if (!this._nodes) {
      return null
    }

    toArray(this._nodes).forEach((node: TreeNode) => this._api.core.addClass(node, classNames))

    return true
  }

  removeClass(classNames: string | string[]): APIBooleanResult {
    return this._operate<APIBooleanResult>(false, (node: TreeNode) => {
      if (!node.className) {
        return
      }

      const oldClassNames = node.className
      const updatedNode = this._api.core.removeClass(node, classNames)

      return oldClassNames !== updatedNode.className
    })
  }

  append(source: any, opts?: InsertOptions): PromiseLike<IEyzyNodeAPI> {
    return this._insert((node: TreeNode) => {
      return this._api.core.insert(node, source, opts)
    })
  }

  prepend(source: any, opts?: InsertOptions): PromiseLike<IEyzyNodeAPI> {
    return this._insert((node: TreeNode) => {
      return this._api.core.insert(node, source, Object.assign({}, opts, {index: 0}))
    })
  }
  
  before(source: any): PromiseLike<IEyzyNodeAPI> {
    return this._insert((node: TreeNode) => {
      return this._api.core.beside(node, source, 0)
    })
  }

  after(source: any): PromiseLike<IEyzyNodeAPI> {
    return this._insert((node: TreeNode) => {
      return this._api.core.beside(node, source, 1)
    })
  }

  _find<T>(query: any, multiple: boolean): T | null {
    const nodes = toArray(this._nodes)
      .reduce((result: TreeNode[], node: TreeNode) => {
        if (hasChild(node)) {
          result.push(...node.child)
        }

        return result
      }, [])

    return this._api.core.find<T>(nodes, multiple, query)
  }

  find(query: any): IEyzyNodeAPI {
    return new EyzyNode(this._find<TreeNode>(query, false), this._api, this._opts)
  }

  findAll(query: any): IEyzyNodeAPI {
    return new EyzyNode(this._find<TreeNode[]>(query, true), this._api, this._opts)
  }
}