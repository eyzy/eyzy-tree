import { TreeNode } from "./Node"

export interface Core {
  load(node: TreeNode, resource: (node: TreeNode) => PromiseLike<TreeNode[]>, skipLoading?: boolean): PromiseLike<TreeNode[]>
}