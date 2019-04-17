import { TreeNode } from '../types/Node'
import { TreeComponent } from '../types/Tree'
import { State } from '../types/State'
import { Core, PromiseCallback, PromiseNodes, Resource, InsertOptions } from '../types/Core'
import { callFetcher, isCallable, isString, remove, has, isLeaf } from '../utils'
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

  updateKeys = (nodes: TreeNode[], targetNodes?: TreeNode[]): void => {
    const tree = this.tree
    const state = tree.getState()
    const checked = tree.checked
    const cascadeCheck: boolean = true !== tree.props.noCascade

    let lastSelected: string

    if (targetNodes) {
      targetNodes.forEach((node: TreeNode) => {
        if (node.selected) {
          lastSelected = node.id
        }
      })
    }

    nodes.forEach((parentNode: TreeNode) => {
      const parentDepth: number = parentNode.depth || 0

      recurseDown(parentNode, (obj: TreeNode, depth: number) => {
        if (obj.id !== parentNode.id) {
          obj.depth = parentDepth + depth + 1 
        }
  
        if (cascadeCheck && obj.parent && obj.parent.checked) {
          obj.checked = true
        }
  
        if (obj.checked && !has(checked, obj.id)) {
          checked.push(obj.id)
        }

        if (obj.selected) {
          tree.selected.push(obj.id)

          if (!lastSelected) {
            lastSelected = obj.id
          }
        }
      })

      if (lastSelected) {
        tree.selected = tree.selected.filter((id: string) => {
          if (id !== lastSelected) {
            state.set(id, 'selected', false)
          }

          return id === lastSelected
        })
      }

      if (cascadeCheck) {
        checked.forEach((id: string) => {
          const node: TreeNode | null = state.byId(id)

          if (node && isLeaf(node)) {
            tree.refreshDefinite(id, true, false)
          }
        })
      }
    })
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
      this.state.set(node.id, {
        isBatch: false,
        loading: false
      })

      return parseNode(items, node)
    })
  }

  beside = (targetNode: TreeNode, resource: Resource, shift: number): PromiseNodes => {
    const insertIndex: number | null = this.state.getIndex(targetNode)

    if (null === insertIndex) {
      return Promise.resolve([])
    }

    const parent: TreeNode | null = targetNode.parent
    const insert = (nodes: Resource) => {
      return this.insert(parent, nodes, { 
        expand: parent ? parent.expanded : false, 
        loading: false, 
        index: insertIndex + shift 
      })
    }

    if (isCallable(resource)) {
      return this.load(targetNode, resource, false).then((nodes: TreeNode[]) => {
        return insert(nodes)
      })
    } else {
      return insert(resource)
    }
  }

  insert = (parent: TreeNode | null, resource: Resource, opts: InsertOptions): PromiseNodes => {
    opts = parseOpts(opts)

    const tree = this.tree
    const state = tree.getState()

    const insert = (nodes: TreeNode[]) => {
      const index: number = undefined !== opts.index 
        ? opts.index 
        : (parent && parent.child ? parent.child.length : 0)

      const child = state.insertAt(
        parent,
        nodes,
        index
      )

      if (parent) {
        const updatedItem = state.set(parent.id, {
          child
        })

        if (updatedItem) {
          // it must be called before checking 'selectOnExpand'
          this.updateKeys([updatedItem], nodes)

          if (opts.expand && !updatedItem.expanded) {
            this.tree.expand(updatedItem)
          }
        }
      } else {
        this.updateKeys(nodes)
      }

      tree.$emit('Add', parent, nodes)
      tree.updateState()

      return nodes
    }

    if (parent && isCallable(resource)) {
      return this.load(parent, resource as PromiseCallback, opts.loading).then(insert)
    } else {
      return Promise.resolve(
        insert(parseNode(resource))
      )
    }
  }

  remove = (node: TreeNode): TreeNode | null => {
    const removedNode: TreeNode | null = this.state.remove(node.id)

    if (removedNode) {
      removedNode.parent = null

      this.clearKeys(removedNode)
      this.tree.updateState()
      this.tree.$emit('Remove', removedNode)
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

  uncheckAll = () => {
    const tree = this.tree

    if (!tree.props.checkable) {
      return
    }

    const state = tree.getState()

    tree.checked = tree.checked.filter((id: string) => {
      state.set(id, 'checked', false)
      return false
    })

    tree.indeterminate = tree.indeterminate.filter((id: string) => {
      state.set(id, 'indeterminate', false)
      return false
    })

    tree.updateState()
  }
}