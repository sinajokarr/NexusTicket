import { describe, expect, it } from 'vitest'
import { products } from '../data/catalog'
import { cartLineKey, filterProducts, mergeCartLine, updateCartLine } from './commerce'

describe('commerce catalogue', () => {
  it('filters and sorts products predictably', () => {
    const running = filterProducts(products, { category: 'running', sort: 'low' })
    expect(running.length).toBeGreaterThan(2)
    expect(running.every(product => product.category === 'running')).toBe(true)
    expect(running[0].price).toBeLessThanOrEqual(running[1].price)
    expect(filterProducts(products, { query: 'massager' })[0].slug).toBe('arc-recovery-massage-gun')
  })
})

describe('cart lines', () => {
  it('merges matching variants and protects stock limits', () => {
    const product = { ...products[0], stock: 2 }
    const first = mergeCartLine([], product, '9', '#111417')
    const second = mergeCartLine(first, product, '9', '#111417')
    const capped = mergeCartLine(second, product, '9', '#111417')
    expect(capped).toHaveLength(1)
    expect(capped[0].quantity).toBe(2)
    expect(updateCartLine(capped, cartLineKey(capped[0]), 0)).toEqual([])
  })
})
