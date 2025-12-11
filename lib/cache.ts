// Simple in-memory cache with TTL
const cache = new Map<string, { data: any; expires: number }>()

export function getCached<T>(key: string): T | null {
  const cached = cache.get(key)
  if (!cached) return null

  if (Date.now() > cached.expires) {
    cache.delete(key)
    return null
  }

  return cached.data as T
}

export function setCache<T>(key: string, data: T, ttlSeconds: number): void {
  cache.set(key, {
    data,
    expires: Date.now() + ttlSeconds * 1000,
  })
}

export function clearCache(key?: string): void {
  if (key) {
    cache.delete(key)
  } else {
    cache.clear()
  }
}

// Cleanup expired entries periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of cache.entries()) {
      if (now > value.expires) {
        cache.delete(key)
      }
    }
  }, 60000) // Every minute
}
