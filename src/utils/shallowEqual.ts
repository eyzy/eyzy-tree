
export function shallowEqual(objA: any, objB: any, keys: string[]): boolean {
  if (objA === objB) {
    return true
  }

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const valueA = objA[key]
    const valueB = objB[key]

    if (valueA !== valueB) {
      return false
    }
  }

  return true
}