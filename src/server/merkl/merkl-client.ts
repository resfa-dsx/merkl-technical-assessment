import '@tanstack/react-start/server-only'

import type { ZodType } from 'zod'

import {
  OPPORTUNITY_PAGE_SIZE,
  type OpportunityDetail,
  type OpportunityListQuery,
  type OpportunityListResponse,
} from '#/features/opportunities/types/opportunity'

import { MerklClientError } from './merkl-errors'
import {
  mapMerklOpportunityDetail,
  mapMerklOpportunityList,
} from './merkl-mappers'
import {
  merklOpportunityDetailSchema,
  merklOpportunityListSchema,
} from './merkl-schemas'

const MERKL_API_BASE_URL = 'https://api.merkl.xyz/v4/'
const MERKL_REQUEST_TIMEOUT_MS = 8_000

export async function fetchOpportunityList(
  query: OpportunityListQuery,
): Promise<OpportunityListResponse> {
  const url = new URL('opportunities/', MERKL_API_BASE_URL)
  const parameters = url.searchParams

  parameters.set('items', String(OPPORTUNITY_PAGE_SIZE))
  parameters.set('page', String(query.page))
  parameters.set('status', query.status)
  parameters.set('sort', query.sort)
  parameters.set('order', query.order)

  setOptionalParameter(parameters, 'search', query.search)
  setOptionalParameter(parameters, 'chainId', query.chainId)
  setOptionalParameter(parameters, 'mainProtocolId', query.protocol)
  setOptionalParameter(parameters, 'action', query.action)
  setOptionalParameter(parameters, 'minimumTvl', query.minimumTvl)

  const opportunities = await requestMerkl(url, merklOpportunityListSchema)
  return mapMerklOpportunityList(opportunities, query.page)
}

export async function fetchOpportunityDetail(
  opportunityId: string,
): Promise<OpportunityDetail> {
  const encodedId = encodeURIComponent(opportunityId)
  const url = new URL(
    `opportunities/${encodedId}/campaigns`,
    MERKL_API_BASE_URL,
  )
  const opportunity = await requestMerkl(url, merklOpportunityDetailSchema)
  return mapMerklOpportunityDetail(opportunity)
}

async function requestMerkl<T>(url: URL, schema: ZodType<T>): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
      },
      signal: AbortSignal.timeout(MERKL_REQUEST_TIMEOUT_MS),
    })

    if (response.status === 404) {
      throw new MerklClientError(
        'NOT_FOUND',
        'The requested Merkl opportunity was not found.',
        { upstreamStatus: response.status },
      )
    }

    if (!response.ok) {
      throw new MerklClientError(
        'UPSTREAM_UNAVAILABLE',
        'The Merkl API is unavailable.',
        { upstreamStatus: response.status },
      )
    }

    const result = schema.safeParse(await readMerklJson(response))

    if (!result.success) {
      throw invalidResponseError(result.error)
    }

    return result.data
  } catch (error) {
    if (error instanceof MerklClientError) {
      throw error
    }

    if (isTimeoutError(error)) {
      throw new MerklClientError(
        'UPSTREAM_TIMEOUT',
        'The Merkl API request timed out.',
        { cause: error },
      )
    }

    throw new MerklClientError(
      'UPSTREAM_UNAVAILABLE',
      'The Merkl API is unavailable.',
      { cause: error },
    )
  }
}

async function readMerklJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch (error) {
    throw invalidResponseError(error)
  }
}

function setOptionalParameter(
  parameters: URLSearchParams,
  name: string,
  value: string | number | undefined,
) {
  if (value !== undefined && value !== '') {
    parameters.set(name, String(value))
  }
}

function invalidResponseError(cause: unknown) {
  return new MerklClientError(
    'INVALID_RESPONSE',
    'The Merkl API returned an invalid response.',
    { cause },
  )
}

function isTimeoutError(error: unknown) {
  return (
    error instanceof Error &&
    (error.name === 'TimeoutError' || error.name === 'AbortError')
  )
}
