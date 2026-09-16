import "@tanstack/react-start/server-only";

import {
  OPPORTUNITY_PAGE_SIZE,
  type CampaignSummary,
  type OpportunityAction,
  type OpportunityDetail,
  type OpportunityListItem,
  type OpportunityListResponse,
  type OpportunityStatus,
  type ResourceSummary,
} from "#/features/opportunities/types/opportunity";

import type {
  MerklOpportunity,
  MerklOpportunityDetail,
  MerklOpportunityList,
} from "./merkl-schemas";

export function mapMerklOpportunityList(
  opportunities: MerklOpportunityList,
  page: number,
): OpportunityListResponse {
  return {
    items: opportunities
      .filter((opportunity) => opportunity !== null)
      .map(mapMerklOpportunity),
    page,
    pageSize: OPPORTUNITY_PAGE_SIZE,
    hasNextPage: opportunities.length === OPPORTUNITY_PAGE_SIZE,
  };
}

export function mapMerklOpportunityDetail(
  opportunity: MerklOpportunityDetail,
): OpportunityDetail {
  return {
    ...mapMerklOpportunity(opportunity),
    howToSteps: opportunity.howToSteps,
    depositUrl: toOptionalHttpUrl(opportunity.depositUrl),
    explorerAddress: toOptionalText(opportunity.explorerAddress),
    campaigns: opportunity.campaigns.map(mapMerklCampaign),
  };
}

function mapMerklOpportunity(
  opportunity: MerklOpportunity,
): OpportunityListItem {
  return {
    id: opportunity.id,
    name: opportunity.name,
    description: opportunity.description,
    status: toOpportunityStatus(opportunity.status),
    action: toOpportunityAction(opportunity.action),
    apr: opportunity.apr,
    nativeApr: opportunity.nativeApr ?? null,
    tvlUsd: opportunity.tvl,
    dailyRewardsUsd: opportunity.dailyRewards,
    liveCampaigns: opportunity.liveCampaigns,
    chain: mapResource(opportunity.chain),
    protocol:
      opportunity.protocol === null || opportunity.protocol === undefined
        ? null
        : mapResource(opportunity.protocol),
    tokens: opportunity.tokens.map((token) => ({
      symbol: token.symbol,
      iconUrl: toOptionalHttpUrl(token.icon),
    })),
  };
}

function mapMerklCampaign(
  campaign: MerklOpportunityDetail["campaigns"][number],
): CampaignSummary {
  return {
    id: campaign.id,
    campaignId: campaign.campaignId,
    type: campaign.type,
    distributionType: campaign.distributionType ?? null,
    apr: campaign.apr ?? null,
    dailyRewardsUsd: campaign.dailyRewards ?? null,
    startTimestamp: toUnixTimestamp(campaign.startTimestamp),
    endTimestamp: toUnixTimestamp(campaign.endTimestamp),
    status: toOptionalText(campaign.campaignStatus.status),
    creator: toOptionalText(
      campaign.creator?.address ?? campaign.creatorAddress,
    ),
    rewardToken: {
      symbol: campaign.rewardToken.symbol,
      name: toOptionalText(campaign.rewardToken.name),
      iconUrl: toOptionalHttpUrl(campaign.rewardToken.icon),
      priceUsd: campaign.rewardToken.price ?? null,
    },
  };
}

function mapResource(resource: {
  id: string | number;
  name: string;
  icon?: string | null;
}): ResourceSummary {
  return {
    id: String(resource.id),
    name: resource.name,
    iconUrl: toOptionalHttpUrl(resource.icon),
  };
}

function toOpportunityStatus(
  status: MerklOpportunity["status"],
): OpportunityStatus {
  if (status === "NONE") {
    throw new Error("Unsupported Merkl opportunity status");
  }

  return status;
}

function toOpportunityAction(
  action: MerklOpportunity["action"],
): OpportunityAction {
  if (action === "INVALID") {
    throw new Error("Unsupported Merkl opportunity action");
  }

  return action;
}

function toUnixTimestamp(value: string | number | bigint): number {
  const timestamp = Number(value);

  if (!Number.isSafeInteger(timestamp) || timestamp < 0) {
    throw new Error("Invalid Merkl campaign timestamp");
  }

  return timestamp;
}

function toOptionalText(value: string | null | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function toOptionalHttpUrl(value: string | null | undefined): string | null {
  const normalized = toOptionalText(value);

  if (normalized === null) {
    return null;
  }

  try {
    const url = new URL(normalized);
    return url.protocol === "http:" || url.protocol === "https:"
      ? normalized
      : null;
  } catch {
    return null;
  }
}
