import { TreeNode } from '../types/Node'
import { TreeComponent } from '../types/Tree'
import { State } from '../types/State'
import { Core, PromiseCallback, PromiseNodes, Resource, InsertOptions } from '../types/Core'
import { callFetcher, isCallable, isString, remove, has } from '../utils'
import { parseNode } from '../utils/parser'
import { recurseDown, walkBreadth, FlatMap, flatMap } from '../utils/traveler'
import { find } from '../utils/find'

function parseOpts(opts?: InsertOptions): InsertOptions {
  try {
    return Object.assign({}, {loading: true}, opts)
  } catch(e) {
    return {
      loading: true
    }
  }
}

export default class CoreTree implements Core {
  private state: State
  private tree: TreeComponent

  constructor(tree: TreeComponent, state: State) {
    this.state = state
    this.tree = tree
  }

  flatMap = (collection: TreeNode[], ignoreCollapsed?: boolean): FlatMap => {
    return flatMap(collection, ignoreCollapsed)
  }

  find<T>(target: TreeNode[], multiple: boolean, criterias: any): T | null {
    return find(target, walkBreadth, multiple, criterias)
  }

  set = (node: TreeNode, key: string, value: any): void => {
    // TODO: selected, checked should be dublicated in the tree state
    this.state.set(node.id, key, value)
    this.tree.updateState()
  }

  clearKeys = (node: TreeNode, includeSelf: boolean = false): void => {
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

  load = (node: TreeNode, resource: Resource, showLoading?: boolean): PromiseNodes => {
    const result = callFetcher(node, resource)

    if (showLoading) {
      this.set(node, 'loading', true)
    }

    return result.then((items: any) => {
      if (showLoading) {
        this.state.set(node.id, 'loading', false)
      }

      return parseNode(items)
    })
  }

  insertAt = (node: TreeNode, resource: Resource, insertIndex: number): PromiseNodes | TreeNode[] => {
    const parent: TreeNode | null = node.parent || null
    const insert = (nodes: TreeNode[]) => {
      this.state.insertAt(
        parent ? parent : null,
        nodes,
        insertIndex
      )
      this.tree.updateState()
      return nodes
    }

    if (isCallable(resource)) {
      return this.load(node, resource as PromiseCallback, false).then(insert)
    } else {
      return insert(parseNode(resource))
    }
  }

  addChild = (node: TreeNode, resource: Resource, insertIndex: number | undefined, opts?: InsertOptions): PromiseNodes | TreeNode => {
    const id: string = node.id
    const {expand, loading} = parseOpts(opts)

    if (isCallable(resource)) {
      return this.load(node, resource, loading).then((nodes: TreeNode[]) => {
        this.tree.addChild(id, nodes, insertIndex)

        const updatedNode: TreeNode | null = this.state.byId(id)

        if (expand && updatedNode && !updatedNode.expanded) {
          this.tree.expand(updatedNode)
        }

        this.tree.updateState()

        return node
      })
    } else {
      this.tree.addChild(id, resource)

      if (expand && !node.expanded) {
        this.tree.expand(node)
      }

      this.tree.updateState()
    }

    return node
  }

  remove = (node: TreeNode): TreeNode | null => {
    const removedNode: TreeNode | null = this.state.remove(node.id)

    if (removedNode) {
      removedNode.parent = null

      this.clearKeys(removedNode)
      this.tree.updateState()
      this.tree.$emit('onRemove', removedNode)
    }

    return removedNode
  }

  data = (node: TreeNode, key: any, value?: any): any => {
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

  hasClass = (node: TreeNode, className: string): boolean => {
    return !!node.className && new RegExp(className).test(node.className)
  }

  removeClass(node: TreeNode, classNames: string[]): TreeNode {
    const className: string = (node.className || "")
      .split(' ')  
      .filter((klazz: string) => !has(classNames, klazz))
      .join(' ')

    this.set(node, 'className', className)

    return node
  }

  addClass(node: TreeNode, classNames: string[]): TreeNode {
    const className: string[] = node.className ? node.className.split(' ') : []  

    classNames.forEach((klazz: string) => {
      if (!has(className, "" + klazz)) {
        className.push(klazz)
      }
    })

    this.set(node, 'className', className.join(' '))

    return node
  }

}