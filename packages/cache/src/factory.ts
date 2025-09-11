import { CacheProvider, CacheConfig } from './types';
import { MemoryCache } from './memory';

export class CacheFactory {
  static create(config: CacheConfig): CacheProvider {
    switch (config.provider) {
      case 'memory':
        return new MemoryCache(config.maxSize, config.defaultTTL);
      case 'redis':
        throw new Error('Redis cache not implemented yet. Use memory cache instead.');
      default:
        throw new Error(`Unknown cache provider: ${config.provider}`);
    }
  }

  static createDefault(): CacheProvider {
    return new MemoryCache();
  }
}