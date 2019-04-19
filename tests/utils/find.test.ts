import { find } from '../../src/utils/find'
import { parseNode } from '../../src/utils/parser'
import { walkBreadth } from '../../src/utils/traveler'

const collection = parseNode([
  { text: 'Item 1', id: 'sg23-d3hs' },
  { text: 'Item 2', someProperty: false, data: { weight: 100 } },
  { text: 'Item 3', someProperty: 'AWESOMEProperty' },
  { text: 'Item 4', checked: true, child: [
    'SubItem 1', 'SubItem 2', 'SubItem 3', 'SubItem 4'
  ]},
  { text: 'Item 5', selected: true, className: 'class1 class2', data: { weight: 100 } },
  { text: 'Item 6', expanded: true, child: [
    'SubItem 61', 'SubItem 62'
  ]},
  { text: 'Item 7', disabled: true, data: { weight: 400 }  },
  { text: 'Item 8', checked: true, child: [
    'SubItem 1', 'SubItem 2', 'SubItem 3', 'SubItem 4'
  ]},
  { text: 'Item 9', checked: true, someProperty: { text: 'a', num: 2, o: { a: 10 } } },
])

const callFind = (query?: any, isMultiple?: boolean) => {
  return find(collection, walkBreadth, isMultiple || false, query)
}

describe('Find', () => {
  it('Nothing found', () => {
    expect(callFind('Item 55')).toBeNull()
    expect(callFind({ text: 'Item 33' })).toBeNull()
    expect(callFind({ lalal: /Item 33/ })).toBeNull()
    expect(callFind({})).toBeNull()
    expect(callFind()).toBeNull()
    expect(callFind(false)).toBeNull()
    expect(callFind(() => {})).toBeNull()
    expect(callFind({ length: 5 })).toBeNull() 
  })

  it('Search by text', () => {
    expect(callFind(/^Item/)).toBe(collection[0])
    expect(callFind('Item 1')).toBe(collection[0])
  })

  it('Search by id', () => {
    expect(callFind('sg23-d3hs')).toBe(collection[0])
    expect(callFind({ id: /sg\d/ })).toBe(collection[0])
    expect(callFind(/sg\d/)).toBeNull()
  })

  it('RegExp', () => {
    expect(callFind({ text: /2$/ })).toBe(collection[1])
    expect(callFind({ someProperty: /awesome/ })).toBeNull()
    expect(callFind({ someProperty: /awesome/i })).toBe(collection[2])
    expect(callFind({ someProperty: /false/ })).toBe(collection[1])  // ... !nice case! ...
  })

  it('Function', () => {
    const fn0 = (node: any) => false === node.someProperty
    const fn1 = () => true
    const fn2 = () => false
    const fn3 = (node: any) => node.child && node.child.length > 0 && node.child[0].text === 'SubItem 1'
    const fn4 = (node: any) => node.child && node.child.length === 2

    expect(callFind(fn0)).toBe(collection[1])
    expect(callFind(fn1)).toBe(collection[0])
    expect(callFind(fn2)).toBeNull()
    expect(callFind(fn3)).toHaveProperty('text', 'Item 4')
    expect(callFind(fn4)).toBe(collection[5])
  })

  it('"and" condition', () => {
    expect(callFind({ selected: true, className: /class/ })).toBe(collection[4])
    expect(callFind({ selected: false, someProperty: 'AWESOMEProperty' })).toBeNull()

    // TODO: should it works? create specific condition or let it be...
    // expect(callFind({ selected: undefined, someProperty: 'AWESOMEProperty' })).toBeNull()

    // TODO
    // expect(callFind({ expanded: true, checked: false })).toBe(collection[5])
    expect(callFind( { checked: true, isLeaf: false } )).toBe(collection[3])
    expect(callFind( { checked: true, isLeaf: true } )).toBe(collection[8])
    expect(callFind( { checked: true, expanded: true } )).toBeNull()
  })

  it('"or" condition', () => {
    expect(callFind(['Item 33', { text: 'Item 4' }])).toBe(collection[3])
    expect(callFind([
      { text: 'Item 4', expanded: true },
      { text: 'Item 5', expanded: true },
      { text: 'Item 6', expanded: true }
    ])).toBe(collection[5])
    expect(callFind([{ id: true }, { someProperty: true }])).toBeNull()
    expect(callFind( [{ checked: true, expanded: true }, 'Item 1'] )).toBe(collection[0])
  })

  it('specials', () => {
    expect(callFind({ expandable: true })).toBe(collection[3])
    expect(callFind({ expandable: false })).toBe(collection[0])

    expect(callFind({ expanded: true })).toBe(collection[5])
    // expect(callFind({ expanded: false })).toBe(collection[0])

    expect(callFind({ disabledCheckbox: false })).toBe(collection[0])
    expect(callFind({ disabledCheckbox: true })).toBeNull()
    
    expect(callFind({ disabled: true })).toBe(collection[6])
    expect(callFind({ disabled: false })).toBe(collection[0])
    
    expect(callFind({ checkable: true })).toBe(collection[0])
    expect(callFind({ checkable: false })).toBe(collection[6])
    
    // expect(callFind({ checked: false })).toBe(collection[0])
    expect(callFind({ checked: true })).toBe(collection[3])

    // expect(callFind({ selected: false })).toBe(collection[0])
    expect(callFind({ selected: true })).toBe(collection[4])

    expect(callFind({ isLeaf: true })).toBe(collection[0])
    expect(callFind({ isLeaf: false })).toBe(collection[3])

    expect(callFind( { $not: { disabled: false } } )).toBe(collection[6])
    // expect(callFind( { $not: { expanded: true } } )).toBe(collection[3])
    expect(callFind( { $not: { text: /^Item \d/ } } )).toHaveProperty('text', 'SubItem 1')
  })

  it('chain keys', () => {
    expect(callFind( { 'data.weight' : 100, selected: true } )).toBe(collection[4])
    expect(callFind( { 'someProperty.o.a' : 10, checked: true } )).toBe(collection[8])
    expect(callFind( { 'data.bebebe' : 100 } )).toBeNull()
    // expect(callFind( { 'child.1.text' : 'SubItem 61' } )).toHaveProperty('text', 'SubItem 61')
  })

  it('"or" value', () => {

  })

  it('multiple', () => {

  })
})