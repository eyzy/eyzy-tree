import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import EyzyTree from '../src/components/Tree'
import Adapter from 'enzyme-adapter-react-16'

Enzyme.configure({ adapter: new Adapter() })

const data = [
  {
    text: 'JavaScript Fundamentals', child: [
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
  }
]

let api: any = null
let apiMultiple: any = null

shallow(<EyzyTree 
  data={data}
  checkable
  onReady={(treeApi) => api = treeApi}
/>)

shallow(<EyzyTree 
  data={data}
  multiple
  onReady={(treeApi) => apiMultiple = treeApi}
/>)

describe('TreeAPI', () => {
  it('Find', () => {
    const findResult = api.find(/polyfills/i) 
    const findAllResult = api.findAll(/methods/i) 

    expect(findResult.parent).toHaveProperty('text', 'Code quality')
    expect(findAllResult).toHaveLength(3)
    expect(findAllResult[0]).toHaveProperty('text', 'Object methods, "this"')
  })

  it('Get Selected', () => {
    const selected = api.selected()
    const mSelected = apiMultiple.selected()

    expect(selected).toHaveProperty('text', 'Automated testing with mocha')
    expect(mSelected).toHaveLength(2)
    expect(mSelected[1]).toHaveProperty('text', 'Arrays')
  })

  it('Get Checked', () => {
    const branch = api.checked('BRANCH', true)
    const leaf = api.checked('LEAF')

    // indeterminate nodes will be added to the end (!)
    const indeterminate = api.checked('WITH_INDETERMINATE')

    expect(api.checked()).toHaveLength(5)
    expect(api.checked('ALL', true)).toHaveLength(6) // with disabled 

    expect(branch).toHaveLength(4) 
    expect(branch[3]).toHaveProperty('text', 'Classes')

    expect(leaf).toHaveLength(4) 
    expect(leaf[2]).toHaveProperty('text', 'Class basic syntax')
    
    expect(indeterminate).toHaveLength(7) 
    expect(indeterminate[5]).toHaveProperty('text', 'JavaScript Fundamentals')

    expect(api.checked('WITH_INDETERMINATE', true)).toHaveLength(8)
  })

  it('Data', () => {
    const myData = {
      prop3: 'value3'
    }

    const myDataItem = {
      subProp1: 'value 41'
    }

    const updatedNode1 = api.data({ checked: true }, myData)
    const updatedNode2 = api.data({ checked: true, disabled: true }, 'prop4', myDataItem)

    expect(api.data('JavaScript Fundamentals', 'prop1')).toBe('value1')
    expect(api.data('JavaScript Fundamentals', 'prop3')).toBe(undefined)
    
    expect(updatedNode1.data).toEqual(myData)
    expect(updatedNode2.data.prop4).toBe(myDataItem)
    expect(api.data(/Ninja/, 'prop4')).toBe(myDataItem)

    const updatedNode3 = api.data({ checked: true }, myDataItem)

    // merging
    expect(updatedNode3.data).toEqual(Object.assign({}, myData, myDataItem))
  })
  
  it('Add/remove/has classNames', () => {
    const node0 = api.addClass(/Ninja/, ['a', 'b', 'c'])

    expect(api.hasClass('JavaScript Fundamentals', 'clazz')).toBe(false)
    expect(api.hasClass(/Ninja/, 'a')).toBe(true)
    expect(api.hasClass(/Ninja/, 'ac')).toBe(false)
    expect(node0.className).toBe('a b c')
    expect(api.addClass('Automated testing with mocha', 'def')).toHaveProperty('className', 'def')

    expect(api.removeClass(/Ninja/, ['d', 'e', 'c'])).toHaveProperty('className', 'a b')
    expect(api.removeClass(/Ninja/, 'b')).toHaveProperty('className', 'a')
  })

  describe('Insertion', () => {
    describe('Append', () => {
      it('null', async () => {
        const newNode = await api.append('lalalal', 'Item 0')
        expect(newNode).toBe(null)
      })

      it('simple obj', async () => {
        // result is ALWAYS an array
        const [newNode] = await api.append('Classes', { text: 'Item 1' })
        const parent = newNode.parent
        expect(parent).toHaveProperty('text', 'Classes')
        expect(newNode.depth).toBe(parent.depth + 1)
        expect(newNode.checked).toBe(true)
        expect(parent.child).toHaveLength(3)
        expect(parent.child[2]).toHaveProperty('text', 'Item 1')
      })

      it('multiple obj', async () => {
        // multiple insertion
        const newNodes = await api.append('Classes', ['Item 2', 'Item 3'])
        const parent = newNodes[0].parent
    
        expect(parent.child).toHaveLength(5)
        expect(newNodes).toHaveLength(2)
        expect(newNodes[0].parent).toHaveProperty('text', 'Classes')
        expect(parent.child[0]).toHaveProperty('text', 'Class basic syntax')
        expect(parent.child[4]).toHaveProperty('text', 'Item 3')
      })

      it('opts', async () => {
        const [newNode] = await api.append('Classes', { text: 'Item 4', checked: true }, { expand: true })
        const parentNode = newNode.parent

        expect(parentNode).toHaveProperty('text', 'Classes')
        expect(parentNode.expanded).toBe(true)

        expect(parentNode.child).toHaveLength(6)
        expect(parentNode.child[5].text).toBe('Item 4')
        
        expect(api.tree.checked).toContain(newNode.id)
      })

      it('function test', async () => {
        const [newNode] = await api.append('Classes', () => {
          return Promise.resolve([{ text: 'Item 5', disabled: true }])
        })
        const parentNode = newNode.parent

        expect(parentNode).toHaveProperty('text', 'Classes')
        expect(parentNode.child).toHaveLength(7)
        expect(parentNode.child[6].disabled).toBe(true)
      })

      it('promise test', async () => {
        const [newNode] = await api.append('Classes', Promise.resolve([{ text: 'Item 6' }]))
        const parentNode = newNode.parent

        expect(parentNode).toHaveProperty('text', 'Classes')
        expect(parentNode.child).toHaveLength(8)
        expect(parentNode.child[7].text).toBe('Item 6')
      })
    })

    describe('Prepend', () => {
      it('order test', async () => {
        const [newNode] = await api.prepend('Classes', Promise.resolve([{ text: 'Item 7' }]))
        const parentNode = newNode.parent

        expect(parentNode).toHaveProperty('text', 'Classes')
        expect(parentNode.child).toHaveLength(9)
        expect(parentNode.child[0].text).toBe('Item 7')
      })

      it('tree selected property', async () => {
        const [newNode] = await api.prepend('Classes', Promise.resolve([{ text: 'Item 8', selected: true }]))
        const parentNode = newNode.parent

        expect(parentNode).toHaveProperty('text', 'Classes')
        expect(parentNode.child).toHaveLength(10)
        expect(parentNode.child[0].text).toBe('Item 8')
        
        expect(api.tree.selected[0]).toBe(newNode.id)
      })
    })

    describe('Before', () => {
      it('n position', async () => {
        const [newNode] = await api.before('Item 6', Promise.resolve([{ text: 'Item Before 1' }]))
        const parentNode = newNode.parent
  
        expect(parentNode).toHaveProperty('text', 'Classes')
        expect(parentNode.child).toHaveLength(11)
        expect(parentNode.child[9].text).toBe('Item Before 1')
      })

      it('first position', async () => {
        const [newNode] = await api.before('Item 8', Promise.resolve([{ text: 'Item Before 2' }]))
        const parentNode = newNode.parent
  
        expect(parentNode).toHaveProperty('text', 'Classes')
        expect(parentNode.child).toHaveLength(12)
        expect(parentNode.child[0].text).toBe('Item Before 2')
      })
    })

    describe('After', () => {
      it('n position', async () => {
        const [newNode] = await api.after('Item Before 1', Promise.resolve([{ text: 'Item After 1' }]))
        const parentNode = newNode.parent
  
        expect(parentNode).toHaveProperty('text', 'Classes')
        expect(parentNode.child).toHaveLength(13)
        expect(parentNode.child[11].text).toBe('Item After 1')
      })

      it('indeterminate parent', async () => {
        expect(api.find('Data types').indeterminate).toBeFalsy()
        const [newNode] = await api.after('JSON methods, toJSON', { text: 'Child', checked: true })
        expect(newNode.parent.indeterminate).toBe(true)
        expect(newNode.parent.text).toBe('Data types')
      })
    })
  })

  it('uncheck/unselect ALL nodes', () => {
    api.unselectAll()
    expect(api.find({ selected: true })).toBeNull()
    expect(api.findAll({ checked: true }).length).toBeGreaterThan(1)

    api.uncheckAll()

    expect(api.findAll({ checked: true })).toHaveLength(0)

    expect(api.tree.selected).toEqual([])
    expect(api.tree.checked).toEqual([])
    expect(api.tree.indeterminate).toEqual([])
  })
  
  it('Removing', async () => {
    expect(api.find('Data types').child[2].text).toBe('Strings')
    expect(api.remove('Strings')).toBeTruthy()
    expect(api.remove('lalalalbebebebe')).toBeNull()
    expect(api.find('Data types').child[2].text).toBe('Arrays')

    await api.append('Data types', { text: 'Selected Node', selected: true })

    const selected = api.find({ selected: true })

    expect(selected.text).toBe('Selected Node')
    expect(api.tree.selected[0]).toBe(selected.id)

    api.remove('Selected Node')

    expect(api.tree.selected[0]).toBeFalsy()
    expect(api.find({ selected: true })).toBeNull()

    api.uncheckAll()

    await api.append('Data types', [{ text: 'Checked0', checked: true }, { text: 'Checked1', checked: true }])

    let checked = api.findAll({ checked: true })

    expect(checked).toHaveLength(2)
    expect(checked[0].text).toBe('Checked0')
    expect(api.tree.checked).toHaveLength(2)

    api.remove({ checked: true })

    checked = api.findAll({ checked: true })

    expect(checked).toHaveLength(1)
    expect(checked[0].text).toBe('Checked1')
    expect(api.tree.checked).toHaveLength(1)
  })
})