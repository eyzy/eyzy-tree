import { TreeNode } from "./Node"

export type PromiseNodes = PromiseLike<TreeNode[] | TreeNode>
export type PromiseCallback = (node: TreeNode) => PromiseNodes
export type Resource = string | object | (string | object)[] | PromiseLike<any> | PromiseCallback

export interface InsertOptions {
  expand?: boolean
  loading?: boolean
}

export interface Core {
  load(node: TreeNode, resource: PromiseCallback, showLoading?: boolean): PromiseNodes
  insertAt(targetNode: TreeNode, resource: Resource, insertIndex: number): PromiseNodes | TreeNode[]
  addChild(targetNode: TreeNode, resource: Resource, insertIndex: number | undefined, opts?: InsertOptions): PromiseNodes | TreeNode
}