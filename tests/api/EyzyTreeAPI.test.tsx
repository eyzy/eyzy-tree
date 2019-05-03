import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import EyzyTree from '../../src/components/Tree'
import EyzyTreeAPI from '../../src/api/EyzyTreeAPI'
import EyzyNodeAPI from '../../src/api/EyzyNodeAPI'
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

shallow(<EyzyTree 
  data={data}
  checkable
  onReady={(treeApi) => api = new EyzyTreeAPI(treeApi)}
/>)

describe('EyzyTreeAPI', () => {
  it('Find', () => {
    const findResult = api.find(/Ninja/)
    const notFound = api.find('lalalal')

    expect(findResult).toBeInstanceOf(EyzyNodeAPI)
    expect(findResult.result).not.toBeNull()
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
    // TODO
    expect(notFound.result).toBeNull()
    expect(notFound).toHaveLength(0)
  })
})