import { hasOwnProp } from './index'

export function shallowEqual(objA: any, objB: any): boolean {
  if (objA === objB) {
    return true
  }

  const keys = Object.keys(objA)

  if (keys.length !== Object.keys(objB).length) {
    return false
  }

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]

    if (!hasOwnProp.call(objB, key)) {
      return false
    }

    const valueA = objA[key]
    const valueB = objB[key]

    if (valueA !== valueB) {
      return false
    }
  }

  return true
}