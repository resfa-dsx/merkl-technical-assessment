import { describe, expect, it, vi } from 'vitest'

import type {
  OpportunityDetail,
  OpportunityListQuery,
  OpportunityListResponse,
} from '#/features/opportunities/types/opportunity'

import { MerklClientError } from '../merkl/merkl-errors'
import { getOpportunities, getOpportunity } from './opportunity-api'

const listResponse: OpportunityListResponse = {
  items: [],
  page: 0,
  pageSize: 20,
  hasNextPage: false,
}

const detailResponse: OpportunityDetail = {
  id: '11521673201667687989',
  name: 'USDC lending market',
  description: 'Lend USDC and earn incentives.',
  status: 'LIVE',
  action: 'LEND',
  apr: 4.75,
  nativeApr: null,
  tvlUsd: 629_100_000,
  dailyRewardsUsd: 69_400,
  liveCampaigns: 0,
  chain: { id: '1', name: 'Ethereum', iconUrl: null },
  protocol: null,
  tokens: [{ symbol: 'USDC', iconUrl: null }],
  howToSteps: [],
  depositUrl: null,
  explorerAddress: null,
  campaigns: [],
}

describe('GET /api/opportunities', () => {
  it('applies defaults and returns the service response', async () => {
    const list = vi.fn().mockResolvedValue(listResponse)
    const response = await getOpportunities(
      new Request('http://localhost/api/opportunities'),
      { list },
    )

    expect(list).toHaveBeenCalledWith({
      status: 'LIVE',
      sort: 'apr',
      order: 'desc',
      page: 0,
    })
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual(listResponse)
  })

  it('normalizes supported query parameters', async () => {
    const list = vi.fn().mockResolvedValue(listResponse)
    const request = new Request(
      'http://localhost/api/opportunities?search=%20usdc%20&chainId=1&protocol=%20aave%20&action=LEND&status=SOON&minimumTvl=100000.5&sort=tvl&order=asc&page=2',
    )

    await getOpportunities(request, { list })

    expect(list).toHaveBeenCalledWith({
      search: 'usdc',
      chainId: 1,
      protocol: 'aave',
      action: 'LEND',
      status: 'SOON',
      minimumTvl: 100_000.5,
      sort: 'tvl',
      order: 'asc',
      page: 2,
    } satisfies OpportunityListQuery)
  })

  it('returns 400 without calling the service for invalid input', async () => {
    const list = vi.fn().mockResolvedValue(listResponse)
    const response = await getOpportunities(
      new Request('http://localhost/api/opportunities?action=INVALID&page=-1'),
      { list },
    )

    expect(list).not.toHaveBeenCalled()
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: {
        code: 'INVALID_REQUEST',
        message: 'The opportunity query is invalid.',
      },
    })
  })
})

describe('GET /api/opportunities/:opportunityId', () => {
  it('returns the opportunity detail', async () => {
    const getById = vi.fn().mockResolvedValue(detailResponse)
    const response = await getOpportunity('11521673201667687989', {
      getById,
    })

    expect(getById).toHaveBeenCalledWith('11521673201667687989')
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual(detailResponse)
  })

  it('returns 400 without calling the service for an invalid ID', async () => {
    const getById = vi.fn().mockResolvedValue(detailResponse)
    const response = await getOpportunity('invalid', { getById })

    expect(getById).not.toHaveBeenCalled()
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: {
        code: 'INVALID_REQUEST',
        message: 'The opportunity ID is invalid.',
      },
    })
  })

  it('maps a missing opportunity to a stable 404 response', async () => {
    const getById = vi
      .fn()
      .mockRejectedValue(new MerklClientError('NOT_FOUND', 'Upstream detail'))
    const response = await getOpportunity('11521673201667687989', {
      getById,
    })

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({
      error: { code: 'NOT_FOUND', message: 'Opportunity not found.' },
    })
  })

  it('does not expose upstream error details', async () => {
    const getById = vi.fn().mockRejectedValue(
      new MerklClientError('UPSTREAM_UNAVAILABLE', 'Sensitive upstream URL'),
    )
    const response = await getOpportunity('11521673201667687989', {
      getById,
    })

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({
      error: {
        code: 'UPSTREAM_UNAVAILABLE',
        message: 'Opportunity data is temporarily unavailable.',
      },
    })
  })
})
