export interface CacheEntry<T = any> {
  value: T;
  timestamp: number;
  ttl: number;
}

export interface CacheProvider {
  get<T = any>(key: string): Promise<T | null>;
  set<T = any>(key: string, value: T, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
}

export interface CacheConfig {
  defaultTTL: number;
  maxSize?: number;
  provider: 'memory' | 'redis';
}