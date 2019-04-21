import { TreeNode } from '../types/Node'
import { isString, isRegExp, isFunction, get, isExpandable, isCheckable, isEmpty, toArray } from './index'

type Traveler = (source: TreeNode[], cb: (node: TreeNode) => boolean) => boolean
type Query = (node: TreeNode) => boolean

/**
 * Queries:
 *  - api.find(/item \d{2}/) // it will search by text (using RegExp)
 *  - api.find('item') // the same
 *  - api.find(node => node.disabled) // function 
 * 
 *  - api.find({text: ['Item 1', 'Item 2']}) // KEY OR
 *  - api.find({text: /item/, selected: true}) // AND
 *  - api.find([{text: /item/}, {selected: true}]) // OR
 */

const specials = {
  disabledCheckbox: (node: TreeNode, value: any) => !value === !node.disabledCheckbox,
  disabled: (node: TreeNode, value: any) => !value === !node.disabled,
  expandable: (node: TreeNode, value: any) => value === isExpandable(node),
  expanded: (node: TreeNode, value: any) => {
    if (value) {
      return !!node.expanded
    }

    return isExpandable(node) && !node.expanded
  },
  selected: (node: TreeNode, value: any) => !value === !node.selected,
  checked: (node: TreeNode, value: any) => !value === !node.checked,
  checkable: (node: TreeNode, value: any) => value === isCheckable(node),
  isLeaf: (node: TreeNode, value: any) => value !== isExpandable(node),
  $not: (node: TreeNode, value: any) => {
    const searchQuery: Query[] = toArray(value).map(parseQuery)

    if ('expanded' in value) {
      searchQuery.push(parseQuery({expandable: false}))
    }

    return false === matchQuery(node, searchQuery)
  }
}

function parseQuery(query: any): Query {
  if (isFunction(query)) {
    return query
  }

  if (isString(query) ) {
    return (node: TreeNode): boolean => {
      return testKey(query, node.id) || testKey(query, node.text)
    }
  }

  if (query.id) {
    return (node: TreeNode): boolean => {
      return testKey(query.id, node.id)
    }
  }

  const matches = isRegExp(query)
    ? { text: query }
    : query

  return (node: TreeNode): boolean => {
    const keys: string[] = Object.keys(matches)

    if (!keys.length) {
      return false
    }

    return keys.every((key: string): boolean => {
      if (key in specials) {
        return testSpecial(
          specials[key],
          matches[key],
          node
        )
      }

      return toArray(matches[key])
        .some((value: any) => testKey(value, get(node, key)))
    })
  }
}

function testSpecial(s: (node: TreeNode, value: any) => boolean, value: any, node: TreeNode): boolean {
  return true === s(node, value)
}

function testKey(v0: any, v1: any): boolean {
  if (isRegExp(v0)) {
    return new RegExp(v0).test(v1)
  }

  return v0 === v1
}

function matchQuery(node: TreeNode, query: Query[]): boolean {
  return query.some(query => true === query(node))
}

export function find(source: TreeNode[], traveler: Traveler, multiple: boolean, query: any[]): any {
  if (isEmpty(query)) {
    return null
  }

  const result: TreeNode[] = []

  const searchQuery: Query[] = toArray(query).map(parseQuery)
  const seeker = (node: TreeNode): boolean => {
    if (matchQuery(node, searchQuery)) {
      result.push(node)
      return multiple
    }

    return true
  }

  traveler(source, seeker)

  if (!result.length) {
    return multiple ? [] : null
  }

  return multiple ? result : result[0]
}