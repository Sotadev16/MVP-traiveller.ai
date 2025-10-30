// Hybrid cache with localStorage persistence and in-memory fallback

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class Cache {
  private memoryStore: Map<string, CacheEntry<unknown>> = new Map();
  private readonly STORAGE_PREFIX = 'traiveller_cache_';

  private isLocalStorageAvailable(): boolean {
    try {
      return typeof window !== 'undefined' && window.localStorage !== undefined;
    } catch {
      return false;
    }
  }

  set<T>(key: string, data: T, ttlSeconds: number): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    const entry: CacheEntry<T> = { data, expiresAt };

    // Store in memory
    this.memoryStore.set(key, entry);

    // Also store in localStorage if available
    if (this.isLocalStorageAvailable()) {
      try {
        localStorage.setItem(
          `${this.STORAGE_PREFIX}${key}`,
          JSON.stringify(entry)
        );
      } catch (error) {
        console.warn('Failed to save to localStorage:', error);
      }
    }
  }

  get<T>(key: string): T | null {
    const now = Date.now();

    // First check memory cache
    const memoryEntry = this.memoryStore.get(key);
    if (memoryEntry && now <= memoryEntry.expiresAt) {
      return memoryEntry.data as T;
    }

    // Then check localStorage
    if (this.isLocalStorageAvailable()) {
      try {
        const stored = localStorage.getItem(`${this.STORAGE_PREFIX}${key}`);
        if (stored) {
          const entry: CacheEntry<T> = JSON.parse(stored);

          // Check if expired
          if (now > entry.expiresAt) {
            localStorage.removeItem(`${this.STORAGE_PREFIX}${key}`);
            this.memoryStore.delete(key);
            return null;
          }

          // Restore to memory cache
          this.memoryStore.set(key, entry);
          return entry.data;
        }
      } catch (error) {
        console.warn('Failed to read from localStorage:', error);
      }
    }

    return null;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.memoryStore.delete(key);

    if (this.isLocalStorageAvailable()) {
      try {
        localStorage.removeItem(`${this.STORAGE_PREFIX}${key}`);
      } catch (error) {
        console.warn('Failed to delete from localStorage:', error);
      }
    }
  }

  clear(): void {
    this.memoryStore.clear();

    if (this.isLocalStorageAvailable()) {
      try {
        // Remove all cache keys from localStorage
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(this.STORAGE_PREFIX)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      } catch (error) {
        console.warn('Failed to clear localStorage:', error);
      }
    }
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();

    // Cleanup memory
    for (const [key, entry] of this.memoryStore.entries()) {
      if (now > entry.expiresAt) {
        this.memoryStore.delete(key);
      }
    }

    // Cleanup localStorage
    if (this.isLocalStorageAvailable()) {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const storageKey = localStorage.key(i);
          if (storageKey && storageKey.startsWith(this.STORAGE_PREFIX)) {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
              const entry: CacheEntry<unknown> = JSON.parse(stored);
              if (now > entry.expiresAt) {
                keysToRemove.push(storageKey);
              }
            }
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      } catch (error) {
        console.warn('Failed to cleanup localStorage:', error);
      }
    }
  }

  getStats() {
    return {
      memorySize: this.memoryStore.size,
      memoryKeys: Array.from(this.memoryStore.keys()),
    };
  }
}

// Global cache instance
export const cache = new Cache();

// Run cleanup every 5 minutes on server-side
if (typeof window === 'undefined') {
  setInterval(() => {
    cache.cleanup();
  }, 5 * 60 * 1000);
}

// Run cleanup on page load and visibility change (client-side)
if (typeof window !== 'undefined') {
  // Cleanup on load
  cache.cleanup();

  // Cleanup when page becomes visible
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      cache.cleanup();
    }
  });
}

// Helper to generate cache keys
export function getCacheKey(prefix: string, params: Record<string, unknown>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  return `${prefix}:${sortedParams}`;
}
