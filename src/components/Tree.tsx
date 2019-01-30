import React, { ReactElement } from 'react'
import '../assets/tree.scss'
import '../assets/node.scss'
import '../assets/theme.scss'
import '../assets/animations.scss'

import TreeNode from './TreeNode'

import { Node } from '../types/Node'
import { Tree } from '../types/Tree'

import { TreeAPI } from '../TreeAPI'
import State, { StateObject } from '../utils/state'
import { parseNode } from '../utils/parser'
import { recurseDown, traverseUp, getFirstChild } from '../utils/traveler'
import { linkedNode } from '../utils/linkedNode'
import { has, copyArray, isNodeIndeterminate, isFunction, isLeaf, isExpandable } from '../utils'


export default class EyzyTree extends React.Component<Tree> {
  static TreeNode = TreeNode

  selectedNodes: string[] = []
  checkedNodes: string[] = []
  indeterminateNodes: string[] = []

  _state: State<StateObject>

  constructor(props: Tree) {
    super(props)

    const data = parseNode(props.data)
    const stateObject = {}

    data.forEach((item: Node, i: number) => {
      stateObject[i] = item
    })

    recurseDown(stateObject, (obj: Node, depth: number) => {
      obj.depth = depth

      if (obj.selected) {
        this.selectedNodes.push(obj.id)
      }

      if (obj.checked) {
        this.checkedNodes.push(obj.id)
      }
    })

    this._state = new State(stateObject as StateObject, data.length)

    this.checkedNodes.forEach((id: string) => {
      const node = this._state.getNodeById(id)

      if (node && isLeaf(node) && this.props.noCascade !== true) {
        this.refreshIndeterminateState(id, true, false)
      }
    })

    this.state = this._state.get()
  }

  componentDidMount() {
    if (this.props.onReady) {
      this.props.onReady(
        new TreeAPI(this, this._state)
      )
    }
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
      if (!child.disabled && !child.disabledCheckbox) {
        childIds.push(child.id)

        if (child.checked !== willBeChecked) {
          nodesForEvent.push(child.id)
        }
      }
    }, true)

    if (willBeChecked) {
      checkedNodes.push(...childIds.filter((id: string) => !has(checkedNodes, id)))
    } else {
      checkedNodes = checkedNodes.filter(nodeId => !has(childIds, nodeId))
    }

    traverseUp(node, (parentNode: Node): any => {
      if (parentNode.disabledCheckbox || parentNode.disabled) {
        return false
      }

      const isIndeterminate = isNodeIndeterminate(parentNode, checkedNodes, indeterminateNodes)
      const id = parentNode.id

      if (isIndeterminate) {
        !has(indeterminateNodes, id) && indeterminateNodes.push(id)
        checkedNodes = checkedNodes.filter(nodeId => nodeId !== id)
      } else {
        indeterminateNodes = indeterminateNodes.filter(nodeId => nodeId !== id)

        if (willBeChecked && !has(checkedNodes, id)) {
          checkedNodes.push(id)
        } else {
          checkedNodes = checkedNodes.filter(nodeId => nodeId !== id)
        }
      }
    })

    indeterminateNodes = indeterminateNodes.filter(nodeId => !has(checkedNodes, nodeId))

    if (willBeChecked) {
      checkedNodes.forEach((id: string) => {
        if (!has(this.checkedNodes, id)) {
          state.set(id, 'checked', true)
        }
      })
    } else {
      this.checkedNodes.forEach((id: string) => {
        if (!has(checkedNodes, id)) {
          state.set(id, 'checked', false)
        }
      })

      childIds.forEach((id: string) => {
        state.set(id, 'checked', false)
      })
    }

    this.indeterminateNodes.forEach((id: string) => {
      state.set(id, 'indeterminate', false)
    })

    const useIndeterminateState: boolean = false !== this.props.useIndeterminateState

    if (useIndeterminateState) {
      indeterminateNodes.forEach((id: string) => state.set(id, 'indeterminate', true))
    }

    this.checkedNodes = checkedNodes
    this.indeterminateNodes = indeterminateNodes

    if (false !== shouldRender) {
      this.updateState(state)
    }

    nodesForEvent.forEach((id: string) => {
      this.fireEvent('onCheck', id, willBeChecked)
    })
  }

  getState = (): State<StateObject> => {
    return this._state
  }

  getSelectedNode = (): Node | null => {
    const lastSelectedNode = this.selectedNodes[this.selectedNodes.length - 1]

    if (!lastSelectedNode) {
      return null
    }

    return this.getState().getNodeById(lastSelectedNode)
  }

  updateState = (state: State<StateObject>) => {
    this.setState(state.get())
  }

  unselectAll = () => {
    const state = this.getState()

    this.selectedNodes = this.selectedNodes.filter((id: string) => {
      state.set(id, 'selected', false)
      return false
    })

    this.updateState(state)
  }

  unselect = (node: Node) => {
    if (!node.selected) {
      return
    }

    const state = this.getState()
    state.set(node.id, 'selected', false)

    this.selectedNodes = this.selectedNodes.filter((id: string) => {
      if (id !== node.id) {
        return true
      }

      if (state.getNodeById(id)) {
        state.set(id, 'selected', false)
        this.fireEvent('onUnSelect', id)
      }

      return false
    })

    this.updateState(state)
  }

  select = (node: Node, ignoreEvent?: boolean, extendSelection?: boolean) => {
    const state = this.getState()
    const id = node.id
    const events: Array<string[]> = []
    const { multiple } = this.props

    if (extendSelection && node.selected) {
      return this.unselect(node)
    }

    if (!multiple && node.selected) {
      return
    }

    if (!multiple || (multiple && !extendSelection)) {
      this.selectedNodes = this.selectedNodes.filter((nodeId: string) => {
        const node = state.getNodeById(nodeId)

        if (node) {
          state.set(node.id, 'selected', false)
          events.push(['onUnSelect', node.id])
        }
        
        return false
      })
    }

    state.set(id, 'selected', true)

    this.selectedNodes.push(id)
    this.updateState(state)

    if (true !== ignoreEvent) {
      events.push(['onSelect', id])
      events.forEach((event: string[]) => this.fireEvent(event[0], event[1]))
    }
  }

  check = (node: Node) => {
    if (!this.props.checkable) {
      return
    }

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
      this.select(node)
    }

    if (this.props.noCascade !== true) {
      this.fireEvent('onCheck', id, willBeChecked)
      this.refreshIndeterminateState(node.id, willBeChecked)
    } else {
      this.updateState(state)
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
    const { selectOnExpand } = this.props

    state.set(node.id, 'expanded', !node.expanded)

    if (selectOnExpand && !node.selected) {
      this.select(node)
    }

    this.updateState(state)
    this.fireEvent('onExpand', node.id, !node.expanded)
  }

  handleDoubleClick = (node: Node) => {
    this.fireEvent('onDoubleClick', node.id)

    if (node.disabled || isLeaf(node) || this.props.expandOnSelect) {
      return
    }

    this.expand(node)
  }

  handleSelect = (node: Node, event: React.MouseEvent) => {
    if (node.disabled) {
      return
    }

    if (this.props.preventSelectParent && isExpandable(node)) {
      return this.expand(node)
    }
    
    const { checkOnSelect, expandOnSelect, checkable } = this.props

    this.select(node, false, event.ctrlKey)

    if (event.ctrlKey) {
      return
    }

    if (checkable && checkOnSelect && !node.disabledCheckbox) {
      this.check(node)
    } else if (expandOnSelect) {
      this.expand(node)
    }
  }

  handleKeyUp = (event: React.KeyboardEvent) => {
    if (false === this.props.keyboardNavigation) {
      return
    }

    const keyCode = event.keyCode
    const selectedNode = this.getSelectedNode()

    if (selectedNode) {
      switch(keyCode) {
        case 32: // space
        case 13: // enter
          if (this.props.checkable && !selectedNode.disabled && !selectedNode.disabledCheckbox) {
            this.check(selectedNode)
          } else if (!isLeaf(selectedNode)) {
            this.expand(selectedNode)
          }
        break;
  
        case 27: // esc
          if (this.props.multiple) {
            this.unselectAll()
          } else {
            this.unselect(selectedNode)
          }
        break;

        case 39: // right arrow
          if (!isLeaf(selectedNode)) {
            if (!selectedNode.expanded) {
              this.expand(selectedNode)
            } else {
              const firstChild = getFirstChild(selectedNode, true)

              if (firstChild) {
                this.select(firstChild)
              }
            }
          }
        break;

        case 37: // left arrow 
          if (isLeaf(selectedNode) || !selectedNode.expanded) {
            const parentNode = selectedNode.parent

            if (parentNode) {
              this.select(parentNode)
            }
          } else if (selectedNode.expanded) {
            this.expand(selectedNode)
          }
        break;

        case 40: // bottom arrow
          const {next} = linkedNode(selectedNode, this.getState())
          
          if (next) {
            this.select(next)
          }
        break;

        case 38: // up arrow
          const {prev} = linkedNode(selectedNode, this.getState())

          if (prev) {
            this.select(prev)
          }
        break;
      }
    }
  }

  appendChild = (id: string, nodes: any[]): Node | null => {
    const state = this.getState()
    const node = state.getNodeById(id)

    if (!node) {
      return null
    }

    const parentDepth: number = node.depth || 0
    const child = parseNode(nodes).map((obj: Node) => {
      obj.parent = node
      return obj
    })

    const cascadeCheck: boolean = true !== this.props.noCascade
    const checkedNodes: string[] = []

    recurseDown(child, (obj: Node, depth: number) => {
      obj.depth = parentDepth + depth + 1

      if (cascadeCheck && obj.parent && obj.parent.checked) {
        obj.checked = true
      }

      if (obj.checked && !~this.checkedNodes.indexOf(obj.id)) {
        checkedNodes.push(obj.id)
      }
    })

    this.checkedNodes.push(...checkedNodes)

    state.set(node.id, 'child', child)

    if (cascadeCheck) {
      checkedNodes.forEach((id: string) => {
        const node = state.getNodeById(id)
  
        if (node && isLeaf(node)) {
          this.refreshIndeterminateState(id, true, false)
        }
      })
    }

    return node
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
    const id = node.id

    state.set(id, 'loading', true)

    result.then((nodes: any[]) => {
      this.appendChild(id, nodes)

      state.set(id, {
        loading: false,
        expanded: true,
        isBatch: false
      })

      this.fireEvent('onExpand', id, true)
      this.updateState(state)
    })

    this.updateState(state)
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

    for (let i = 0; i < this._state.length; i++) {
      nodes.push(this.renderNode(this.state[i]))
    }

    return (
      <ul 
        className={treeClass} 
        tabIndex={-1} 
        onKeyDown={this.handleKeyUp}>
          { nodes }
      </ul>
    )
  }
}
