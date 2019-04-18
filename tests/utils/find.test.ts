import { TreeNode } from '../../src/types/Node'
import { find } from '../../src/utils/find'
import { walkBreadth } from '../../src/utils/traveler'

const collection = [
  { text: 'Item 1' },
  { text: 'Item 2', someProperty: false },
  { text: 'Item 3', someProperty: 'AWESOMEProperty' }
]

const callFind = (query: any, isMultiple: boolean = false) => {
  return find(collection as TreeNode[], walkBreadth, isMultiple, query)
}

describe('Find', () => {
  it('Nothing found', () => {
    expect(callFind('Item 55')).toBeNull()
    expect(callFind({ text: 'Item 33' })).toBeNull()
    expect(callFind({ lalal: /Item 33/ })).toBeNull()
  })

  it('RegExp', () => {
    expect(callFind(/^Item/)).toBe(collection[0])
    expect(callFind({ text: /2$/ })).toBe(collection[1])
    expect(callFind({ someProperty: /awesome/ })).toBeNull()
    expect(callFind({ someProperty: /awesome/i })).toBe(collection[2])
    expect(callFind({ someProperty: /false/ })).toBe(collection[1])  // ... !nice case! ...
  })
})