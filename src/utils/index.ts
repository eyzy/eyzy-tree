
export function copyArray<T>(arr: T[]): T[] {
  return arr.concat([])
}