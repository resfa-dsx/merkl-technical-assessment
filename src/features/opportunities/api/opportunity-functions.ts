import { createServerFn } from '@tanstack/react-start'

import { opportunityListQuerySchema } from '../schemas/opportunity-query'
import { opportunityService } from '#/server/opportunities/opportunity-service'

export const getOpportunityList = createServerFn({ method: 'GET' })
  .validator(opportunityListQuerySchema)
  .handler(async ({ data }) => {
    try {
      return await opportunityService.list(data)
    } catch {
      throw new Error('Opportunity data is temporarily unavailable.')
    }
  })
