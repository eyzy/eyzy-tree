import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import EyzyTree from '../../src/components/Tree'
import EyzyTreeAPI from '../../src/api/EyzyTreeAPI'
import EyzyNodeAPI from '../../src/api/EyzyNodeAPI'
import Adapter from 'enzyme-adapter-react-16'

Enzyme.configure({ adapter: new Adapter() })

const data = [
  {
    text: 'For Remove', child: [
      'For Remove 1', 'For remove 2', 'For remove 3th'
    ]
  },
  {
    text: 'For Empty', child: [
      { text: 'For Empty 1', child: ['a', 'b', 'c'] },
      { text: 'For Empty 2', child: ['a', 'b', 'c'] },
      { text: 'For Empty C', child: ['a', 'b', 'c'] }
    ]
  },
  {
    text: 'JavaScript Fundamentals', expanded: true, child: [
      'Hello, world!', 
      { text: 'Code structure', checked: true }, 
      { text: 'The modern mode, "use strict"', checked: true }, 
      'Variables',
    ],
    data: {
      prop1: 'value1',
      prop2: 'value2'
    }
  },
  {
    text: 'Code quality', child: [
      'Debugging in Chrome', 
      'Polyfills', 
      { text: 'Automated testing with mocha', selected: true },
      { text: 'Ninja code', checked: true, disabled: true }
    ]
  },
  {
    text: 'Objects: the basics', child: [
      'Objects', 'Garbage collection', 'Symbol type', 'Object methods, "this"'
    ]
  },
  {
    text: 'Data types', child: [
      'Methods of primitives', 'Numbers', 'Strings', { text: 'Arrays', selected: true }, 'JSON methods, toJSON'
    ]
  },
  {
    text: 'Classes', checked: true, child: [
      'Class basic syntax', 'Class inheritance'
    ]
  },
  'Insertion'
]

const data2 = JSON.stringify(data)

let api: any = null
let mApi: any = null

shallow(<EyzyTree 
  data={data}
  checkable
  expandOnSelect
  onReady={(treeApi) => api = new EyzyTreeAPI(treeApi)}
/>)

shallow(<EyzyTree 
  data={JSON.parse(data2)}
  checkable
  multiple
  onReady={(treeApi) => mApi = new EyzyTreeAPI(treeApi)}
/>)

describe('EyzyTreeAPI', () => {
  it('Find', () => {
    const findResult = api.find(/Ninja/)
    const notFound = api.find('lalalal')

    expect(findResult).toBeInstanceOf(EyzyNodeAPI)
    expect(findResult.result).not.toBeNull()
    expect(findResult.result).toHaveProperty('text', 'Ninja code')
    expect(findResult).toHaveLength(1)

    expect(notFound).toBeInstanceOf(EyzyNodeAPI)
    expect(notFound.result).toBeNull()
    expect(notFound).toHaveLength(0)
  })

  it('FindAll', () => {
    const findResult = api.findAll(/object/i)
    const notFound = api.findAll('lalalal')

    expect(findResult).toBeInstanceOf(EyzyNodeAPI)
    expect(findResult.result).not.toBeNull()
    expect(findResult).toHaveLength(3)

    expect(notFound).toBeInstanceOf(EyzyNodeAPI)

    expect(notFound.result).toEqual([])
    expect(notFound).toHaveLength(0)
  })

  it('Remove', () => {
    expect(api.remove(/for remove \dth/)).toBe(false) // case sensitive
    expect(api.remove(/for remove \dth/i)).toBe(true)
    expect(api.find('For Remove').result.child).toHaveLength(2)

    expect(api.remove(/for remove \d/i, true)).toBe(true) // multiple
    expect(api.find('For Remove').result.child).toHaveLength(0)
    expect(api.remove(/for remove/i)).toBe(true)
  })

  it('Empty', () => {
    expect(api.empty(/lalalla/)).toBe(false)
    expect(api.find('For Empty 1').result.child).toHaveLength(3)
    expect(api.find('For Empty 2').result.child).toHaveLength(3)
    expect(api.empty(/for empty \d/i, true)).toBe(true)
    expect(api.find('For Empty 1').result.child).toHaveLength(0)
    expect(api.find('For Empty 2').result.child).toHaveLength(0)
    expect(api.empty(/for empty/i)).toBe(true)
    expect(api.remove(/for empty/i)).toBe(true)
  })

  it('Selected', () => {
    const selected = api.selected()
    const mSelected = mApi.selected()

    expect(selected).toBeInstanceOf(EyzyNodeAPI)
    expect(selected.result.text).toBe('Automated testing with mocha')

    expect(mSelected).toBeInstanceOf(EyzyNodeAPI)
    expect(mSelected).toHaveLength(2)
    expect(mSelected.result[1]).toHaveProperty('text', 'Arrays')
  })

  it('Selecting', () => {
    expect(api.findAll({ selected: true})).toHaveLength(2)
    expect(api.select('lalalala')).toBe(false)
    expect(api.select('Classes', false, false)).toBe(true)

    let selected = api.findAll({ selected: true})

    expect(selected).toHaveLength(1)
    expect(api._tree.selected[0]).toBe(selected.result[0].id)

    // it is impossible to extend selection in single mode
    expect(api.select(/^Class (basic|inheritance)/, true)).toBe(true)

    selected = api.findAll({ selected: true})

    expect(selected).toHaveLength(1)
    expect(api._tree.selected[0]).toBe(selected.result[0].id)
    
    api.unselectAll()
    expect(api.findAll({ selected: true})).toHaveLength(0)
    expect(api._tree.selected).toEqual([])
  })

  it('Multiple Selecting', () => {
    expect(mApi.select(/^Class inheritance/)).toBe(true)
    expect(mApi.findAll({ selected: true})).toHaveLength(1)
    expect(mApi.select('Class basic syntax', true)).toBe(true)
    expect(mApi.select('lalalal', true)).toBe(false)

    let selected = mApi.findAll({ selected: true})

    expect(selected).toHaveLength(2)
    expect(mApi._tree.selected).toContain(selected.result[0].id)
    expect(mApi._tree.selected).toContain(selected.result[1].id)

    expect(mApi.unselect()).toBe(false)
    expect(mApi.unselect('lalalala')).toBe(false)
    expect(mApi.findAll({ selected: true})).toHaveLength(2)
    expect(mApi.unselect(/^Class inheritance/)).toBe(true)
    expect(mApi.findAll({ selected: true})).toHaveLength(1)

    mApi.unselectAll()
    expect(mApi.findAll({ selected: true})).toHaveLength(0)
    expect(mApi._tree.selected).toEqual([])
  })

  it('Checked', () => {
    const checked = api.checked()

    expect(checked).toBeInstanceOf(EyzyNodeAPI)
    expect(checked).toHaveLength(5)
  })

  it('Check', () => {
    api.uncheckAll()

    expect(api.check('lalalal')).toBe(false)

    expect(api.check('JSON methods, toJSON')).toBe(true)
    expect(api.check('JSON methods, toJSON')).toBe(false)

    expect(api.findAll({ checked: true })).toHaveLength(1)

    api.uncheckAll()

    expect(api.check(/Class/)).toBe(true)

    // cascade checking
    expect(api.findAll({ checked: true })).toHaveLength(3)

    expect(api.check({ text: /Object/, isLeaf: true}, true)).toBe(true)
    expect(api.findAll({ checked: true })).toHaveLength(5)

    // disabled node
    expect(api.check('Ninja code')).toBe(true)
  })

  it('Disable/Enable', () => {
    expect(api.findAll({ disabled: true })).toHaveLength(1)
    expect(api.disable('lalalal')).toBe(false)
    expect(api.disable({ disabled: true })).toBe(false)
    expect(api.disable('Automated testing with mocha')).toBe(true)

    expect(api.disable(/Objects/, true)).toBe(true)
    expect(api.findAll({ disabled: true })).toHaveLength(4)

    expect(api.enable('lalalal')).toBe(false)
    expect(api.enable('Automated testing with mocha')).toBe(true)
    expect(api.enable({ disabled: true }, true)).toBe(true)
    expect(api.findAll({ disabled: true })).toHaveLength(0)
  })

  it('Disable/Enable Checkbox', () => {
    expect(api.findAll({ disabledCheckbox: true })).toHaveLength(0)
    expect(api.disableCheckbox('lalalal')).toBe(false)
    expect(api.disableCheckbox('Automated testing with mocha')).toBe(true)
    expect(api.disableCheckbox({ disabledCheckbox: true })).toBe(false)

    expect(api.disableCheckbox(/Objects/, true)).toBe(true)
    expect(api.findAll({ disabledCheckbox: true })).toHaveLength(3)

    expect(api.enableCheckbox('lalalal')).toBe(false)
    expect(api.enableCheckbox('Automated testing with mocha')).toBe(true)
    expect(api.findAll({ disabledCheckbox: true })).toHaveLength(2)
    expect(api.enableCheckbox({ disabledCheckbox: true }, true)).toBe(true)
    expect(api.findAll({ disabledCheckbox: true })).toHaveLength(0)
  })

  it('Expand/Collapse', () => {
    expect(api.expand('lalalal')).toBe(false)
    expect(api.expand('JavaScript Fundamentals')).toBe(false)
    expect(api.expand('Classes')).toBe(true)
    expect(api.find('Classes').result.expanded).toBe(true)

    expect(api.expand(['Objects: the basics', 'Data types'], true)).toBe(true)
    expect(api.findAll({ expanded: true })).toHaveLength(4)

    expect(api.collapse('Classes')).toBe(true)

    // expand on select
    expect(api.select('Code quality')).toBe(true)
    expect(api.find('Code quality').result.expanded).toBe(true)

    expect(api.select('Classes', false, false)).toBe(true)
    expect(api.find('Classes').result.expanded).toBeFalsy()
    

    expect(api.collapse('Objects')).toBe(false)

    expect(api.collapse('JavaScript Fundamentals')).toBe(true)
    expect(api.collapse('Code quality')).toBe(true)
    expect(api.findAll({ expanded: true })).toHaveLength(2)
    
    expect(api.collapse(['Objects: the basics', 'Data types'], true)).toBe(true)
    expect(api.findAll({ expanded: true })).toHaveLength(0)
  })

  it('Data', () => {
    expect(api.data('JavaScript Fundamentals')).toEqual({ prop1: 'value1', prop2: 'value2' })
    expect(api.data('JavaScript Fundamentals', 'prop1')).toBe('value1')

    const set = api.data('JavaScript Fundamentals', 'prop3', 'value3') 

    expect(set).toBeInstanceOf(EyzyNodeAPI)
    expect(set.result).toHaveProperty('text', 'JavaScript Fundamentals')

    const set2 = api.data('JavaScript Fundamentals', { prop4: 'value4' })
    expect(set2).toBeInstanceOf(EyzyNodeAPI)
    expect(set2.result).toHaveProperty('text', 'JavaScript Fundamentals')
    expect(set2.result.data).toEqual({
      prop1: 'value1',
      prop2: 'value2',
      prop3: 'value3',
      prop4: 'value4'
    })
  })

  it('Add/remove/has classNames', () => {
    expect(api.hasClass('Classes')).toBe(false)
    expect(api.hasClass('Classes', null)).toBe(false)
    expect(api.hasClass('Classes', 'a')).toBe(false)
    expect(api.hasClass('Classessese')).toBe(false)

    expect(api.addClass('Classes', ['a', 'b', 'c'])).toBe(true)
    expect(api.addClass('Classes', 'd')).toBe(true)

    expect(api.addClass('Classessese', ['a', 'b', 'c'])).toBe(false)

    expect(api.hasClass('Classes', 'a')).toBe(true)
    expect(api.hasClass('Classes', 'd')).toBe(true)
    expect(api.hasClass('Classes', 'b c')).toBe(true)
    expect(api.hasClass('Classes', 'ac')).toBe(false)
    expect(api.find('Classes').result.className).toBe('a b c d')

    expect(api.removeClass('Classessese', 'a')).toBe(false)
    expect(api.removeClass('Classes', 'aaaa')).toBe(false)
    expect(api.removeClass('Classes', ['b', 'd'])).toBe(true)
    expect(api.find('Classes').result.className).toBe('a c')
  })

  describe('Insertion', () => {
    describe('Append', () => {
      it('node doen not found', async () => {
        const newNode = await api.append('lalalal', 'Item 0')
        expect(newNode).toBeInstanceOf(EyzyNodeAPI)
        expect(newNode.result).toBeNull()
      })

      it('simple obj', async () => {
        const insertedNode = await api.append('Insertion', { text: 'Insertion 3', checked: true })
        const newNode = insertedNode.result[0]
        const parent = newNode.parent

        expect(parent).toHaveProperty('text', 'Insertion')
        expect(parent.expanded).toBeFalsy()
        expect(newNode.depth).toBe(parent.depth + 1)
        expect(newNode.checked).toBe(true)
        expect(parent.child).toHaveLength(1)
        expect(parent.child[0]).toHaveProperty('text', 'Insertion 3')
      })

      it('multiple obj', async () => {
        // multiple insertion
        const insertedNodes = await api.append('Insertion', ['Insertion 4', 'Insertion 5'])
        const nodes = insertedNodes.result
        const parent = nodes[0].parent
    
        expect(parent.child).toHaveLength(3)
        expect(insertedNodes).toHaveLength(2)
        expect(parent).toHaveProperty('text', 'Insertion')
        expect(parent.child[0]).toHaveProperty('text', 'Insertion 3')
        expect(parent.child[2]).toHaveProperty('text', 'Insertion 5')
      })

      it('opts', async () => {
        const insertedNodes = await api.append('Insertion', { text: 'Insertion 6', checked: true }, { expand: true })
        const nodes = insertedNodes.result
        const parent = nodes[0].parent

        expect(parent).toHaveProperty('text', 'Insertion')
        expect(parent.expanded).toBe(true)

        expect(parent.child).toHaveLength(4)
        expect(parent.child[3].text).toBe('Insertion 6')

        expect(api._tree.checked).toContain(nodes[0].id)
      })

      it('function test', async () => {
        const insertedNodes = await api.append('Insertion', () => {
          return Promise.resolve([{ text: 'Insertion 7', disabled: true }])
        })

        const nodes = insertedNodes.result
        const parent = nodes[0].parent

        expect(parent).toHaveProperty('text', 'Insertion')
        expect(parent.child).toHaveLength(5)
        expect(parent.child[4].disabled).toBe(true)
      })

      it('promise test', async () => {
        const insertedNodes = await api.append('Insertion', Promise.resolve([{ text: 'Insertion 8' }]))
        const nodes = insertedNodes.result
        const parent = nodes[0].parent

        expect(parent).toHaveProperty('text', 'Insertion')
        expect(parent.child).toHaveLength(6)
        expect(parent.child[5].text).toBe('Insertion 8')
      })
    })

    describe('Prepend', () => {
      it('order test', async () => {
        const insertedNode = await api.prepend('Insertion', { text: 'Insertion 2', checked: true })
        const newNode = insertedNode.result[0]
        const parent = newNode.parent

        expect(parent).toHaveProperty('text', 'Insertion')
        expect(parent.child).toHaveLength(7)
        expect(parent.child[0].text).toBe('Insertion 2')
      })

      it('tree selected property', async () => {
        const insertedNode = await api.prepend('Insertion', { text: 'Insertion 1', selected: true })
        const newNode = insertedNode.result[0]
        const parent = newNode.parent

        expect(parent).toHaveProperty('text', 'Insertion')
        expect(parent.child).toHaveLength(8)
        expect(parent.child[0].text).toBe('Insertion 1')

        expect(api._tree.selected[0]).toBe(newNode.id)
      })
    })

    describe('Before', () => {
      it('n position', async () => {
        const insertedNode = await api.before('Insertion 2', { text: 'Insertion 2.2', selected: true })
        const newNode = insertedNode.result[0]
        const parent = newNode.parent
  
        expect(parent).toHaveProperty('text', 'Insertion')
        expect(parent.child).toHaveLength(9)
        expect(parent.child[1].text).toBe('Insertion 2.2')
      })

      it('first position', async () => {
        const insertedNode = await api.before('Insertion 1', { text: 'Insertion 1.0', selected: true })
        const newNode = insertedNode.result[0]
        const parent = newNode.parent
  
        expect(parent).toHaveProperty('text', 'Insertion')
        expect(parent.child).toHaveLength(10)
        expect(parent.child[0].text).toBe('Insertion 1.0')
      })
    })
    
    describe('After', () => {
      it('n position', async () => {
        const insertedNode = await api.after('Insertion 8', { text: 'Insertion 8.0', selected: true })
        const newNode = insertedNode.result[0]
        const parent = newNode.parent
  
        expect(parent).toHaveProperty('text', 'Insertion')
        expect(parent.child).toHaveLength(11)
        expect(parent.child[10].text).toBe('Insertion 8.0')
      })

      it('indeterminate parent', async () => {
        expect(api.find('Insertion').indeterminate).toBeFalsy()
        const insertedNode = await api.after('Insertion 8.0', { text: 'Insertion 8.1', checked: true })
        const newNode = insertedNode.result[0]
        const parentNode = newNode.parent

        expect(parentNode.text).toBe('Insertion')
        expect(parentNode.child[11].text).toBe('Insertion 8.1')

        // TODO: works in a browser...
        // expect(parentNode.indeterminate).toBe(true)
      })
    })
  })
})