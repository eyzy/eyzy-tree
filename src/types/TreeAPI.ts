import { TreeNode } from './Node'
import { State } from './State'
import { TreeComponent } from './Tree'

export type CheckboxValueConsistency = 'ALL' | 'BRANCH' | 'LEAF' | 'WITH_INDETERMINATE'

export interface TreeAPI {
  state: State
  tree: TreeComponent
  set: (query: any, key: string, value: any) => boolean  
  find: (...criterias: any) => TreeNode | null
  findAll: (...criterias: any) => TreeNode[]
  selected: () => TreeNode[]
  checked: (valueConsistsOf?: CheckboxValueConsistency, ignoreDisabled?: boolean) => TreeNode[]
  toJSON: () => TreeNode[]
}

