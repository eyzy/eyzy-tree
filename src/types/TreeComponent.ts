import State, { StateObject } from '../utils/state'

export interface TreeComponent {
  selectedNodes: string[]
  checkedNodes: string[]
  indeterminateNodes: string[]
  _state: State<StateObject>
}