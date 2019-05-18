import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import EyzyTree from '../../src/components/Tree'
import EyzyTreeAPI from '../../src/api/EyzyTreeAPI'
import EyzyNodeAPI from '../../src/api/EyzyNodeAPI'
import Adapter from 'enzyme-adapter-react-16'
import { TreeNode } from '../../src/types/Node'

Enzyme.configure({ adapter: new Adapter() })

const data = [
  { id: '1', text: 'Item 1', child: ['Item 1.1', 'Item 1.2', 'Item 1.3'] },
  { id: '2', text: 'Item 2', selected: true },
  { id: '3', text: 'Item 3', checked: true, child: ['Item 3.1', 'Item 3.2'] },
  { id: '4', text: 'Item 4' },
  { id: '5', text: 'Item 5', child: ['Item 5.1', 'Item 5.2'] },
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
    const findResult = api.find('For remove').find('Remove 1')
    const notFound = api.find('For remove').find('Removeeee 1')

    expect(findResult).toBeInstanceOf(EyzyNodeAPI)
    expect(findResult.result.text).toBe('Remove 1')

    expect(notFound).toBeInstanceOf(EyzyNodeAPI)
    expect(notFound.result).toBeNull()
  })

  it('FindAll', () => {
    const findResult = api.find('For remove').findAll(/Remove (1|2)/)
    const notFound = api.find('For remove').find('Removeeee 1')

    expect(findResult).toBeInstanceOf(EyzyNodeAPI)
    expect(findResult).toHaveLength(2)
    expect(findResult.result[0].text).toBe('Remove 1')
    expect(findResult.result[1].text).toBe('Remove 2')

    expect(notFound).toBeInstanceOf(EyzyNodeAPI)
    expect(notFound).toHaveLength(0)
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
    expect(api.find(/lalalla/).empty()).toBe(null)
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

    expect(api.find('Item 3').unselect()).toBe(true)
    expect(api.find('Item 3333').unselect()).toBe(null)
    expect(api.find('Item 3').unselect()).toBe(false)

  })

  it('Check/uncheck', () => {
    expect(api.find(/lalalla/).check()).toBe(null)
    expect(api.find('Item 3').check()).toBe(false)
    expect(api.find('Item 2').check()).toBe(true)

    expect(api._tree.checked).toContain('3')
    expect(api._tree.checked).toContain('2')

    api.uncheckAll()
    expect(api._tree.checked).toEqual([])
    expect(api.findAll({ checked: true }).result).toEqual([])

    expect(api.findAll(/Item (4|2)$/).check()).toBe(true)
    expect(api._tree.checked).toEqual(['2', '4'])

    expect(api.find('Item 1').uncheck()).toBe(false)
    expect(api.find('Item 2').uncheck()).toBe(true)
    expect(api._tree.checked).toEqual(['4'])
  })

  it('Disable/Enable', () => {
    expect(api.find('lalalal').disable()).toBe(null)
    expect(api.find('Item 1').disable()).toBe(true)
    expect(api.find({ disabled: true }).disable()).toBe(false)
    expect(api.findAll({ disabled: true })).toHaveLength(1)

    expect(api.findAll(/Item (2|3)$/).disable()).toBe(true)
    expect(api.findAll({ disabled: true })).toHaveLength(3)

    expect(api.find('lalalal').enable()).toBe(null)
    expect(api.find('Item 1').enable()).toBe(true)

    expect(api.findAll({ disabled: true })).toHaveLength(2)
    expect(api.findAll({ disabled: true }).enable()).toBe(true)
    expect(api.findAll({ disabled: true })).toHaveLength(0)
  })

  it('Disable/Enable checkbox', () => {
    expect(api.find('lalalal').disableCheckbox()).toBe(null)
    expect(api.find('Item 1').disableCheckbox()).toBe(true)
    expect(api.find({ disabledCheckbox: true }).disableCheckbox()).toBe(false)
    expect(api.findAll({ disabledCheckbox: true })).toHaveLength(1)

    expect(api.findAll(/Item (2|3)$/).disableCheckbox()).toBe(true)
    expect(api.findAll({ disabledCheckbox: true })).toHaveLength(3)

    expect(api.find('lalalal').enableCheckbox()).toBe(null)
    expect(api.find('Item 1').enableCheckbox()).toBe(true)

    expect(api.findAll({ disabledCheckbox: true })).toHaveLength(2)
    expect(api.findAll({ disabledCheckbox: true }).enableCheckbox()).toBe(true)
    expect(api.findAll({ disabledCheckbox: true })).toHaveLength(0)
  })

  it('Expand/Collapse', () => {
    expect(api.find('lalalal').expand()).toBe(null)
    expect(api.find('Item 1').expand()).toBe(true)
    expect(api.find('Item 1').expand()).toBe(false)
    expect(api.find('Item 4').expand()).toBe(false)

    expect(api.find('Item 1').collapse()).toBe(true)
    expect(api.find('Item 1').collapse()).toBe(false)

    api.findAll({ expanded: true }).collapse()

    expect(api.findAll(/Item (1|5)$/).expand()).toBe(true)
    expect(api.findAll({ expanded: true })).toHaveLength(2)

    api.findAll({ expanded: true }).collapse()
    api.disable('Item 5')

    expect(api.find('Item 5').expand()).toBe(false)
    expect(api.find('Item 5').expand(true)).toBe(true)
    
    expect(api.findAll({ expanded: true })).toHaveLength(1)
  })

  it('Data', () => {
    expect(api.find('lalalal').data()).toBe(null)
    expect(api.find('Item 1').data()).toEqual({})
    expect(api.find('Item 1').data('a', 10).result.data).toEqual({ a: 10 })
    expect(api.find('Item 1').data('b', 20).result.data).toEqual({ a: 10, b: 20 })
    expect(api.find('Item 1').data({ c: 30 }).result.data).toEqual({ a: 10, b: 20, c: 30 })

    expect(api.find('Item 1').data()).toEqual({ a: 10, b: 20, c: 30 })
    
    expect(api.find('Item 1').data('a')).toBe(10)
    expect(api.find('Item 1').data('aa')).toBe(undefined)

    expect(api.find('Item 2').data('a', 20)).toBeInstanceOf(EyzyNodeAPI)

    expect(api.findAll(/Item (1|2)$/).data('a')).toEqual([10, 20])
    expect(api.findAll(/Item (1|2|3)$/).data('a')).toEqual([10, 20, undefined])

    api.findAll(/Item (1|2|3)$/).data({ a: 100 })
    expect(api.findAll(/Item (1|2|3|4)$/).data('a')).toEqual([100, 100, 100, undefined])
  })

  it('Add/remove/has classNames', () => {
    expect(api.find('lalalal').hasClass('a')).toBe(null)
    expect(api.find('lalalal').addClass('b')).toBe(null)
    expect(api.find('lalalal').removeClass('c')).toBe(null)

    expect(api.find('Item 1').addClass('a')).toBe(true)
    expect(api.find('Item 1').addClass(['b', 'c'])).toBe(true)
    expect(api.find('Item 1').result.className).toBe('a b c')

    expect(api.find('Item 1').hasClass('a')).toBe(true)
    expect(api.find('Item 1').hasClass(['a'])).toBe(true)
    expect(api.find('Item 1').hasClass(['a', 'b'])).toBe(false) // ['a', 'b'] transforms to a,b

    expect(api.find('Item 1').removeClass('a')).toBe(true)
    expect(api.find('Item 1').removeClass(['b', 'd'])).toBe(true)
    expect(api.find('Item 1').result.className).toBe('c')
    
    api.findAll(/Item (1|2|3)$/).addClass('ddd')

    expect(api.findAll({ className: /ddd/ })).toHaveLength(3)

    expect(api.findAll(/Item (1|2|3|4)$/).hasClass(['ddd'])).toBe(false)
    expect(api.findAll(/Item (1|2|3)$/).hasClass(['ddd'])).toBe(true)
  })

  it('Insertion', async () => {
    expect(await api.find('Item 4').append('Item 4.2')).toBeInstanceOf(EyzyNodeAPI)
    expect(await api.find('Item 4').prepend('Item 4.1')).toBeInstanceOf(EyzyNodeAPI)

    const insertedNodes = api.find('Item 4').result.child.map((node: TreeNode) => node.text)

    expect(insertedNodes).toEqual(['Item 4.1', 'Item 4.2'])

    await api.find('Item 4.1').before({ text: 'Item 4.0', disabled: true })

    const node = await api.find('Item 4.1').after('Item 4.2')
    
    expect(api.find('Item 4').result.child).toHaveLength(4)
    node.remove()
    expect(api.find('Item 4').result.child).toHaveLength(3)
  })
})