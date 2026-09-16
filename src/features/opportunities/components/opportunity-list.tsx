import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import type {
  OpportunityListItem,
  OpportunityListQuery,
  OpportunityListResponse,
} from "../types/opportunity";

import { formatPercentage, formatUsd } from "#/lib/formatters";

import { ResourceIcon } from "./resource-icon";

export function OpportunityList({
  data,
  query,
}: {
  data: OpportunityListResponse;
  query: OpportunityListQuery;
}) {
  if (data.items.length === 0) {
    return <EmptyOpportunities />;
  }

  return (
    <>
      <div className="space-y-3">
        {data.items.map((opportunity) => (
          <OpportunityRow key={opportunity.id} opportunity={opportunity} />
        ))}
      </div>
      <Pagination data={data} query={query} />
    </>
  );
}

function OpportunityRow({ opportunity }: { opportunity: OpportunityListItem }) {
  const identity = opportunity.protocol ?? opportunity.chain;

  return (
    <Link
      className="group block rounded-xl border border-slate-800 bg-slate-900/70 p-4 transition hover:border-slate-700 hover:bg-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
      params={{ opportunityId: opportunity.id }}
      to="/opportunities/$opportunityId"
    >
      <article className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_150px_110px_140px_auto] lg:items-center">
        <div className="flex min-w-0 items-start gap-3.5">
          <ResourceIcon name={identity.name} src={identity.iconUrl} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold uppercase tracking-wide text-slate-400">
              {opportunity.protocol?.name ?? opportunity.chain.name}
            </p>
            <h2 className="mt-1 line-clamp-2 font-semibold leading-snug text-white">
              {opportunity.name}
            </h2>
            <div className="mt-2.5 flex flex-wrap gap-1.5 text-xs">
              <Badge>{opportunity.chain.name}</Badge>
              <Badge>{formatLabel(opportunity.action)}</Badge>
              <Badge accent={opportunity.status === "LIVE"}>
                {formatLabel(opportunity.status)}
              </Badge>
              {opportunity.tokens.slice(0, 3).map((token, index) => (
                <Badge key={`${token.symbol}-${index}`}>{token.symbol}</Badge>
              ))}
              {opportunity.tokens.length > 3 ? (
                <Badge>+{opportunity.tokens.length - 3}</Badge>
              ) : null}
              {opportunity.liveCampaigns > 0 ? (
                <Badge>
                  {opportunity.liveCampaigns}{" "}
                  {opportunity.liveCampaigns === 1 ? "campaign" : "campaigns"}
                </Badge>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4 sm:grid-cols-3 lg:contents">
          <Metric
            label="APR"
            primary
            value={formatPercentage(opportunity.apr)}
          />
          <Metric label="TVL" value={formatUsd(opportunity.tvlUsd)} />
          <Metric
            className="col-span-2 sm:col-span-1"
            label="Daily rewards"
            value={formatUsd(opportunity.dailyRewardsUsd)}
          />
        </div>

        <span className="justify-self-end text-sm font-medium text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-emerald-300 lg:justify-self-auto">
          View →
        </span>
      </article>
    </Link>
  );
}

function Badge({
  accent = false,
  children,
}: {
  accent?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={
        accent
          ? "rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-emerald-300"
          : "rounded-full border border-slate-700 bg-slate-800/80 px-2 py-0.5 text-slate-300"
      }
    >
      {children}
    </span>
  );
}

function Metric({
  className = "",
  label,
  primary = false,
  value,
}: {
  className?: string;
  label: string;
  primary?: boolean;
  value: string;
}) {
  return (
    <dl className={`min-w-0 lg:text-right ${className}`}>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd
        className={`mt-0.5 whitespace-nowrap font-semibold tabular-nums ${primary ? "text-xl text-emerald-300" : "text-sm text-slate-100"}`}
      >
        {value}
      </dd>
    </dl>
  );
}

function Pagination({
  data,
  query,
}: {
  data: OpportunityListResponse;
  query: OpportunityListQuery;
}) {
  return (
    <nav
      aria-label="Opportunity pages"
      className="mt-8 flex items-center justify-between gap-4"
    >
      {query.page === 0 ? (
        <span
          className={`${paginationClassName} cursor-not-allowed opacity-40`}
        >
          ← Previous
        </span>
      ) : (
        <Link
          className={paginationClassName}
          search={{ ...query, page: query.page - 1 }}
          to="/opportunities"
        >
          ← Previous
        </Link>
      )}

      <span className="text-sm tabular-nums text-slate-400">
        Page {query.page + 1}
      </span>

      {data.hasNextPage ? (
        <Link
          className={paginationClassName}
          search={{ ...query, page: query.page + 1 }}
          to="/opportunities"
        >
          Next →
        </Link>
      ) : (
        <span
          className={`${paginationClassName} cursor-not-allowed opacity-40`}
        >
          Next →
        </span>
      )}
    </nav>
  );
}

function EmptyOpportunities() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-14 text-center">
      <h2 className="text-lg font-semibold text-white">
        No opportunities found
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
        No opportunity matches the current filters. Try broadening your search.
      </p>
      <Link
        className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-slate-800 px-4 text-sm font-medium text-slate-100 hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
        search={{ status: "LIVE", sort: "apr", order: "desc", page: 0 }}
        to="/opportunities"
      >
        Clear filters
      </Link>
    </div>
  );
}

function formatLabel(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

const paginationClassName =
  "inline-flex min-h-11 min-w-24 items-center justify-center rounded-lg border border-slate-700 px-3 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300";
