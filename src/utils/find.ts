import { TreeNode } from '../types/Node'
import { isArray, isString, isRegExp, isFunction, get, isExpandable, isCheckable } from './index'

type Traveler = (source: TreeNode[], cb: (node: TreeNode) => boolean) => boolean
type Criteria = (node: TreeNode) => boolean

/**
 * Criterias:
 *  - api.find(/item \d{2}/) // it will search by text (using RegExp)
 *  - api.find('item') // the same
 *  - api.find(node => node.disabled) // function 
 * 
 *  - api.find({text: /item/, selected: true}) // AND
 *  - api.find({text: 'item 1'}, {text: 'item 2'}, {disabled: true}) // OR
 *  - api.find([{text: /item/}, {selected: true}]) // OR
 */

const specials = {
  disabledCheckbox: (node: TreeNode, value: any) => value === !!node.disabledCheckbox,
  disabled: (node: TreeNode, value: any) => value === !!node.disabled,
  expandable: (node: TreeNode, value: any) => value === isExpandable(node),
  expanded: (node: TreeNode, value: any) => {
    if (value) {
      return !!node.expanded
    }

    return isExpandable(node) && !node.expanded
  },
  checkable: (node: TreeNode, value: any) => value === isCheckable(node),
  isLeaf: (node: TreeNode, value: any) => value !== isExpandable(node),
  $not: (node: TreeNode, value: any) => {
    const searchCriterias: Criteria[] = convertCriterias(value).map(parseCriteria)
    const result: boolean = false === matchCriterias(node, searchCriterias)
    return result
  }
}

function convertCriterias(criteria: any) {
  return isArray(criteria) ? criteria : [criteria]
}

function parseCriteria(criteria: any): Criteria {
  if (isFunction(criteria)) {
    return criteria
  }

  if (isString(criteria) ) {
    return (node: TreeNode): boolean => {
      return testKey(criteria, node.id) || testKey(criteria, node.text)
    }
  }

  const matches = isRegExp(criteria)
    ? { text: criteria }
    : criteria

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

      return testKey(matches[key], get(node, key))
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

function matchCriterias(node: TreeNode, criterias: Criteria[]): boolean {
  return criterias.some(criteria => true === criteria(node))
}

export function find(source: TreeNode[], traveler: Traveler, multiple: boolean, criterias: any[]): any {
  if (!criterias.length || !criterias[0]) {
    return null
  }

  const result: TreeNode[] = []

  const searchCriterias: Criteria[] = criterias.map(parseCriteria)
  const seeker = (node: TreeNode): boolean => {
    if (matchCriterias(node, searchCriterias)) {
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