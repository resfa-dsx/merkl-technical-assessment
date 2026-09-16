import { queryOptions } from '@tanstack/react-query'

import type { OpportunityListQuery } from '../types/opportunity'

import {
  getOpportunityDetail,
  getOpportunityList,
} from '../api/opportunity-functions'

export const opportunityKeys = {
  all: ['opportunities'] as const,
  list: (query: OpportunityListQuery) =>
    [
      ...opportunityKeys.all,
      'list',
      normalizeOpportunityListQuery(query),
    ] as const,
  detail: (opportunityId: string) =>
    [...opportunityKeys.all, 'detail', opportunityId] as const,
}

export function opportunityListQueryOptions(query: OpportunityListQuery) {
  const normalizedQuery = normalizeOpportunityListQuery(query)

  return queryOptions({
    queryKey: opportunityKeys.list(normalizedQuery),
    queryFn: () => getOpportunityList({ data: normalizedQuery }),
    staleTime: 60_000,
  })
}

export function opportunityDetailQueryOptions(opportunityId: string) {
  return queryOptions({
    queryKey: opportunityKeys.detail(opportunityId),
    queryFn: () => getOpportunityDetail({ data: { opportunityId } }),
    staleTime: 60_000,
  })
}

export function normalizeOpportunityListQuery(
  query: OpportunityListQuery,
): OpportunityListQuery {
  return {
    ...(query.search ? { search: query.search } : {}),
    ...(query.chainId !== undefined ? { chainId: query.chainId } : {}),
    ...(query.protocol ? { protocol: query.protocol } : {}),
    ...(query.action ? { action: query.action } : {}),
    status: query.status,
    ...(query.minimumTvl !== undefined
      ? { minimumTvl: query.minimumTvl }
      : {}),
    sort: query.sort,
    order: query.order,
    page: query.page,
  }
}
