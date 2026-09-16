import { useSuspenseQuery } from '@tanstack/react-query'
import {
  Link,
  createFileRoute,
  notFound,
  useRouter,
} from '@tanstack/react-router'

import { OpportunityDetail } from '#/features/opportunities/components/opportunity-detail'
import { opportunityDetailQueryOptions } from '#/features/opportunities/queries/opportunity-queries'
import { opportunityIdSchema } from '#/features/opportunities/schemas/opportunity-query'

export const Route = createFileRoute('/opportunities/$opportunityId')({
  loader: ({ context, params }) => {
    const opportunityId = opportunityIdSchema.safeParse(params.opportunityId)

    if (!opportunityId.success) {
      throw notFound()
    }

    return context.queryClient.ensureQueryData(
      opportunityDetailQueryOptions(opportunityId.data),
    )
  },
  pendingMs: 300,
  pendingMinMs: 200,
  pendingComponent: OpportunityDetailPending,
  errorComponent: OpportunityDetailError,
  notFoundComponent: OpportunityNotFound,
  component: OpportunityDetailPage,
})

function OpportunityDetailPage() {
  const { opportunityId } = Route.useParams()
  const { data } = useSuspenseQuery(
    opportunityDetailQueryOptions(opportunityId),
  )

  return <OpportunityDetail opportunity={data} />
}

function OpportunityDetailPending() {
  return (
    <section aria-busy="true" aria-label="Loading opportunity details">
      <div className="h-11 w-44 animate-pulse rounded bg-surface" />
      <div className="mt-5 h-64 animate-pulse rounded-xl border border-line bg-surface" />
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            className="h-24 animate-pulse rounded-xl border border-line bg-surface"
            key={index}
          />
        ))}
      </div>
      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-xl border border-line bg-surface" />
        <div className="h-64 animate-pulse rounded-xl border border-line bg-surface" />
      </div>
    </section>
  )
}

function OpportunityDetailError() {
  const router = useRouter()

  return (
    <section className="rounded-xl border border-line bg-surface px-6 py-12 text-center">
      <h1 className="text-xl font-semibold text-foreground">
        Opportunity details are temporarily unavailable
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-secondary">
        We could not load the latest campaign data. Please try again.
      </p>
      <button
        className="mt-5 min-h-11 rounded-lg bg-accent px-4 text-sm font-semibold text-canvas transition hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        onClick={() => void router.invalidate()}
        type="button"
      >
        Retry
      </button>
    </section>
  )
}

function OpportunityNotFound() {
  return (
    <section className="rounded-xl border border-line bg-surface px-6 py-14 text-center">
      <p className="text-sm font-medium text-accent">Not found</p>
      <h1 className="mt-2 text-2xl font-semibold text-foreground">
        This opportunity is no longer available
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-secondary">
        It may have ended, moved, or the opportunity ID may be incorrect.
      </p>
      <Link
        className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-accent px-4 text-sm font-semibold text-canvas transition hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        to="/opportunities"
      >
        Back to opportunities
      </Link>
    </section>
  )
}
