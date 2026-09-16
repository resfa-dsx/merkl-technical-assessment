import { describe, expect, it } from 'vitest'

import {
  mapMerklOpportunityDetail,
  mapMerklOpportunityList,
} from './merkl-mappers'
import {
  merklOpportunityDetailSchema,
  merklOpportunityListSchema,
} from './merkl-schemas'

const opportunityPayload = {
  id: '11521673201667687989',
  name: 'USDC lending market',
  description: 'Lend USDC and earn incentives.',
  status: 'LIVE',
  action: 'LEND',
  apr: 4.75,
  nativeApr: 2.1,
  tvl: 629_100_000,
  dailyRewards: 69_400,
  liveCampaigns: 1,
  chain: {
    id: 1,
    name: 'Ethereum',
    icon: 'not-a-valid-url',
  },
  protocol: null,
  tokens: [
    {
      symbol: 'USDC',
      icon: '',
    },
  ],
  ignoredUpstreamField: 'not exposed',
} as const

describe('mapMerklOpportunityList', () => {
  it('maps the consumed fields and normalizes missing imagery', () => {
    const opportunities = merklOpportunityListSchema.parse([
      opportunityPayload,
      null,
    ])

    expect(mapMerklOpportunityList(opportunities, 2)).toEqual({
      items: [
        {
          id: '11521673201667687989',
          name: 'USDC lending market',
          description: 'Lend USDC and earn incentives.',
          status: 'LIVE',
          action: 'LEND',
          apr: 4.75,
          nativeApr: 2.1,
          tvlUsd: 629_100_000,
          dailyRewardsUsd: 69_400,
          liveCampaigns: 1,
          chain: {
            id: '1',
            name: 'Ethereum',
            iconUrl: null,
          },
          protocol: null,
          tokens: [{ symbol: 'USDC', iconUrl: null }],
        },
      ],
      page: 2,
      pageSize: 20,
      hasNextPage: false,
    })
  })

  it('uses the upstream page length to determine whether a next page exists', () => {
    const opportunities = merklOpportunityListSchema.parse(
      Array.from({ length: 20 }, () => opportunityPayload),
    )

    expect(mapMerklOpportunityList(opportunities, 0).hasNextPage).toBe(true)
  })
})

describe('mapMerklOpportunityDetail', () => {
  it('preserves campaign and reward-token relationships', () => {
    const opportunity = merklOpportunityDetailSchema.parse({
      ...opportunityPayload,
      protocol: {
        id: 'aave',
        name: 'Aave',
        icon: 'https://cdn.example.com/aave.png',
      },
      howToSteps: ['Supply USDC to the market.'],
      depositUrl: 'https://app.example.com/deposit',
      explorerAddress: '0x35Cbe8542E70fa2f7F9cDF129F19e593F4b4f560',
      campaigns: [
        {
          id: '9876543210987654321',
          campaignId:
            '0x93cf385c2a446a7596820601caf25e63bfc4939efa9a89a6f21563b58ee54eb1',
          type: 'AAVE_SUPPLY',
          distributionType: 'DUTCH_AUCTION',
          apr: 2.65,
          dailyRewards: 1_250,
          startTimestamp: '1725000000',
          endTimestamp: 1_730_000_000,
          creatorAddress: '0x35Cbe8542E70fa2f7F9cDF129F19e593F4b4f560',
          campaignStatus: { status: 'PROCESSING' },
          rewardToken: {
            symbol: 'MERKL',
            name: 'Merkl',
            icon: 'https://cdn.example.com/merkl.png',
            price: 0.42,
          },
          params: { ignored: true },
        },
      ],
    })

    const result = mapMerklOpportunityDetail(opportunity)

    expect(result.protocol).toEqual({
      id: 'aave',
      name: 'Aave',
      iconUrl: 'https://cdn.example.com/aave.png',
    })
    expect(result.campaigns).toEqual([
      {
        id: '9876543210987654321',
        campaignId:
          '0x93cf385c2a446a7596820601caf25e63bfc4939efa9a89a6f21563b58ee54eb1',
        type: 'AAVE_SUPPLY',
        distributionType: 'DUTCH_AUCTION',
        apr: 2.65,
        dailyRewardsUsd: 1_250,
        startTimestamp: 1_725_000_000,
        endTimestamp: 1_730_000_000,
        status: 'PROCESSING',
        creator: '0x35Cbe8542E70fa2f7F9cDF129F19e593F4b4f560',
        rewardToken: {
          symbol: 'MERKL',
          name: 'Merkl',
          iconUrl: 'https://cdn.example.com/merkl.png',
          priceUsd: 0.42,
        },
      },
    ])
  })

  it('keeps optional campaign metrics explicit when Merkl omits them', () => {
    const opportunity = merklOpportunityDetailSchema.parse({
      ...opportunityPayload,
      howToSteps: [],
      campaigns: [
        {
          id: '1',
          campaignId: '0xdef',
          type: 'HOLD',
          startTimestamp: 1_725_000_000,
          endTimestamp: '1730000000',
          creatorAddress: '',
          campaignStatus: { status: '' },
          rewardToken: {
            symbol: 'POINTS',
            name: null,
            icon: null,
          },
        },
      ],
    })

    expect(mapMerklOpportunityDetail(opportunity).campaigns[0]).toMatchObject({
      distributionType: null,
      apr: null,
      dailyRewardsUsd: null,
      status: null,
      creator: null,
      rewardToken: {
        name: null,
        iconUrl: null,
        priceUsd: null,
      },
    })
  })
})
