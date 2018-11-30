import { Node } from '../types/Node'

export function recurseDown(obj: Node | Node[], fn: (obj: Node) => any, excludeSelf?: boolean): any {
  let res

  if (Array.isArray(obj)) {
    return obj.map(node => recurseDown(node, fn))
  }

  if (!excludeSelf) {
    res = fn(obj)
  }

  if (res !== false && obj.child && obj.child.length) {
    res = recurseDown(obj.child, fn)
  }

  return res
}
