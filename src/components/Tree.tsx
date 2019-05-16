import React, { ReactElement } from 'react'
import '../assets/tree.scss'
import '../assets/node.scss'
import '../assets/theme.scss'
import '../assets/animations.scss'

import NodeComponent from './TreeNode'

import { Node, TreeNode } from '../types/Node'
import { TreeProps, TreeComponent } from '../types/Tree'
import { State as StateType } from '../types/State'
import { Core, PromiseNodes } from '../types/Core'

import { TreeAPI } from '../TreeAPI'
import State from '../core/State'
import CoreTree from '../core/Core'

import uuid from '../utils/uuid'
import { grapObjProps, isString, copy } from '../utils/index'
import { parseNode } from '../utils/parser'
import { shallowEqual } from '../utils/shallowEqual'
import { recurseDown, traverseUp, getFirstChild, flatMap } from '../utils/traveler'
import { linkedNode } from '../utils/linkedNode'
import { has, copyArray, isNodeIndeterminate, isLeaf, isExpandable } from '../utils'

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

  silence: boolean = false

  selected: string[] = []
  checked: string[] = []
  indeterminate: string[] = []

  focused: string

  core: Core

  // tslint:disable-next-line
  _state: StateType

  constructor(props: TreeProps) {
    super(props)

    const data = parseNode(
      copy(props.data || [])
    )

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
    this.core = new CoreTree(this, this._state)

    if (this.props.noCascade !== true) {
      this.checked.forEach((id: string) => {
        const node = this._state.byId(id)

        if (!node) {
          return
        }

        if (isLeaf(node) || !node.parent) {
          this.refreshDefinite(id, true, false)
        }
      })
    }

    this.state = {
      nodes: this._state.get(),
      hash: uuid(),
      mutatingFields: grapObjProps(props, mutatingFields)
    }
  }

  static getDerivedStateFromProps(nextProps: TreeProps, state: TreeState) {
    if (nextProps.onChange) {
      return {
        hash: uuid(),
        nodes: parseNode(copy(nextProps.data || []))
      }
    }

    if (!shallowEqual(nextProps, state.mutatingFields, mutatingFields)) {
      return {
        hash: uuid(),
        mutatingFields: grapObjProps(nextProps, mutatingFields)
      }
    }

    return null
  }

  isControlled(): boolean {
    return !!this.props.onChange
  }

  componentDidMount() {
    if (this.props.onReady) {
      this.props.onReady(
        new TreeAPI(this as TreeComponent, this._state, this.core)
      )
    }
  }

  $emit = (name: string, id: string | TreeNode, ...args: any) => {
    if (this.silence) {
      return
    }

    const eventCb = this.props['on' + name]

    if (!eventCb) {
      return
    }

    if (isString(id)) {
      const node = this.getState().byId(id as string)

      if (node) {
        eventCb.call(null, node, ...args)
      }
    } else {
      eventCb.call(null, id, ...args)
    }
  }

  refreshDefinite = (id: string, willBeChecked: boolean, shouldRender?: boolean) => {
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
      this.updateState()
    }

    nodesForEvent.forEach((id: string) => {
      this.$emit('Check', id, willBeChecked)
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

  updateState = (state: StateType = this._state) => {
    const nodes: TreeNode[] = state.get()

    if (this.props.onChange) {
      this.props.onChange(state.toArray())
    } else {
      this.setState({ nodes })
    }
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
        this.$emit('UnSelect', id)
      }

      return false
    })

    this.updateState()
  }

  select = (node: TreeNode, ignoreEvent?: boolean, extendSelection?: boolean, ignoreUpdating?: boolean) => {
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
          events.push(['UnSelect', node.id])
        }

        return false
      })
    }

    state.set(id, 'selected', true)

    this.focused = id
    this.selected.push(id)

    if (!ignoreUpdating) {
      this.updateState()
    }

    if (true !== ignoreEvent) {
      events.push(['Select', id])
      events.forEach((event: string[]) => this.$emit(event[0], event[1]))
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
    const $emits: string[][] = []

    this.selected.forEach((id: string) => {
      if (!has(willBeSelected, id)) {
        state.set(id, 'selected', false)
        $emits.push(['UnSelect', id])
      }
    })

    this.selected = willBeSelected.map((id: string) => {
      if (!has(this.selected, id)) {
        state.set(id, 'selected', true)
        $emits.push(['Select', id])
      }

      return id
    })

    this.updateState()
 
    $emits.forEach(([name, id]) => {
      this.$emit(name, id)
    })
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
      this.refreshDefinite(node.id, willBeChecked)
    } else {
      this.updateState()
    }

    this.$emit('Check', id, willBeChecked)
  }

  expand = (node: TreeNode, includingDisabled?: boolean) => {
    if (node.disabled && !includingDisabled) {
      return
    }

    if (node.isBatch) {
      return this.loadChild(node)
    }

    if (!isExpandable(node)) {
      return
    }

    const state = this.getState()
    const { selectOnExpand } = this.props

    state.set(node.id, 'expanded', !node.expanded)

    if (selectOnExpand && !node.selected) {
      this.select(node)
    }

    this.updateState()
    this.$emit('Expand', node.id, !node.expanded)
  }

  handleDoubleClick = (node: TreeNode) => {
    this.$emit('DoubleClick', node.id)

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
            this.core.unselectAll()
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

  loadChild = (node: TreeNode): PromiseNodes | void => {
    const { fetchData } = this.props

    if (!fetchData || node.loading) {
      return
    }

    return this.core.insert(node, fetchData, { expand: true })
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

    if (this.isControlled()) {
      this._state.nodes = this.state.nodes
    }

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
