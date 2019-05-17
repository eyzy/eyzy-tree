import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import EyzyTree from '../../src/components/Tree'
import EyzyTreeAPI from '../../src/api/EyzyTreeAPI'
// import EyzyNodeAPI from '../../src/api/EyzyNodeAPI'
import Adapter from 'enzyme-adapter-react-16'

Enzyme.configure({ adapter: new Adapter() })

const data = [
  { text: 'Item 1', child: ['Item 1.1', 'Item 1.2', 'Item 1.3'] },
  { text: 'Item 2', selected: true },
  { text: 'Item 3', checked: true, child: ['Item 3.1', 'Item 3.2'] },
  { text: 'For remove', child: ['Remove 1', 'Remove 2', 'Remove 3'] },
  { text: 'For empty', child: [ 
    { text: 'For empty 1', child: ['a', 'b', 'c'] }, 
    { text: 'For empty 2', child: ['a', 'b', 'c'] },
    { text: 'For empty 3', child: ['a', 'b', 'c'] }
  ] }
]

let api: any = null

const component = shallow(<EyzyTree 
  data={data}
  checkable
  onReady={(treeApi) => api = new EyzyTreeAPI(treeApi)}
/>)

describe('EyzyNodeAPI', () => {
  it('Find', () => {
    expect(api).toBeTruthy()
  })

  it('FindAll', () => {
    expect(api).toBeTruthy()
  })

  it('Remove', () => {
    expect(api.find('aaa').remove()).toBe(null)
    expect(api.find('Remove 2').remove()).toHaveProperty('text', 'Remove 2')

    const multiple = api.findAll(/Remove \d/).remove()

    expect(multiple).toHaveLength(2)
    expect(multiple[0].text).toBe('Remove 1')
    expect(multiple[1].text).toBe('Remove 3')

    expect(api.findAll(/Remove \d/).remove()).toBe(null)
    expect(api.find('For remove').result.child).toHaveLength(0)

    api.remove('For remove')
  })

  it('Empty', () => {
    expect(api.empty(/lalalla/)).toBe(null)
    expect(api.find('For empty 2').result.child).toHaveLength(3)
    expect(api.find(/for empty 2/i).empty()).toBe(true)

    expect(api.findAll(/For empty (1|3)/i).empty()).toBe(true)

    expect(api.find('For empty 1').result.child).toHaveLength(0)
    expect(api.find('For empty 2').result.child).toHaveLength(0)
    expect(api.find('For empty 3').result.child).toHaveLength(0)

    expect(api.findAll(/For empty (1|3)/i).empty()).toBe(false)

    api.remove('For empty')
  })

  it('Selecting', () => {
    expect(api.find('aaaa').select()).toBeNull()
    expect(api.find('Item 2').select()).toBe(false)
    expect(api.findAll(/Item (2|77)/).select()).toBe(false)

    const item1 = api.find('Item 1')

    expect(item1.select()).toBe(true)
    expect(item1.result.selected).toBe(true)
    expect(api._tree.selected).toContain(item1.result.id)

    // extend selection (single mode(!))
    const item2 = api.find('Item 2')

    expect(item2.select(true)).toBe(true)
    expect(item2.result.selected).toBe(true)
    expect(item2.result.expanded).toBeFalsy()
    expect(api._tree.selected).toEqual([item2.result.id])

    // expanding
    const item3 = api.find('Item 3')
    expect(item3.select(true, true)).toBe(true)
    expect(item3.result.selected).toBe(true)
    expect(api._tree.selected).toEqual([item3.result.id])
    // TODO: re-query. Will be fixed later
    expect(api.find('Item 3').result.expanded).toBe(true)


    component.setProps({'multiple': true})

    const item2_2 = api.find('Item 1')

    expect(item2_2.select(true)).toBe(true)
    expect(item2_2.result.selected).toBe(true)
    expect(api._tree.selected).toEqual([item3.result.id, item2_2.result.id])

    api.unselectAll()

    expect(api._tree.selected).toEqual([])
    expect(api.findAll(/aaaaaaa/).select(true)).toBeNull()
    expect(api.findAll(/^Item (2|3)$/).select(true)).toBe(true)
    expect(api._tree.selected).toHaveLength(2)

    component.setProps({'multiple': false})
  })
})