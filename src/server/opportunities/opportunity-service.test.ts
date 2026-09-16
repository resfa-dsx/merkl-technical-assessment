import { describe, expect, it, vi } from 'vitest'

import type {
  OpportunityDetail,
  OpportunityListQuery,
  OpportunityListResponse,
} from '#/features/opportunities/types/opportunity'

import { MemoryCache } from '../cache/memory-cache'
import {
  OpportunityService,
  createOpportunityDetailCacheKey,
  createOpportunityListCacheKey,
} from './opportunity-service'

const listQuery: OpportunityListQuery = {
  search: 'usdc',
  chainId: 1,
  protocol: 'aave',
  action: 'LEND',
  status: 'LIVE',
  minimumTvl: 100_000,
  sort: 'apr',
  order: 'desc',
  page: 0,
}

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

describe('opportunity cache keys', () => {
  it('creates the same sorted key regardless of property insertion order', () => {
    const reorderedQuery: OpportunityListQuery = {
      page: 0,
      order: 'desc',
      sort: 'apr',
      minimumTvl: 100_000,
      status: 'LIVE',
      action: 'LEND',
      protocol: 'aave',
      chainId: 1,
      search: 'usdc',
    }

    expect(createOpportunityListCacheKey(reorderedQuery)).toBe(
      createOpportunityListCacheKey(listQuery),
    )
    expect(createOpportunityListCacheKey(listQuery)).toBe(
      'opportunities:list:action=LEND&chainId=1&minimumTvl=100000&order=desc&page=0&protocol=aave&search=usdc&sort=apr&status=LIVE',
    )
  })

  it('creates a stable detail key', () => {
    expect(createOpportunityDetailCacheKey('11521673201667687989')).toBe(
      'opportunities:detail:11521673201667687989',
    )
  })
})

describe('OpportunityService', () => {
  it('caches list responses for 60 seconds', async () => {
    let now = 0
    const loadList = vi
      .fn<(query: OpportunityListQuery) => Promise<OpportunityListResponse>>()
      .mockResolvedValue(listResponse)
    const loadDetail = vi
      .fn<(id: string) => Promise<OpportunityDetail>>()
      .mockResolvedValue(detailResponse)
    const service = new OpportunityService(
      new MemoryCache(10, () => now),
      loadList,
      loadDetail,
    )

    await service.list(listQuery)
    now = 59_999
    await service.list(listQuery)
    expect(loadList).toHaveBeenCalledOnce()

    now = 60_000
    await service.list(listQuery)
    expect(loadList).toHaveBeenCalledTimes(2)
  })

  it('caches detail responses by opportunity id', async () => {
    const loadList = vi
      .fn<(query: OpportunityListQuery) => Promise<OpportunityListResponse>>()
      .mockResolvedValue(listResponse)
    const loadDetail = vi
      .fn<(id: string) => Promise<OpportunityDetail>>()
      .mockResolvedValue(detailResponse)
    const service = new OpportunityService(
      new MemoryCache(10),
      loadList,
      loadDetail,
    )

    await service.getById('11521673201667687989')
    await service.getById('11521673201667687989')

    expect(loadDetail).toHaveBeenCalledOnce()
  })
})
