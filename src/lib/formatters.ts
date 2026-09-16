const percentageFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
})

const compactUsdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
})

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

export function formatPercentage(value: number) {
  return `${percentageFormatter.format(value)}%`
}

export function formatUsd(value: number) {
  return compactUsdFormatter.format(value)
}

export function formatUnixDate(timestamp: number) {
  return dateFormatter.format(new Date(timestamp * 1_000))
}
