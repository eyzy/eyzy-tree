import { TreeNode } from '../../src/types/Node'
import { find } from '../../src/utils/find'
import { walkBreadth } from '../../src/utils/traveler'

const collection = [
  { text: 'Item 1' },
  { text: 'Item 2', someProperty: false },
  { text: 'Item 3', someProperty: 'AWESOMEProperty' }
]

const callFind = (isMultiple: boolean = false, query: any) => {
  return find(collection as TreeNode[], walkBreadth, isMultiple, query)
}

describe('Find', () => {
  it('Nothing found', () => {
    expect(callFind(undefined, 'Item 55')).toBeNull()
    expect(callFind(undefined, { text: 'Item 33' })).toBeNull()
    expect(callFind(undefined, { lalal: /Item 33/ })).toBeNull()
  })

  it('RegExp', () => {
    expect(callFind(undefined, /^Item/)).toBe(collection[0])
    expect(callFind(undefined, { text: /2$/ })).toBe(collection[1])
    expect(callFind(undefined, { someProperty: /awesome/ })).toBeNull()
    expect(callFind(undefined, { someProperty: /awesome/i })).toBe(collection[2])
    expect(callFind(undefined, { someProperty: /false/ })).toBe(collection[1])  // ... !nice case! ...
  })
})