import { TreeNode } from './Node'

export type IterableValue = [string, any]

export interface State {
  nodes: TreeNode[]
  updateRoot: (node: TreeNode, iterableValue?: IterableValue[]) => void
  updateLeaf: (node: TreeNode, iterableValue: IterableValue[]) => void
  set: (id: string, key: any, value?: any) => State
  getIndex: (node: TreeNode) => number | null
  byId: (id: string) => TreeNode | null
  get: () => TreeNode[]
  toArray: () => TreeNode[]
}