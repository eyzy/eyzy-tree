import React, { ReactElement } from 'react'
import '../assets/tree.scss'
import '../assets/node.scss'
import '../assets/theme.scss'
import '../assets/animations.scss'

import TreeNode from './TreeNode'

import { Node } from '../types/Node'
import { Tree } from '../types/Tree'

import State from '../utils/state'
import { parseNode } from '../utils/parser'
import { recurseDown, traverseUp } from '../utils/traveler'
import { copyArray, isNodeIndeterminate, isFunction, isLeaf } from '../utils'

export default class EyzyTree extends React.Component<Tree> {
  static TreeNode = TreeNode

  stateLength: number
  stateCache: State<any> | null = null

  selectedNodes: string[] = []
  checkedNodes: string[] = []
  indeterminateNodes: string[] = []

  constructor(props: Tree) {
    super(props)

    const data = parseNode(props.data)
    const stateObject = {}

    data.forEach((item: Node, i: number) => {
      stateObject[i] = item
    })

    recurseDown(stateObject, (obj: Node) => {
      if (obj.selected) {
        this.selectedNodes.push(obj.id)
      }

      if (obj.checked) {
        this.checkedNodes.push(obj.id)
      }
    })

    const state = new State(stateObject, data.length)

    this.checkedNodes.forEach((id: string) => {
      const node = state.getNodeById(id)

      if (node && isLeaf(node) && this.props.autoCheckChildren !== false) {
        this.useState(state, () => {
          this.refreshIndeterminateState(id, true, false)
        })
      }
    })

    this.stateLength = data.length
    this.state = state.get()
    this.stateCache = null
  }

  fireEvent = (name: string, id: string, ...args: any) => {
    const eventCb = this.props[name]

    if (!eventCb) {
      return
    }

    const node = this.getState().getNodeById(id)

    if (node) {
      eventCb.call(null, node, ...args)
    }
  }

  refreshIndeterminateState = (id: string, willBeChecked: boolean, shouldRender?: boolean) => {
    let checkedNodes: string[] = copyArray(this.checkedNodes)
    let indeterminateNodes = copyArray(this.indeterminateNodes)

    const state = this.getState()
    const childIds: string[] = []
    const node = state.getNodeById(id)
    const nodesForEvent: string[] = []

    if (!node) {
      return
    }

    recurseDown(node, (child: Node) => {
      if (!child.disabled && !child.disabledCheckbox && id !== child.id) {
        childIds.push(child.id)

        if (child.checked !== willBeChecked) {
          nodesForEvent.push(child.id)
        }
      }
    })

    if (willBeChecked) {
      checkedNodes.push(...childIds)
    } else {
      checkedNodes = checkedNodes.filter(nodeId => !~childIds.indexOf(nodeId))
    }

    traverseUp(node, (parentNode: Node): any => {
      if (parentNode.disabledCheckbox || parentNode.disabled) {
        return false
      }

      const isIndeterminate = isNodeIndeterminate(parentNode, checkedNodes, indeterminateNodes)
      const id = parentNode.id

      if (isIndeterminate) {
        !~indeterminateNodes.indexOf(id) && indeterminateNodes.push(id)
        checkedNodes = checkedNodes.filter(nodeId => nodeId !== id)
      } else {
        indeterminateNodes = indeterminateNodes.filter(nodeId => nodeId !== id)

        if (willBeChecked) {
          checkedNodes.push(id)
        } else {
          checkedNodes = checkedNodes.filter(nodeId => nodeId !== id)
        }
      }
    })

    indeterminateNodes = indeterminateNodes.filter(nodeId => !~checkedNodes.indexOf(nodeId))

    this.checkedNodes.forEach((id: string) => {
      if (-1 !== this.checkedNodes.indexOf(id)) {
        state.set(id, 'checked', false)
      }
    })

    this.indeterminateNodes.forEach((id: string) => {
      if (-1 !== this.indeterminateNodes.indexOf(id)) {
        state.set(id, 'indeterminate', false)
      }
    })

    checkedNodes.forEach((id: string) => state.set(id, 'checked', true))
    indeterminateNodes.forEach((id: string) => state.set(id, 'indeterminate', true))

    this.checkedNodes = checkedNodes
    this.indeterminateNodes = indeterminateNodes

    if (false !== shouldRender) {
      this.updateState(state, true)
    }

    nodesForEvent.forEach((id: string) => {
      this.fireEvent('onCheck', id, willBeChecked)
    })
  }

  getState = () => {
    return this.stateCache || new State(this.state, this.stateLength)
  }

  updateState = (state: any, clearCache?: boolean) => {
    if (clearCache) {
      this.setState(state)
      this.stateCache = null
      return
    }

    if (this.stateCache) {
      return
    }

    this.setState(state)
  }

  useState = (state: any, cb: () => void): any => {
    this.stateCache = state
    cb()
  }

  select = (node: Node, ignoreEvent?: boolean) => {
    const state = this.getState()
    const id = node.id

    if (node.selected) {
      return
    }

    this.selectedNodes = this.selectedNodes.filter((nodeId: string) => {
      const node = state.getNodeById(nodeId)

      if (node) {
        state.set(node.id, 'selected', false)

        if (true !== ignoreEvent) {
          this.fireEvent('onUnSelect', node.id)
        }
      }

      return false
    })

    state.set(id, 'selected', true)

    this.selectedNodes.push(id)
    this.updateState(state.get())

    if (true !== ignoreEvent) {
      this.fireEvent('onSelect', id)
    }
  }

  check = (node: Node) => {
    const state = this.getState()
    const willBeChecked: boolean = !node.checked
    const id: string = node.id

    state.set(id, 'checked', willBeChecked)

    if (willBeChecked) {
      this.checkedNodes = [...this.checkedNodes, id]
    } else {
      this.checkedNodes = this.checkedNodes.filter((checkedId: string) => id !== checkedId)
    }

    if (this.props.selectOnCheck) {
      this.useState(state, () => {
        this.select(node)
      })
    }

    if (this.props.autoCheckChildren !== false) {
      this.fireEvent('onCheck', id, willBeChecked)
      this.useState(state, () => {
        this.refreshIndeterminateState(node.id, willBeChecked)
      })
    } else {
      this.updateState(state.get(), true)
      this.fireEvent('onCheck', id, willBeChecked)
    }
  }

  expand = (node: Node) => {
    if (node.isBatch) {
      return this.loadChild(node)
    }

    if (!node.child.length) {
      return
    }

    const state = this.getState()

    state.set(node.id, 'expanded', !node.expanded)

    if (this.props.selectOnExpand && !node.selected) {
      this.useState(state, () => {
        this.select(node)
      })
    }

    this.updateState(state.get(), true)
    this.fireEvent('onExpand', node.id, !node.expanded)
  }

  handleDoubleClick = (node: Node) => {
    this.fireEvent('onDoubleClick', node.id)

    if (node.disabled || !node.child.length || this.props.expandOnSelect) {
      return
    }

    this.expand(node)
  }

  handleSelect = (node: Node, event: React.MouseEvent) => {
    this.select(node)

    const { checkOnSelect, expandOnSelect, checkable } = this.props

    if (checkable && checkOnSelect && !node.disabledCheckbox) {
      this.check(node)
    } else if (expandOnSelect) {
      this.expand(node)
    }
  }

  loadChild = (node: Node) => {
    const { fetchData } = this.props

    if (!fetchData || !isFunction(fetchData)) {
      return
    }

    const result = fetchData(node) 

    if (!result || !result.then) {
      throw new Error('`fetchData` property must return a Promise')
    }

    const state = this.getState()
    const autoCheckChildren = this.props.autoCheckChildren
    const id = node.id

    state.set(id, 'loading', true)

    result.then((nodes: any[]) => {
      const child = parseNode(nodes).map((obj: Node) => {
        obj.parent = node
        return obj
      })

      state.set(id, 'loading', false)
      state.set(id, 'expanded', true)
      state.set(id, 'isBatch', false)
      state.set(id, 'child', child)

      this.fireEvent('onExpand', id, true)

      recurseDown(state.getNodeById(id), (obj: Node) => {
        if (id == obj.id || !obj.checked) {
          return
        }

        this.checkedNodes.push(obj.id)

        if (!isLeaf(obj) || autoCheckChildren === false) {
          return
        }

        this.useState(state, () => {
          this.refreshIndeterminateState(obj.id, !!obj.checked, false)
        })
      })

      this.updateState(state.get(), true)
    })

    this.updateState(state.get())
  }

  renderNode = (node: Node): ReactElement<Node> => {
    const treePropsKeys: string[] = [
      'checkable', 'arrowRenderer', 'textRenderer', 'checkboxRenderer'
    ]

    const treeProps = treePropsKeys.reduce((props: any, key: string) => {
      if (this.props[key]) {
        props[key] = this.props[key]
      }

      return props
    }, {})

    return (
      <TreeNode
        key={node.id}
        node={node}
        onSelect={this.handleSelect}
        onDoubleClick={this.handleDoubleClick}
        onCheck={this.check}
        onExpand={this.expand}
        {...treeProps}
        {...node}
      >
        { node.expanded ? node.child.map(this.renderNode) : null }
      </TreeNode>
    )
  }

  render() {
    const nodes = []
    const props = this.props
    const treeClass = 'theme' in props 
      ? 'eyzy-tree ' + props.theme
      : 'eyzy-tree eyzy-theme'

    for (let i = 0; i < this.stateLength; i++) {
      nodes.push(this.renderNode(this.state[i]))
    }

    return (
      <ul className={treeClass}>
        { nodes }
      </ul>
    )
  }
}
