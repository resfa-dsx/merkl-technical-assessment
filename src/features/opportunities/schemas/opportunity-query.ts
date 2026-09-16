import { z } from 'zod'

const emptyStringToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value

const optionalString = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().min(1).optional(),
)

const optionalNumber = z.preprocess(
  emptyStringToUndefined,
  z.coerce.number().nonnegative().optional(),
)

const opportunityActionSchema = z.enum([
  'POOL',
  'HOLD',
  'DROP',
  'LEND',
  'BORROW',
  'LONG',
  'SHORT',
  'SWAP',
  'STAKE',
])

const opportunityStatusSchema = z.enum(['LIVE', 'SOON', 'PAST'])
const opportunitySortSchema = z.enum([
  'apr',
  'tvl',
  'rewards',
  'endingSoon',
  'startingSoon',
])
const opportunityOrderSchema = z.enum(['asc', 'desc'])
const chainIdSchema = z.coerce
  .number()
  .int()
  .positive()
  .max(Number.MAX_SAFE_INTEGER)
const pageSchema = z.coerce
  .number()
  .int()
  .nonnegative()
  .max(Number.MAX_SAFE_INTEGER)

export const opportunityListQuerySchema = z.object({
  search: optionalString,
  chainId: z.preprocess(
    emptyStringToUndefined,
    chainIdSchema.optional(),
  ),
  protocol: optionalString,
  action: z.preprocess(
    emptyStringToUndefined,
    opportunityActionSchema.optional(),
  ),
  status: opportunityStatusSchema.default('LIVE'),
  minimumTvl: optionalNumber,
  sort: opportunitySortSchema.default('apr'),
  order: opportunityOrderSchema.default('desc'),
  page: pageSchema.default(0),
})

export const opportunitySearchSchema = z.object({
  search: optionalString.catch(undefined),
  chainId: z
    .preprocess(emptyStringToUndefined, chainIdSchema.optional())
    .catch(undefined),
  protocol: optionalString.catch(undefined),
  action: z
    .preprocess(emptyStringToUndefined, opportunityActionSchema.optional())
    .catch(undefined),
  status: opportunityStatusSchema.default('LIVE').catch('LIVE'),
  minimumTvl: optionalNumber.catch(undefined),
  sort: opportunitySortSchema.default('apr').catch('apr'),
  order: opportunityOrderSchema.default('desc').catch('desc'),
  page: pageSchema.default(0).catch(0),
})

export const opportunityIdSchema = z.string().regex(/^\d{1,20}$/)
