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

export const opportunityListQuerySchema = z.object({
  search: optionalString,
  chainId: z.preprocess(
    emptyStringToUndefined,
    z.coerce.number().int().positive().max(Number.MAX_SAFE_INTEGER).optional(),
  ),
  protocol: optionalString,
  action: z.preprocess(
    emptyStringToUndefined,
    z
      .enum([
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
      .optional(),
  ),
  status: z.enum(['LIVE', 'SOON', 'PAST']).default('LIVE'),
  minimumTvl: optionalNumber,
  sort: z
    .enum(['apr', 'tvl', 'rewards', 'endingSoon', 'startingSoon'])
    .default('apr'),
  order: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce
    .number()
    .int()
    .nonnegative()
    .max(Number.MAX_SAFE_INTEGER)
    .default(0),
})

export const opportunityIdSchema = z.string().regex(/^\d{1,20}$/)
