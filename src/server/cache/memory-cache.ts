import '@tanstack/react-start/server-only'

type CacheEntry = {
  value: unknown
  expiresAt: number
}

export class MemoryCache {
  private readonly entries = new Map<string, CacheEntry>()
  private readonly inFlight = new Map<string, Promise<unknown>>()

  constructor(
    private readonly maxEntries: number,
    private readonly now: () => number = Date.now,
  ) {
    if (!Number.isInteger(maxEntries) || maxEntries < 1) {
      throw new RangeError('maxEntries must be a positive integer')
    }
  }

  get size() {
    return this.entries.size
  }

  getOrSet<T>(
    key: string,
    ttlMs: number,
    load: () => Promise<T>,
  ): Promise<T> {
    const cached = this.entries.get(key)

    if (cached !== undefined) {
      if (cached.expiresAt > this.now()) {
        return Promise.resolve(cached.value as T)
      }

      this.entries.delete(key)
    }

    const pending = this.inFlight.get(key)

    if (pending !== undefined) {
      return pending as Promise<T>
    }

    const request = load()
      .then((value) => {
        this.set(key, value, ttlMs)
        return value
      })
      .finally(() => {
        this.inFlight.delete(key)
      })

    this.inFlight.set(key, request)
    return request
  }

  clear() {
    this.entries.clear()
    this.inFlight.clear()
  }

  private set(key: string, value: unknown, ttlMs: number) {
    this.deleteExpiredEntries()
    this.entries.delete(key)

    while (this.entries.size >= this.maxEntries) {
      const oldestKey = this.entries.keys().next().value

      if (oldestKey === undefined) {
        break
      }

      this.entries.delete(oldestKey)
    }

    this.entries.set(key, {
      value,
      expiresAt: this.now() + ttlMs,
    })
  }

  private deleteExpiredEntries() {
    const now = this.now()

    for (const [key, entry] of this.entries) {
      if (entry.expiresAt <= now) {
        this.entries.delete(key)
      }
    }
  }
}
