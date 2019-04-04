import { parseNode } from '../../src/utils/parser'
import { TreeNode } from '../../src/types/Node'

describe('Parser', () => {
  it('Single string', () => {
    const parent = {}
    const node0 = parseNode('Node 0', parent as TreeNode)

    expect(node0).toHaveLength(1)
    expect(node0[0].text).toBe('Node 0')
    expect(node0[0].parent).toBe(parent)
    expect(node0[0].child).toEqual([])
    expect(node0[0]).toHaveProperty('id')
    expect(node0[0]).toHaveProperty('child')
    expect(node0[0]).toHaveProperty('data')
  })
  
  it('Array of strings', () => {
    const parent = {}
    const node0 = parseNode(['Node 0', 'Node 1'], parent as TreeNode)

    expect(node0).toHaveLength(2)
    expect(node0[1].text).toBe('Node 1')
    expect(node0[1].parent).toBe(parent)
    expect(node0[1].child).toEqual([])
    expect(node0[1]).toHaveProperty('id')
    expect(node0[1]).toHaveProperty('child')
    expect(node0[1]).toHaveProperty('data')
  })

  it('As object', () => {
    const nodeData = {
      a: 10, b: [1, 2, 3], c: undefined
    }

    const node = {
      text: 'Node 1',
      data: nodeData,
      id: 7,
      child: [
        'A', 'B', function() {}, 'C'
      ]
    }

    const node0 = parseNode(node)
    const { id, text, child, data, parent } = node0[0]

    expect(id).toBe(7)
    expect(text).toBe('Node 1')
    expect(child).toHaveLength(3)
    expect(data).toBe(nodeData)
    expect(parent).toBe(null)
    
    expect(child.map((node) => node.text).join(', ')).toBe('A, B, C')
    expect(child[0].parent).toBe(node0[0])
  })

  it('Mixed nodes', () => {
    const nodes = [
      'As Text', 
      { text: 'As Object', selected: true, data: { a : 1 } },
      [
        'As Array 1', 
        {
          text: 'As Array 2', 
          customProperty: [1]
        }
      ],
      [
        { text: 'Has Child', expanded: true, child: [1, 2, 'child 1', 3, 4, 'child 2', '3'] } /* number must be ignored */
      ],
      { /* node without text will be ignored */ }
    ]

    const treeNodes = parseNode(nodes)
    const [ node0, node1, node2, node3, node4 ] = treeNodes

    expect(treeNodes).toHaveLength(5)

    expect(node0.text).toBe('As Text')
    expect(node0.id).toBeDefined()
    expect(node0.child).toBeDefined()
    expect(node0.data).toBeDefined()
    expect(node0.parent).toBeDefined()

    expect(node1.selected).toBe(true)
    expect(node1.data).toEqual({a: 1})

    expect(node2.text).toBe('As Array 1')

    expect(node3.text).toBe('As Array 2')
    expect(node3['customProperty']).toEqual([1])

    expect(node4.text).toBe('Has Child')
    expect(node4.expanded).toBe(true)
    expect(node4.child).toHaveLength(3)
    expect(node4.child[1].parent).toBe(node4)
    expect(node4.child[2].text).toBe('3')
  })
})