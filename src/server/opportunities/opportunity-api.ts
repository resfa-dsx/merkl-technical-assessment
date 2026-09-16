import '@tanstack/react-start/server-only'

import type { OpportunityService } from './opportunity-service'

import {
  opportunityIdSchema,
  opportunityListQuerySchema,
} from '#/features/opportunities/schemas/opportunity-query'

import { MerklClientError } from '../merkl/merkl-errors'

type ListService = Pick<OpportunityService, 'list'>
type DetailService = Pick<OpportunityService, 'getById'>

export async function getOpportunities(
  request: Request,
  service: ListService,
) {
  const query = opportunityListQuerySchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams),
  )

  if (!query.success) {
    return errorResponse(
      400,
      'INVALID_REQUEST',
      'The opportunity query is invalid.',
    )
  }

  try {
    return Response.json(await service.list(query.data), { status: 200 })
  } catch (error) {
    return opportunityErrorResponse(error)
  }
}

export async function getOpportunity(
  opportunityId: string,
  service: DetailService,
) {
  const id = opportunityIdSchema.safeParse(opportunityId)

  if (!id.success) {
    return errorResponse(
      400,
      'INVALID_REQUEST',
      'The opportunity ID is invalid.',
    )
  }

  try {
    return Response.json(await service.getById(id.data), { status: 200 })
  } catch (error) {
    return opportunityErrorResponse(error)
  }
}

function opportunityErrorResponse(error: unknown) {
  if (error instanceof MerklClientError) {
    if (error.code === 'NOT_FOUND') {
      return errorResponse(404, 'NOT_FOUND', 'Opportunity not found.')
    }

    const status = error.code === 'INVALID_RESPONSE' ? 502 : 503
    return errorResponse(
      status,
      'UPSTREAM_UNAVAILABLE',
      'Opportunity data is temporarily unavailable.',
    )
  }

  return errorResponse(
    500,
    'INTERNAL_ERROR',
    'An unexpected error occurred.',
  )
}

function errorResponse(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status })
}
