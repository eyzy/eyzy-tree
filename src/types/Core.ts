import { TreeNode } from "./Node"
import { FlatMap } from '../utils/traveler'

export type PromiseNodes = PromiseLike<TreeNode[] | TreeNode>
export type PromiseCallback = (node: TreeNode) => PromiseNodes
export type Resource = string | object | (string | object)[] | PromiseLike<any> | PromiseCallback

export interface InsertOptions {
  expand?: boolean
  loading?: boolean
  index?: number
}

export interface Core {
  flatMap: (collection: TreeNode[], ignoreCollapsed?: boolean) => FlatMap
  find: <T>(target: TreeNode[], multiple: boolean, ...criterias: any) => T | null
  clearKeys: (node: TreeNode, excludeSelf: boolean) => void
  load(node: TreeNode, resource: PromiseCallback, showLoading?: boolean): PromiseNodes
  beside(node: TreeNode, resource: PromiseCallback, shift: number): PromiseNodes
  insert(targetNode: TreeNode, resource: Resource, opts?: InsertOptions): PromiseNodes
  remove(targetNode: TreeNode): TreeNode | null
  data(targetNode: TreeNode, key?: any, value?: any): any
  hasClass(targetNode: TreeNode, className: string): boolean
  removeClass(targetNode: TreeNode, classNames: string | string[]): TreeNode
  addClass(targetNode: TreeNode, classNames: string | string[]): TreeNode
  uncheckAll(): void
}