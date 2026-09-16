import { createFileRoute } from '@tanstack/react-router'

import { getOpportunities } from '#/server/opportunities/opportunity-api'
import { opportunityService } from '#/server/opportunities/opportunity-service'

export const Route = createFileRoute('/api/opportunities/')({
  server: {
    handlers: {
      GET: ({ request }) => getOpportunities(request, opportunityService),
    },
  },
})
