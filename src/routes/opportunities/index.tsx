import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'

import { OpportunityFilters } from '#/features/opportunities/components/opportunity-filters'
import { OpportunityList } from '#/features/opportunities/components/opportunity-list'
import {
  normalizeOpportunityListQuery,
  opportunityListQueryOptions,
} from '#/features/opportunities/queries/opportunity-queries'
import { opportunitySearchSchema } from '#/features/opportunities/schemas/opportunity-query'

export const Route = createFileRoute('/opportunities/')({
  validateSearch: opportunitySearchSchema,
  loaderDeps: ({ search }) => normalizeOpportunityListQuery(search),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(opportunityListQueryOptions(deps)),
  pendingMs: 300,
  pendingMinMs: 200,
  pendingComponent: OpportunitiesPending,
  errorComponent: OpportunitiesError,
  component: OpportunitiesPage,
})

function OpportunitiesPage() {
  const query = Route.useSearch()
  const { data } = useSuspenseQuery(opportunityListQueryOptions(query))

  return (
    <section>
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-300">Opportunities</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Explore opportunities
        </h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          Compare yield opportunities across chains and protocols using live
          data from Merkl.
        </p>
      </div>

      <OpportunityFilters query={query} />

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-white">Results</h2>
        <p className="mt-1 text-sm text-slate-400">
          {data.items.length}{' '}
          {data.items.length === 1 ? 'opportunity' : 'opportunities'} on this
          page
        </p>
      </div>

      <div className="mt-4">
        <OpportunityList data={data} query={query} />
      </div>
    </section>
  )
}

function OpportunitiesPending() {
  return (
    <section aria-busy="true" aria-label="Loading opportunities">
      <div className="h-8 w-64 animate-pulse rounded bg-slate-800" />
      <div className="mt-3 h-5 w-full max-w-xl animate-pulse rounded bg-slate-900" />
      <div className="mt-8 h-52 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/70" />
      <div className="mt-8 space-y-3">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            className="h-36 animate-pulse rounded-xl border border-slate-800 bg-slate-900/70"
            key={index}
          />
        ))}
      </div>
    </section>
  )
}

function OpportunitiesError() {
  const router = useRouter()

  return (
    <section className="rounded-2xl border border-red-950 bg-red-950/20 px-6 py-12 text-center">
      <h1 className="text-xl font-semibold text-white">
        Opportunities are temporarily unavailable
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
        We could not load the latest opportunity data. Please try again.
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
