import '@tanstack/react-start/server-only'

import { z } from 'zod'

const merklOpportunityStatusSchema = z.enum(['NONE', 'PAST', 'LIVE', 'SOON'])

const merklOpportunityActionSchema = z.enum([
  'POOL',
  'HOLD',
  'DROP',
  'LEND',
  'BORROW',
  'LONG',
  'SHORT',
  'SWAP',
  'INVALID',
  'STAKE',
])

const merklIconSchema = z.string().nullish()

const merklChainSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  icon: merklIconSchema,
})

const merklProtocolSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: merklIconSchema,
})

const merklTokenSummarySchema = z.object({
  symbol: z.string(),
  icon: merklIconSchema,
})

const merklRewardTokenSchema = merklTokenSummarySchema.extend({
  name: z.string().nullable(),
  price: z.number().nullable().optional(),
})

const merklTimestampSchema = z.union([z.string(), z.number(), z.bigint()])

export const merklOpportunitySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  status: merklOpportunityStatusSchema,
  action: merklOpportunityActionSchema,
  apr: z.number(),
  nativeApr: z.number().optional(),
  tvl: z.number(),
  dailyRewards: z.number(),
  liveCampaigns: z.number(),
  chain: merklChainSchema,
  protocol: merklProtocolSchema.nullable().optional(),
  tokens: z.array(merklTokenSummarySchema),
})

export const merklOpportunityListSchema = z.array(
  merklOpportunitySchema.nullable(),
)

const merklCampaignSchema = z.object({
  id: z.string(),
  campaignId: z.string(),
  type: z.string(),
  distributionType: z.string().optional(),
  apr: z.number().optional(),
  dailyRewards: z.number().optional(),
  startTimestamp: merklTimestampSchema,
  endTimestamp: merklTimestampSchema,
  creatorAddress: z.string(),
  creator: z
    .object({
      address: z.string(),
    })
    .optional(),
  campaignStatus: z.object({
    status: z.string(),
  }),
  rewardToken: merklRewardTokenSchema,
})

export const merklOpportunityDetailSchema = merklOpportunitySchema.extend({
  howToSteps: z.array(z.string()),
  depositUrl: z.string().optional(),
  explorerAddress: z.string().optional(),
  campaigns: z.array(merklCampaignSchema),
})

export type MerklOpportunity = z.infer<typeof merklOpportunitySchema>
export type MerklOpportunityList = z.infer<typeof merklOpportunityListSchema>
export type MerklOpportunityDetail = z.infer<
  typeof merklOpportunityDetailSchema
>
