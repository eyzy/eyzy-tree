import { Node } from '../types/Node'
import { isString, isRegExp, isFunction } from './index'

type Traveler = (source: Node[], cb: (node: Node) => boolean) => boolean
type Criteria = (node: Node) => boolean

function parseCriteria(criteria: any): Criteria {
  if (isFunction(criteria)) {
    return criteria
  }

  const matches = isString(criteria) || isRegExp(criteria)
    ? { text: criteria }
    : criteria 

  return (node: Node): boolean => {
    const keys: string[] = Object.keys(matches)

    return keys.every((key: string): boolean => {
      return testKey(matches[key], node[key], node)
    })
  }
}

function testKey(v0: any, v1: any, node: Node): boolean {
  if (isRegExp(v0)) {
    return new RegExp(v0).test(v1)
  }

  return v0 === v1
}

function matchCriterias(node: Node, criterias: Criteria[]): boolean {
  return criterias.some(criteria => true === criteria(node))
}

export function find(source: Node[], traveler: Traveler, multiple: boolean, criterias: any[]): any {
  let result: Node[] = []

  const searchCriterias: Criteria[] = criterias.map(parseCriteria)
  const seeker = (node: Node): boolean => {
    if (matchCriterias(node, searchCriterias)) {
      result.push(node)
      return multiple
    }

    return true
  }

  traveler(source, seeker)

  if (!result.length) {
    return null
  }

  return multiple ? result : result[0]
}