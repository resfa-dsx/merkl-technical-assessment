import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import {
  opportunityIdSchema,
  opportunityListQuerySchema,
} from '../schemas/opportunity-query'
import { MerklClientError } from '#/server/merkl/merkl-errors'
import { opportunityService } from '#/server/opportunities/opportunity-service'

export const getOpportunityList = createServerFn({ method: 'GET' })
  .validator(opportunityListQuerySchema)
  .handler(async ({ data }) => {
    try {
      return await opportunityService.list(data)
    } catch (error) {
      throw new Error('Opportunity data is temporarily unavailable.', {
        cause: error,
      })
    }
  })

export const getOpportunityDetail = createServerFn({ method: 'GET' })
  .validator(z.object({ opportunityId: opportunityIdSchema }))
  .handler(async ({ data }) => {
    try {
      return await opportunityService.getById(data.opportunityId)
    } catch (error) {
      if (error instanceof MerklClientError && error.code === 'NOT_FOUND') {
        throw notFound()
      }

      throw new Error('Opportunity data is temporarily unavailable.', {
        cause: error,
      })
    }
  })
