import { createFileRoute } from '@tanstack/react-router'

import { getOpportunity } from '#/server/opportunities/opportunity-api'
import { opportunityService } from '#/server/opportunities/opportunity-service'

export const Route = createFileRoute(
  '/api/opportunities/$opportunityId',
)({
  server: {
    handlers: {
      GET: ({ params }) =>
        getOpportunity(params.opportunityId, opportunityService),
    },
  },
})
