import { describe, expect, it } from 'vitest'

import { formatPercentage, formatUsd } from './formatters'

describe('opportunity formatters', () => {
  it('avoids false APR precision', () => {
    expect(formatPercentage(4.749999999999999)).toBe('4.75%')
  })

  it('formats large USD values compactly', () => {
    expect(formatUsd(629_100_000)).toBe('$629.1M')
    expect(formatUsd(69_400)).toBe('$69.4K')
  })
})
