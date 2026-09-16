import '@tanstack/react-start/server-only'

import type {
  OpportunityDetail,
  OpportunityListQuery,
  OpportunityListResponse,
} from '#/features/opportunities/types/opportunity'

import { MemoryCache } from '../cache/memory-cache'
import {
  fetchOpportunityDetail,
  fetchOpportunityList,
} from '../merkl/merkl-client'

const CACHE_TTL_MS = 60_000
const CACHE_MAX_ENTRIES = 100

export class OpportunityService {
  constructor(
    private readonly cache = new MemoryCache(CACHE_MAX_ENTRIES),
    private readonly loadList = fetchOpportunityList,
    private readonly loadDetail = fetchOpportunityDetail,
  ) {}

  list(query: OpportunityListQuery): Promise<OpportunityListResponse> {
    return this.cache.getOrSet(
      createOpportunityListCacheKey(query),
      CACHE_TTL_MS,
      () => this.loadList(query),
    )
  }

  getById(opportunityId: string): Promise<OpportunityDetail> {
    return this.cache.getOrSet(
      createOpportunityDetailCacheKey(opportunityId),
      CACHE_TTL_MS,
      () => this.loadDetail(opportunityId),
    )
  }
}

export function createOpportunityListCacheKey(query: OpportunityListQuery) {
  const parameters = new URLSearchParams()

  for (const [name, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') {
      parameters.set(name, String(value))
    }
  }

  parameters.sort()
  return `opportunities:list:${parameters.toString()}`
}

export function createOpportunityDetailCacheKey(opportunityId: string) {
  return `opportunities:detail:${opportunityId}`
}

export const opportunityService = new OpportunityService()
