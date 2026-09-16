export const OPPORTUNITY_PAGE_SIZE = 20 as const

export type OpportunityStatus = 'LIVE' | 'SOON' | 'PAST'

export type OpportunityAction =
  | 'POOL'
  | 'HOLD'
  | 'DROP'
  | 'LEND'
  | 'BORROW'
  | 'LONG'
  | 'SHORT'
  | 'SWAP'
  | 'STAKE'

export type OpportunitySort =
  | 'apr'
  | 'tvl'
  | 'rewards'
  | 'endingSoon'
  | 'startingSoon'

export type OpportunityListQuery = {
  search?: string
  chainId?: number
  protocol?: string
  action?: OpportunityAction
  status: OpportunityStatus
  minimumTvl?: number
  sort: OpportunitySort
  order: 'asc' | 'desc'
  page: number
}

export type ResourceSummary = {
  id: string
  name: string
  iconUrl: string | null
}

export type TokenSummary = {
  symbol: string
  iconUrl: string | null
}

export type OpportunityListItem = {
  id: string
  name: string
  description: string
  status: OpportunityStatus
  action: OpportunityAction
  apr: number
  nativeApr: number | null
  tvlUsd: number
  dailyRewardsUsd: number
  liveCampaigns: number
  chain: ResourceSummary
  protocol: ResourceSummary | null
  tokens: TokenSummary[]
}

export type OpportunityListResponse = {
  items: OpportunityListItem[]
  page: number
  pageSize: typeof OPPORTUNITY_PAGE_SIZE
  hasNextPage: boolean
}

export type CampaignSummary = {
  id: string
  campaignId: string
  type: string
  distributionType: string | null
  apr: number | null
  dailyRewardsUsd: number | null
  startTimestamp: number
  endTimestamp: number
  status: string | null
  creator: string | null
  rewardToken: {
    symbol: string
    name: string | null
    iconUrl: string | null
    priceUsd: number | null
  }
}

export type OpportunityDetail = OpportunityListItem & {
  howToSteps: string[]
  depositUrl: string | null
  explorerAddress: string | null
  campaigns: CampaignSummary[]
}
