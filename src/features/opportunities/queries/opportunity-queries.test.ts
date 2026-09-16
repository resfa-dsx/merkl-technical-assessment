import { describe, expect, it } from 'vitest'

import { opportunityKeys } from './opportunity-queries'

describe('opportunityKeys', () => {
  it('removes undefined values from list keys', () => {
    expect(
      opportunityKeys.list({
        search: undefined,
        chainId: undefined,
        protocol: undefined,
        action: undefined,
        status: 'LIVE',
        minimumTvl: undefined,
        sort: 'apr',
        order: 'desc',
        page: 0,
      }),
    ).toEqual([
      'opportunities',
      'list',
      { status: 'LIVE', sort: 'apr', order: 'desc', page: 0 },
    ])
  })

  it('keys detail data by opportunity ID', () => {
    expect(opportunityKeys.detail('11521673201667687989')).toEqual([
      'opportunities',
      'detail',
      '11521673201667687989',
    ])
  })
})
