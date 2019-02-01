import { Node } from '../types/Node'

export const hasOwnProp = {}.hasOwnProperty

export function grapObjProps(obj: any, props: string[]) {
  return props.reduce((result: any, name: string) => {
    if (name in obj) {
      result[name] = obj[name]
    }

    return result
  }, {});
}

export function isArray(obj: any): boolean {
  return Array.isArray(obj)
}

export function isExpandable(node: Node): boolean {
  return !!(node.child && node.child.length) || !!node.isBatch
}

export function isNodeCheckable(node: Node): boolean {
  return !(!!node.disabled || !!node.disabledCheckbox)
}

export function isFunction(value: any): boolean {
  return 'function' === typeof value 
}

export function has(targetArray: any[], targetValue: any): boolean {
  return !!~targetArray.indexOf(targetValue)
}

export function copyArray<T>(arr: T[]): T[] {
  return arr.concat([])
}

export function copyObject(obj: any) {
  const newObj = {}

  for (const i in obj) {
    if (hasOwnProp.call(obj, i)) {
      newObj[i] = isArray(obj[i]) ? copyArray(obj[i]) : obj[i]
    }
  }

  return newObj
}

export function isRoot(node: Node): boolean {
  return node && !node.parent
}

export function isLeaf(node: Node): boolean {
  return !node.child || (0 === node.child.length && !node.isBatch)
}

export function isNodeIndeterminate(node: Node, treeCheckedNodes: string[], indeterminateNodes: string[]): boolean {
  if (!node.child.length) {
    return false
  }

  const hasIndeterminate: boolean = node.child.some((child: Node) => {
    return !child.disabled && !child.disabledCheckbox && -1 !== indeterminateNodes.indexOf(child.id)
  })

  if (hasIndeterminate) {
    return true
  }

  const uncheckedNodes = node.child.reduce((count: number, item: Node) => {
    if (true !== item.disabled && true !== item.disabledCheckbox && -1 === treeCheckedNodes.indexOf(item.id)) {
      count++
    }

    return count
  }, 0)

  return uncheckedNodes > 0 && uncheckedNodes < node.child.length
}
