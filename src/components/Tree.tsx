import React, { ReactElement } from 'react'
import '../assets/tree.scss'
import '../assets/node.scss'
import '../assets/theme.scss'
import '../assets/animations.scss'

import NodeComponent from './TreeNode'

import { Node, TreeNode } from '../types/Node'
import { TreeProps, TreeComponent } from '../types/Tree'
import { State as StateType } from '../types/State'

import { TreeAPI } from '../TreeAPI'

import State from '../utils/state'
import uuid from '../utils/uuid'
import { grapObjProps } from '../utils/index'
import { parseNode } from '../utils/parser'
import { shallowEqual } from '../utils/shallowEqual'
import { recurseDown, traverseUp, getFirstChild, flatMap } from '../utils/traveler'
import { linkedNode } from '../utils/linkedNode'
import { has, copyArray, isNodeIndeterminate, isFunction, isLeaf, isExpandable } from '../utils'

const mutatingFields = [
  'checkable', 
  'useIndeterminateState', 
  'checkboxRenderer',
  'arrowRenderer',
  'textRenderer'
]

interface TreeState {
  nodes: TreeNode[]
  hash: string
  mutatingFields: {string: any}
}

export default class EyzyTree extends React.Component<TreeProps, TreeState> implements TreeComponent {
  static TreeNode = NodeComponent

  selected: string[] = []
  checked: string[] = []
  indeterminate: string[] = []

  focused: string

  // tslint:disable-next-line
  _state: StateType

  constructor(props: TreeProps) {
    super(props)

    const data = parseNode(props.data || [])

    recurseDown(data, (obj: TreeNode, depth: number) => {
      obj.depth = depth

      if (obj.selected) {
        this.selected.push(obj.id)
      }

      if (obj.checked) {
        this.checked.push(obj.id)
      }
    })

    this._state = new State(data)

    this.checked.forEach((id: string) => {
      const node = this._state.byId(id)

      if (node && isLeaf(node) && this.props.noCascade !== true) {
        this.refreshIndeterminateState(id, true, false)
      }
    })

    this.state = {
      nodes: this._state.get(),
      hash: uuid(),
      mutatingFields: grapObjProps(props, mutatingFields)
    }
  }

  static getDerivedStateFromProps(nextProps: TreeProps, state: TreeState) {
    if (!shallowEqual(nextProps, state.mutatingFields, mutatingFields)) {
      return {
        hash: uuid(),
        mutatingFields: grapObjProps(nextProps, mutatingFields)
      }
    }

    return null
  }

  componentDidMount() {
    if (this.props.onReady) {
      this.props.onReady(
        new TreeAPI(this as TreeComponent, this._state)
      )
    }
  }

  fireEvent = (name: string, id: string, ...args: any) => {
    const eventCb = this.props[name]

    if (!eventCb) {
      return
    }

    const node = this.getState().byId(id)

    if (node) {
      eventCb.call(null, node, ...args)
    }
  }

  refreshIndeterminateState = (id: string, willBeChecked: boolean, shouldRender?: boolean) => {
    let checked: string[] = copyArray(this.checked)
    let indeterminate = copyArray(this.indeterminate)

    const state = this.getState()
    const childIds: string[] = []
    const node = state.byId(id)
    const nodesForEvent: string[] = []

    if (!node) {
      return
    }

    recurseDown(node, (child: TreeNode) => {
      if (!child.disabled && !child.disabledCheckbox) {
        childIds.push(child.id)

        if (child.checked !== willBeChecked) {
          nodesForEvent.push(child.id)
        }
      }
    }, true)

    if (willBeChecked) {
      checked.push(...childIds.filter((id: string) => !has(checked, id)))
    } else {
      checked = checked.filter(nodeId => !has(childIds, nodeId))
    }

    traverseUp(node, (parentNode: TreeNode): any => {
      if (parentNode.disabledCheckbox || parentNode.disabled) {
        return false
      }

      const isIndeterminate = isNodeIndeterminate(parentNode, checked, indeterminate)
      const id = parentNode.id

      if (isIndeterminate) {
        if (!has(indeterminate, id)) {
          indeterminate.push(id)
        }

        checked = checked.filter(nodeId => nodeId !== id)
      } else {
        indeterminate = indeterminate.filter(nodeId => nodeId !== id)

        if (willBeChecked && !has(checked, id)) {
          checked.push(id)
        } else {
          checked = checked.filter(nodeId => nodeId !== id)
        }
      }
    })

    indeterminate = indeterminate.filter(nodeId => !has(checked, nodeId))

    if (willBeChecked) {
      checked.forEach((id: string) => {
        if (!has(this.checked, id)) {
          state.set(id, 'checked', true)
        }
      })
    } else {
      this.checked.forEach((id: string) => {
        if (!has(checked, id)) {
          state.set(id, 'checked', false)
        }
      })

      childIds.forEach((id: string) => {
        state.set(id, 'checked', false)
      })
    }

    this.indeterminate.forEach((id: string) => {
      state.set(id, 'indeterminate', false)
    })

    const useIndeterminateState: boolean = false !== this.props.useIndeterminateState

    if (useIndeterminateState) {
      indeterminate.forEach((id: string) => state.set(id, 'indeterminate', true))
    }

    this.checked = checked
    this.indeterminate = indeterminate

    if (false !== shouldRender) {
      this.updateState(state)
    }

    nodesForEvent.forEach((id: string) => {
      this.fireEvent('onCheck', id, willBeChecked)
    })
  }

  getState = (): StateType => {
    return this._state
  }

  getSelectedNode = (): TreeNode | null => {
    const lastSelectedNode = this.selected[this.selected.length - 1]

    if (!lastSelectedNode) {
      return null
    }

    return this.getState().byId(lastSelectedNode)
  }

  updateState = (state: StateType) => {
    this.setState({ nodes: state.get() })
  }

  unselectAll = () => {
    const state = this.getState()

    this.selected = this.selected.filter((id: string) => {
      state.set(id, 'selected', false)
      return false
    })

    this.updateState(state)
  }

  unselect = (node: TreeNode) => {
    if (!node.selected) {
      return
    }

    const state = this.getState()
    state.set(node.id, 'selected', false)

    this.selected = this.selected.filter((id: string) => {
      if (id !== node.id) {
        return true
      }

      if (state.byId(id)) {
        state.set(id, 'selected', false)
        this.fireEvent('onUnSelect', id)
      }

      return false
    })

    this.updateState(state)
  }

  select = (node: TreeNode, ignoreEvent?: boolean, extendSelection?: boolean) => {
    const state = this.getState()
    const id: string = node.id
    const events: string[][] = []
    const { multiple } = this.props

    if (extendSelection && node.selected) {
      return this.unselect(node)
    }

    if (!multiple && node.selected) {
      return
    }

    if (!multiple || (multiple && !extendSelection)) {
      this.selected = this.selected.filter((nodeId: string) => {
        const node = state.byId(nodeId)

        if (node) {
          state.set(node.id, 'selected', false)
          events.push(['onUnSelect', node.id])
        }

        return false
      })
    }

    state.set(id, 'selected', true)

    this.focused = id
    this.selected.push(id)
    this.updateState(state)

    if (true !== ignoreEvent) {
      events.push(['onSelect', id])
      events.forEach((event: string[]) => this.fireEvent(event[0], event[1]))
    }
  }

  selectRange = (focused: string, targetNode: string) => {
    const { ids, nodes } = flatMap(this.state.nodes, true)

    const focusedIndex = ids.indexOf(focused)
    const targetIndex = ids.indexOf(targetNode)

    if (!~focusedIndex || !~targetIndex) {
      return
    }

    const start = Math.min(focusedIndex, targetIndex)
    const end = Math.max(focusedIndex, targetIndex) + 1
    const state = this.getState()
    const willBeSelected: string[] = nodes.slice(start, end).map((node: TreeNode) => node.id) 
    const fireEvents: string[][] = []

    this.selected.forEach((id: string) => {
      if (!has(willBeSelected, id)) {
        state.set(id, 'selected', false)
        fireEvents.push(['onUnSelect', id])
      }
    })

    this.selected = willBeSelected.map((id: string) => {
      if (!has(this.selected, id)) {
        state.set(id, 'selected', true)
        fireEvents.push(['onSelect', id])
      }

      return id
    })

    this.updateState(state)
 
    fireEvents.forEach(([name, id]) => {
      this.fireEvent(name, id)
    })
  }

  uncheckAll = () => {
    if (!this.props.checkable) {
      return
    }
    
    const state = this.getState()

    this.checked = this.checked.filter((id: string) => {
      state.set(id, 'checked', false)
      return false
    })

    this.indeterminate = this.indeterminate.filter((id: string) => {
      state.set(id, 'indeterminate', false)
      return false
    })

    this.updateState(state)
  }

  check = (node: TreeNode) => {
    if (!this.props.checkable || node.disabled || node.disabledCheckbox) {
      return
    }

    const state = this.getState()
    const willBeChecked: boolean = !node.checked
    const id: string = node.id

    state.set(id, 'checked', willBeChecked)

    if (willBeChecked) {
      this.checked = [...this.checked, id]
    } else {
      this.checked = this.checked.filter((checkedId: string) => id !== checkedId)
    }

    if (this.props.selectOnCheck) {
      this.select(node)
    }

    if (this.props.noCascade !== true) {
      this.refreshIndeterminateState(node.id, willBeChecked)
      this.fireEvent('onCheck', id, willBeChecked)
    } else {
      this.updateState(state)
      this.fireEvent('onCheck', id, willBeChecked)
    }
  }

  expand = (node: TreeNode) => {
    if (node.disabled) {
      return
    }

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

  handleDoubleClick = (node: TreeNode) => {
    this.fireEvent('onDoubleClick', node.id)

    if (node.disabled || isLeaf(node) || this.props.expandOnSelect) {
      return
    }

    this.expand(node)
  }

  handleSelect = (node: TreeNode, event: React.MouseEvent) => {
    if (node.disabled) {
      return
    }

    if (this.props.preventSelectParent && isExpandable(node)) {
      return this.expand(node)
    }

    const { multiple, checkOnSelect, expandOnSelect, checkable } = this.props

    if (event.shiftKey && multiple && this.focused) {
      return this.selectRange(this.focused, node.id)
    }

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

            if (parentNode && !parentNode.disabled) {
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

  appendChild = (id: string, nodes: any[]): TreeNode | null => {
    const state = this.getState()
    const node = state.byId(id)

    if (!node) {
      return null
    }

    const parentDepth: number = node.depth || 0
    const child = parseNode(nodes).map((obj: TreeNode) => {
      obj.parent = node
      return obj
    })

    const cascadeCheck: boolean = true !== this.props.noCascade
    const checked: string[] = []

    recurseDown(child, (obj: TreeNode, depth: number) => {
      obj.depth = parentDepth + depth + 1

      if (cascadeCheck && obj.parent && obj.parent.checked) {
        obj.checked = true
      }

      if (obj.checked && !has(this.checked, obj.id)) {
        checked.push(obj.id)
      }
    })

    this.checked.push(...checked)

    state.set(node.id, 'child', child)

    if (cascadeCheck) {
      checked.forEach((id: string) => {
        const node: TreeNode | null = state.byId(id)
  
        if (node && isLeaf(node)) {
          this.refreshIndeterminateState(id, true, false)
        }
      })
    }

    return node
  }

  loadChild = (node: TreeNode) => {
    const { fetchData, selectOnExpand } = this.props

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

      const selected: boolean = selectOnExpand ? true : has(this.checked, id)

      state.set(id, {
        loading: false,
        expanded: true,
        isBatch: false,
        selected
      })

      this.fireEvent('onExpand', id, true)
      this.updateState(state)

      if (selected && !this.checked.length) {
        this.select(node)
      }
    })

    this.updateState(state)
  }

  renderNode = (node: TreeNode): ReactElement<Node> => {
    const treePropsKeys: string[] = [
      'checkable', 'arrowRenderer', 'textRenderer', 'checkboxRenderer'
    ]

    const treeProps = treePropsKeys.reduce((props: any, key: string) => {
      if (this.props[key]) {
        props[key] = this.props[key]
      }

      return props
    }, {})

    treeProps.hash = this.state.hash
    treeProps.useIndeterminateState = this.props.useIndeterminateState

    return (
      <NodeComponent
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
      </NodeComponent>
    )
  }

  render() {
    const props = this.props
    const treeClass = 'theme' in props 
      ? 'eyzy-tree ' + props.theme
      : 'eyzy-tree eyzy-theme'

    return (
      <ul 
        className={treeClass} 
        tabIndex={-1} 
        onKeyDown={this.handleKeyUp}>
          {this.state.nodes.map((node: TreeNode) => 
             this.renderNode(node) 
          )}
      </ul>
    )
  }
}
