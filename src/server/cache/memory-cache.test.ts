import { describe, expect, it, vi } from 'vitest'

import { MemoryCache } from './memory-cache'

describe('MemoryCache', () => {
  it('returns a cached value before its TTL expires', async () => {
    let now = 0
    const cache = new MemoryCache(10, () => now)
    const load = vi.fn().mockResolvedValue('value')

    expect(await cache.getOrSet('key', 1_000, load)).toBe('value')
    now = 999
    expect(await cache.getOrSet('key', 1_000, load)).toBe('value')
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('loads a fresh value after its TTL expires', async () => {
    let now = 0
    const cache = new MemoryCache(10, () => now)
    const load = vi
      .fn()
      .mockResolvedValueOnce('first')
      .mockResolvedValueOnce('second')

    expect(await cache.getOrSet('key', 1_000, load)).toBe('first')
    now = 1_000
    expect(await cache.getOrSet('key', 1_000, load)).toBe('second')
    expect(load).toHaveBeenCalledTimes(2)
  })

  it('evicts the oldest entry when it reaches its limit', async () => {
    const cache = new MemoryCache(2)
    const reloadFirst = vi.fn().mockResolvedValue('first reloaded')

    await cache.getOrSet('first', 1_000, async () => 'first')
    await cache.getOrSet('second', 1_000, async () => 'second')
    await cache.getOrSet('third', 1_000, async () => 'third')

    expect(cache.size).toBe(2)
    expect(await cache.getOrSet('first', 1_000, reloadFirst)).toBe(
      'first reloaded',
    )
    expect(reloadFirst).toHaveBeenCalledOnce()
  })

  it('deduplicates simultaneous loads for the same key', async () => {
    const cache = new MemoryCache(10)
    let resolveLoad!: (value: string) => void
    const load = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveLoad = resolve
        }),
    )

    const first = cache.getOrSet('key', 1_000, load)
    const second = cache.getOrSet('key', 1_000, load)

    expect(load).toHaveBeenCalledOnce()
    resolveLoad('value')
    await expect(Promise.all([first, second])).resolves.toEqual([
      'value',
      'value',
    ])
  })
})
