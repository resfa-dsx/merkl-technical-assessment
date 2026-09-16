import { afterEach, describe, expect, it, vi } from 'vitest'

import type { OpportunityListQuery } from '#/features/opportunities/types/opportunity'

import { fetchOpportunityDetail, fetchOpportunityList } from './merkl-client'

const defaultQuery: OpportunityListQuery = {
  search: 'usdc',
  chainId: 1,
  protocol: 'aave',
  action: 'LEND',
  status: 'LIVE',
  minimumTvl: 100_000,
  sort: 'apr',
  order: 'desc',
  page: 2,
}

const opportunityPayload = {
  id: '11521673201667687989',
  name: 'USDC lending market',
  description: 'Lend USDC and earn incentives.',
  status: 'LIVE',
  action: 'LEND',
  apr: 4.75,
  tvl: 629_100_000,
  dailyRewards: 69_400,
  liveCampaigns: 1,
  chain: { id: 1, name: 'Ethereum', icon: '' },
  protocol: null,
  tokens: [{ symbol: 'USDC', icon: '' }],
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('fetchOpportunityList', () => {
  it('forwards normalized filters without requesting campaigns', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json([opportunityPayload]),
    )
    const timeoutSpy = vi.spyOn(AbortSignal, 'timeout')
    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchOpportunityList(defaultQuery)
    const [request] = fetchMock.mock.calls[0]
    const url = new URL(String(request))

    expect(Object.fromEntries(url.searchParams)).toEqual({
      items: '20',
      page: '2',
      status: 'LIVE',
      sort: 'apr',
      order: 'desc',
      search: 'usdc',
      chainId: '1',
      mainProtocolId: 'aave',
      action: 'LEND',
      minimumTvl: '100000',
    })
    expect(url.searchParams.has('campaigns')).toBe(false)
    expect(timeoutSpy).toHaveBeenCalledWith(8_000)
    expect(result.items).toHaveLength(1)
  })

  it('rejects malformed successful responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(Response.json({ items: [] })),
    )

    await expect(fetchOpportunityList(defaultQuery)).rejects.toMatchObject({
      code: 'INVALID_RESPONSE',
    })
  })

  it('classifies timeout failures', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockRejectedValue(new DOMException('Timed out', 'TimeoutError')),
    )

    await expect(fetchOpportunityList(defaultQuery)).rejects.toMatchObject({
      code: 'UPSTREAM_TIMEOUT',
    })
  })

  it('classifies non-success responses as unavailable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(null, { status: 503 }),
      ),
    )

    await expect(fetchOpportunityList(defaultQuery)).rejects.toMatchObject({
      code: 'UPSTREAM_UNAVAILABLE',
      upstreamStatus: 503,
    })
  })
})

describe('fetchOpportunityDetail', () => {
  it('fetches and maps the opportunity campaign resource', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        ...opportunityPayload,
        howToSteps: [],
        campaigns: [],
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchOpportunityDetail('11521673201667687989')
    const [request] = fetchMock.mock.calls[0]

    expect(new URL(String(request)).pathname).toBe(
      '/v4/opportunities/11521673201667687989/campaigns',
    )
    expect(result).toMatchObject({
      id: '11521673201667687989',
      campaigns: [],
    })
  })

  it('maps a genuine upstream not-found response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 404 })),
    )

    await expect(fetchOpportunityDetail('missing')).rejects.toMatchObject({
      code: 'NOT_FOUND',
      upstreamStatus: 404,
    })
  })
})
