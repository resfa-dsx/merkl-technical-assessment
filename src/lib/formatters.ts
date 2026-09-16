const percentageFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
})

const compactUsdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
})

export function formatPercentage(value: number) {
  return `${percentageFormatter.format(value)}%`
}

export function formatUsd(value: number) {
  return compactUsdFormatter.format(value)
}
