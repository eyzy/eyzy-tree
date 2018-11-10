
const hasOwn = {}.hasOwnProperty

export default function cn(args: any): string {
  const result = []

  for (const key in args) {
    if (hasOwn.call(args, key) && args[key]) {
      result.push(key)
    }
  }

  return result.join(' ')
}