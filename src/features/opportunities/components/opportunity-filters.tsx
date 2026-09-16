import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'

import type { OpportunityListQuery } from '../types/opportunity'

import { opportunityListQuerySchema } from '../schemas/opportunity-query'

const defaultQuery: OpportunityListQuery = {
  status: 'LIVE',
  sort: 'apr',
  order: 'desc',
  page: 0,
}

const chainOptions = [
  { value: 1, label: 'Ethereum' },
  { value: 42161, label: 'Arbitrum' },
  { value: 10, label: 'Optimism' },
  { value: 8453, label: 'Base' },
  { value: 137, label: 'Polygon' },
  { value: 56, label: 'BNB Chain' },
  { value: 43114, label: 'Avalanche' },
  { value: 146, label: 'Sonic' },
  { value: 43111, label: 'Hemi' },
  { value: 59144, label: 'Linea' },
  { value: 534352, label: 'Scroll' },
  { value: 5000, label: 'Mantle' },
] as const

const protocolOptions = [
  { value: 'aave', label: 'Aave' },
  { value: 'morpho', label: 'Morpho' },
  { value: 'uniswap', label: 'Uniswap' },
  { value: 'curve', label: 'Curve' },
  { value: 'sushiswap', label: 'SushiSwap' },
  { value: 'compound', label: 'Compound' },
  { value: 'pendle', label: 'Pendle' },
] as const

const actionOptions = [
  { value: 'POOL', label: 'Pool' },
  { value: 'HOLD', label: 'Hold' },
  { value: 'DROP', label: 'Drop' },
  { value: 'LEND', label: 'Lend' },
  { value: 'BORROW', label: 'Borrow' },
  { value: 'LONG', label: 'Long' },
  { value: 'SHORT', label: 'Short' },
  { value: 'SWAP', label: 'Swap' },
  { value: 'STAKE', label: 'Stake' },
] as const

const sortOptions = [
  { value: 'apr-desc', label: 'Highest APR', sort: 'apr', order: 'desc' },
  { value: 'apr-asc', label: 'Lowest APR', sort: 'apr', order: 'asc' },
  { value: 'tvl-desc', label: 'Highest TVL', sort: 'tvl', order: 'desc' },
  { value: 'tvl-asc', label: 'Lowest TVL', sort: 'tvl', order: 'asc' },
] as const

export function OpportunityFilters({
  query,
}: {
  query: OpportunityListQuery
}) {
  const navigate = useNavigate({ from: '/opportunities/' })
  const [searchValue, setSearchValue] = useState(query.search ?? '')
  const hasNonDefaultState =
    Boolean(query.search) ||
    query.chainId !== undefined ||
    Boolean(query.protocol) ||
    query.action !== undefined ||
    query.status !== defaultQuery.status ||
    query.minimumTvl !== undefined ||
    query.sort !== defaultQuery.sort ||
    query.order !== defaultQuery.order ||
    query.page !== 0

  useEffect(() => {
    setSearchValue(query.search ?? '')
  }, [query.search])

  useEffect(() => {
    const search = searchValue.trim()

    if (search === (query.search ?? '')) {
      return
    }

    const timeout = window.setTimeout(() => {
      void navigate({
        replace: true,
        search: opportunityListQuerySchema.parse({
          ...query,
          search: search || undefined,
          page: 0,
        }),
      })
    }, 350)

    return () => window.clearTimeout(timeout)
  }, [navigate, query, searchValue])

  function updateQuery(update: Partial<OpportunityListQuery>) {
    void navigate({
      search: opportunityListQuerySchema.parse({
        ...query,
        search: searchValue.trim() || undefined,
        ...update,
        page: 0,
      }),
    })
  }

  function handleSortChange(event: ChangeEvent<HTMLSelectElement>) {
    const option = sortOptions.find(
      ({ value }) => value === event.currentTarget.value,
    )

    if (option !== undefined) {
      updateQuery({ sort: option.sort, order: option.order })
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm shadow-black/20 sm:p-5">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
        <FilterField className="md:col-span-2 lg:col-span-5" label="Search">
          <input
            className={controlClassName}
            name="search"
            onChange={(event) => setSearchValue(event.currentTarget.value)}
            placeholder="Search opportunities"
            type="search"
            value={searchValue}
          />
        </FilterField>

        <FilterField className="lg:col-span-2" label="Chain">
          <select
            className={controlClassName}
            onChange={(event) =>
              updateQuery({
                chainId: event.currentTarget.value
                  ? Number(event.currentTarget.value)
                  : undefined,
              })
            }
            value={query.chainId ?? ''}
          >
            <option value="">All chains</option>
            {query.chainId !== undefined &&
            !chainOptions.some(({ value }) => value === query.chainId) ? (
              <option value={query.chainId}>Chain {query.chainId}</option>
            ) : null}
            {chainOptions.map((chain) => (
              <option key={chain.value} value={chain.value}>
                {chain.label}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField className="lg:col-span-3" label="Protocol">
          <select
            className={controlClassName}
            onChange={(event) =>
              updateQuery({
                protocol: event.currentTarget.value || undefined,
              })
            }
            value={query.protocol ?? ''}
          >
            <option value="">All protocols</option>
            {query.protocol !== undefined &&
            !protocolOptions.some(({ value }) => value === query.protocol) ? (
              <option value={query.protocol}>{query.protocol}</option>
            ) : null}
            {protocolOptions.map((protocol) => (
              <option key={protocol.value} value={protocol.value}>
                {protocol.label}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField className="lg:col-span-2" label="Action">
          <select
            className={controlClassName}
            onChange={(event) => {
              const action = actionOptions.find(
                ({ value }) => value === event.currentTarget.value,
              )
              updateQuery({ action: action?.value })
            }}
            value={query.action ?? ''}
          >
            <option value="">All actions</option>
            {actionOptions.map((action) => (
              <option key={action.value} value={action.value}>
                {action.label}
              </option>
            ))}
          </select>
        </FilterField>
      </div>

      <div className="mt-5 flex flex-col gap-4 border-t border-slate-800 pt-4 sm:flex-row sm:items-end sm:justify-between">
        <FilterField className="w-full sm:max-w-56" label="Sort by">
          <select
            className={controlClassName}
            onChange={handleSortChange}
            value={`${query.sort}-${query.order}`}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FilterField>

        <button
          className="min-h-11 self-start rounded-lg px-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-300 sm:self-auto"
          disabled={!hasNonDefaultState}
          onClick={() => {
            setSearchValue('')
            void navigate({ search: defaultQuery })
          }}
          type="button"
        >
          Clear filters
        </button>
      </div>
    </div>
  )
}

function FilterField({
  children,
  className,
  label,
}: {
  children: ReactNode
  className?: string
  label: string
}) {
  return (
    <label className={className}>
      <span className="mb-1.5 block text-sm font-medium text-slate-300">
        {label}
      </span>
      {children}
    </label>
  )
}

const controlClassName =
  'min-h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20'
