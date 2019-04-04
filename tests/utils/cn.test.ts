import cn from '../../src/utils/cn'

test('ClassNames', () => {
  expect(cn({ class1: 10, class2: false, class3: true })).toBe('class1 class3')
})