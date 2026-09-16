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
      <div className="h-11 w-44 animate-pulse rounded bg-slate-900" />
      <div className="mt-5 h-64 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/70" />
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            className="h-24 animate-pulse rounded-xl border border-slate-800 bg-slate-900/70"
            key={index}
          />
        ))}
      </div>
      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/70" />
        <div className="h-64 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/70" />
      </div>
    </section>
  )
}

function OpportunityDetailError() {
  const router = useRouter()

  return (
    <section className="rounded-2xl border border-red-950 bg-red-950/20 px-6 py-12 text-center">
      <h1 className="text-xl font-semibold text-white">
        Opportunity details are temporarily unavailable
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
        We could not load the latest campaign data. Please try again.
      </p>
      <button
        className="mt-5 min-h-11 rounded-lg bg-slate-100 px-4 text-sm font-semibold text-slate-950 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
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
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-14 text-center">
      <p className="text-sm font-medium text-emerald-300">Not found</p>
      <h1 className="mt-2 text-2xl font-semibold text-white">
        This opportunity is no longer available
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-slate-400">
        It may have ended, moved, or the opportunity ID may be incorrect.
      </p>
      <Link
        className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-slate-100 px-4 text-sm font-semibold text-slate-950 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
        to="/opportunities"
      >
        Back to opportunities
      </Link>
    </section>
  )
}
