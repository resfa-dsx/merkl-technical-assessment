import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import type {
  CampaignSummary,
  OpportunityDetail as OpportunityDetailData,
} from '../types/opportunity'

import {
  formatPercentage,
  formatUnixDate,
  formatUsd,
} from '#/lib/formatters'

import { ResourceIcon } from './resource-icon'

export function OpportunityDetail({
  opportunity,
}: {
  opportunity: OpportunityDetailData
}) {
  const identity = opportunity.protocol ?? opportunity.chain

  return (
    <article>
      <Link
        className="inline-flex min-h-11 items-center text-sm font-medium text-secondary transition hover:text-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        to="/opportunities"
      >
        ← Back to opportunities
      </Link>

      <header className="mt-5 rounded-xl border border-line bg-surface p-5 sm:p-7">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <ResourceIcon name={identity.name} src={identity.iconUrl} />
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-wide text-accent">
                {opportunity.protocol?.name ?? opportunity.chain.name}
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {opportunity.name}
              </h1>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <Badge>{opportunity.chain.name}</Badge>
                <Badge>{formatLabel(opportunity.action)}</Badge>
                <Badge accent={opportunity.status === 'LIVE'}>
                  {formatLabel(opportunity.status)}
                </Badge>
              </div>
            </div>
          </div>

          {opportunity.depositUrl ? (
            <a
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-accent px-4 text-sm font-semibold text-canvas transition hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              href={opportunity.depositUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Deposit ↗
            </a>
          ) : null}
        </div>

        {opportunity.description ? (
          <p className="mt-6 max-w-3xl leading-7 text-secondary">
            {opportunity.description}
          </p>
        ) : null}

        {opportunity.tokens.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-2" aria-label="Tokens">
            {opportunity.tokens.map((token, index) => (
              <span
                className="inline-flex items-center gap-2 rounded-full border border-line bg-elevated py-1 pl-1 pr-3 text-sm text-secondary"
                key={`${token.symbol}-${index}`}
              >
                <span className="[&>img]:size-7 [&>img]:rounded-full [&>span]:size-7 [&>span]:rounded-full">
                  <ResourceIcon name={token.symbol} src={token.iconUrl} />
                </span>
                {token.symbol}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      <section aria-labelledby="metrics-heading" className="mt-6">
        <h2 className="sr-only" id="metrics-heading">
          Opportunity metrics
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard
            accent
            label="Total APR"
            value={formatPercentage(opportunity.apr)}
          />
          {opportunity.nativeApr !== null ? (
            <MetricCard
              label="Native APR"
              value={formatPercentage(opportunity.nativeApr)}
            />
          ) : null}
          <MetricCard label="TVL" value={formatUsd(opportunity.tvlUsd)} />
          <MetricCard
            label="Daily rewards"
            value={formatUsd(opportunity.dailyRewardsUsd)}
          />
          <MetricCard
            label="Active campaigns"
            value={String(opportunity.liveCampaigns)}
          />
        </div>
      </section>

      {opportunity.howToSteps.length > 0 ? (
        <section
          aria-labelledby="participate-heading"
          className="mt-10 rounded-xl border border-line bg-surface p-5 sm:p-6"
        >
          <p className="text-sm font-medium text-accent">How it works</p>
          <h2
            className="mt-1 text-xl font-semibold text-foreground"
            id="participate-heading"
          >
            How to participate
          </h2>
          <ol className="mt-5 space-y-4">
            {opportunity.howToSteps.map((step, index) => (
              <li className="flex gap-3 text-secondary" key={`${step}-${index}`}>
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-elevated text-xs font-semibold text-accent">
                  {index + 1}
                </span>
                <span className="pt-0.5 leading-6">{step}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section aria-labelledby="campaigns-heading" className="mt-10">
        <div>
          <p className="text-sm font-medium text-accent">Rewards</p>
          <h2
            className="mt-1 text-2xl font-semibold text-foreground"
            id="campaigns-heading"
          >
            Campaigns
          </h2>
          <p className="mt-2 text-sm text-secondary">
            Reward campaigns currently attached to this opportunity.
          </p>
        </div>

        {opportunity.campaigns.length > 0 ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {opportunity.campaigns.map((campaign) => (
              <CampaignCard campaign={campaign} key={campaign.id} />
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-dashed border-line-strong bg-surface px-6 py-10 text-center text-sm text-secondary">
            No campaign details are currently available.
          </div>
        )}
      </section>
    </article>
  )
}

function CampaignCard({ campaign }: { campaign: CampaignSummary }) {
  const rewardTokenName = campaign.rewardToken.name
    ? `${campaign.rewardToken.name} (${campaign.rewardToken.symbol})`
    : campaign.rewardToken.symbol

  return (
    <article className="min-w-0 rounded-xl border border-line bg-surface p-5">
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <ResourceIcon
            name={campaign.rewardToken.symbol}
            src={campaign.rewardToken.iconUrl}
          />
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-muted">
              Reward token
            </p>
            <h3 className="truncate font-semibold text-foreground">
              {rewardTokenName}
            </h3>
          </div>
        </div>
        {campaign.status ? <Badge>{formatLabel(campaign.status)}</Badge> : null}
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-4 border-y border-line py-4">
        <CampaignMetric
          label="Campaign APR"
          value={
            campaign.apr === null ? 'Not available' : formatPercentage(campaign.apr)
          }
        />
        <CampaignMetric
          label="Daily rewards"
          value={
            campaign.dailyRewardsUsd === null
              ? 'Not available'
              : formatUsd(campaign.dailyRewardsUsd)
          }
        />
      </dl>

      <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
        <CampaignMetric label="Type" value={formatLabel(campaign.type)} />
        {campaign.distributionType ? (
          <CampaignMetric
            label="Distribution"
            value={formatLabel(campaign.distributionType)}
          />
        ) : null}
        <CampaignMetric
          label="Starts"
          value={formatUnixDate(campaign.startTimestamp)}
        />
        <CampaignMetric
          label="Ends"
          value={formatUnixDate(campaign.endTimestamp)}
        />
      </dl>
    </article>
  )
}

function MetricCard({
  accent = false,
  label,
  value,
}: {
  accent?: boolean
  label: string
  value: string
}) {
  return (
    <dl className="rounded-xl border border-line bg-surface p-4">
      <dt className="text-xs text-muted">{label}</dt>
      <dd
        className={`mt-1 text-xl font-semibold tabular-nums ${accent ? 'text-positive' : 'text-foreground'}`}
      >
        {value}
      </dd>
    </dl>
  )
}

function CampaignMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 break-words font-medium text-secondary">{value}</dd>
    </div>
  )
}

function Badge({
  accent = false,
  children,
}: {
  accent?: boolean
  children: ReactNode
}) {
  return (
    <span
      className={
        accent
          ? 'shrink-0 rounded-full border border-positive/25 bg-positive/10 px-2.5 py-1 text-positive'
          : 'shrink-0 rounded-full border border-line bg-elevated px-2.5 py-1 text-secondary'
      }
    >
      {children}
    </span>
  )
}

function formatLabel(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase())
}
