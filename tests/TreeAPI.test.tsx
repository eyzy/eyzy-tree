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
  multiple={true}
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
    
    expect(updatedNode1.data).toBe(myData)
    expect(updatedNode2.data.prop4).toBe(myDataItem)
    expect(api.data(/Ninja/, 'prop4')).toBe(myDataItem)
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

  it('Insertion: append', async () => {

    {
      // null
      const newNode = await api.append('lalalal', 'Item 0')
      expect(newNode).toBe(null)
    }

    {
      // result is ALWAYS an array
      const [newNode] = await api.append('Classes', 'Item 1')
      const parent = newNode.parent

      expect(parent).toHaveProperty('text', 'Classes')
      expect(newNode.depth).toBe(parent.depth + 1)
      expect(parent.child).toHaveLength(3)
      expect(parent.child[2]).toHaveProperty('text', 'Item 1')
    }

    {
      // multiple insertion
      const newNodes = await api.append('Classes', ['Item 2', 'Item 3'])
      const parent = newNodes[0].parent
  
      expect(parent.child).toHaveLength(5)
      expect(newNodes).toHaveLength(2)
      expect(newNodes[0].parent).toHaveProperty('text', 'Classes')
      expect(parent.child[0]).toHaveProperty('text', 'Class basic syntax')
      expect(parent.child[4]).toHaveProperty('text', 'Item 3')
    }

    // Как вставить в самое начало?? Без поиска
  })

  it('Removing', () => {

  })

  it('uncheck/unselect ALL nodes', () => {

  })
})