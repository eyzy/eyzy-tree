import cn from '../../src/utils/cn'

describe('ClassNames', () => {
  it('Possible veriants', () => {
    expect(cn({ 
      class1: 10, 
      class2: false, 
      class3: true })).toBe('class1 class3')

    expect(cn(['a', 'b', 'c'])).toBe('a b c')
  })
})