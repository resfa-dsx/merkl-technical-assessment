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
})
