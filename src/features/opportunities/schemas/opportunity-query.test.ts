import { describe, expect, it } from 'vitest'

import {
  opportunityListQuerySchema,
  opportunitySearchSchema,
} from './opportunity-query'

describe('opportunitySearchSchema', () => {
  it('applies the default list state', () => {
    expect(opportunitySearchSchema.parse({})).toEqual({
      status: 'LIVE',
      sort: 'apr',
      order: 'desc',
      page: 0,
    })
  })

  it('normalizes valid URL search values', () => {
    expect(
      opportunitySearchSchema.parse({
        search: '  usdc  ',
        chainId: '1',
        protocol: '  aave  ',
        action: 'LEND',
        status: 'SOON',
        minimumTvl: '100000.5',
        sort: 'tvl',
        order: 'asc',
        page: '2',
      }),
    ).toEqual({
      search: 'usdc',
      chainId: 1,
      protocol: 'aave',
      action: 'LEND',
      status: 'SOON',
      minimumTvl: 100_000.5,
      sort: 'tvl',
      order: 'asc',
      page: 2,
    })
  })

  it('falls back field by field for invalid browser search values', () => {
    expect(
      opportunitySearchSchema.parse({
        search: 'usdc',
        action: 'INVALID',
        status: 'UNKNOWN',
        page: '-1',
      }),
    ).toEqual({
      search: 'usdc',
      status: 'LIVE',
      sort: 'apr',
      order: 'desc',
      page: 0,
    })
  })
})

describe('opportunityListQuerySchema', () => {
  it('keeps the HTTP and server-function boundary strict', () => {
    expect(
      opportunityListQuerySchema.safeParse({ action: 'INVALID' }).success,
    ).toBe(false)
  })
})
