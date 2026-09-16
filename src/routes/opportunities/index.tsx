import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/opportunities/')({
  component: OpportunitiesPage,
})

function OpportunitiesPage() {
  return (
    <section>
      <p className="text-sm font-medium text-emerald-300">Opportunities</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Explore opportunities
      </h1>
      <p className="mt-3 max-w-2xl text-slate-400">
        Opportunity data will be added in a later milestone.
      </p>
    </section>
  )
}
