import { Tree } from './Tree'
import State, { StateObject } from '../utils/state'

export interface TreeComponent {
  props: Tree
  selectedNodes: string[]
  checkedNodes: string[]
  indeterminateNodes: string[]
  _state: State<StateObject>
}