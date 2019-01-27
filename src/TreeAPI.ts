import State, { StateObject } from './utils/state'
import { Tree } from './types/Tree'

export class TreeAPI {
  private state: State<StateObject>
  private tree: React.Component<Tree>

  constructor(tree: React.Component<Tree>, state: State<StateObject>) {
    this.tree = tree
    this.state = state
  }
}