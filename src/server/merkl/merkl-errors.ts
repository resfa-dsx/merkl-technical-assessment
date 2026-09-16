import '@tanstack/react-start/server-only'

export type MerklClientErrorCode =
  | 'NOT_FOUND'
  | 'UPSTREAM_TIMEOUT'
  | 'UPSTREAM_UNAVAILABLE'
  | 'INVALID_RESPONSE'

type MerklClientErrorOptions = {
  cause?: unknown
  upstreamStatus?: number
}

export class MerklClientError extends Error {
  readonly code: MerklClientErrorCode
  readonly upstreamStatus?: number

  constructor(
    code: MerklClientErrorCode,
    message: string,
    options: MerklClientErrorOptions = {},
  ) {
    super(
      message,
      options.cause === undefined ? undefined : { cause: options.cause },
    )
    this.name = 'MerklClientError'
    this.code = code
    this.upstreamStatus = options.upstreamStatus
  }
}
