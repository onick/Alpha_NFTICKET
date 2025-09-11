export interface FeatureFlags {
  ticketing: {
    nftEnabled: boolean;
    classicEnabled: boolean;
  };
  feed: {
    personalizedRanking: boolean;
    socialSignals: boolean;
  };
  cache: {
    provider: 'memory' | 'redis';
    enabled: boolean;
  };
  blockchain: {
    networks: string[];
    defaultNetwork: string;
  };
}

export const defaultFeatures: FeatureFlags = {
  ticketing: {
    nftEnabled: false,
    classicEnabled: true,
  },
  feed: {
    personalizedRanking: true,
    socialSignals: true,
  },
  cache: {
    provider: 'memory',
    enabled: true,
  },
  blockchain: {
    networks: ['polygon', 'mumbai'],
    defaultNetwork: 'mumbai',
  },
};

export class FeatureFlagManager {
  private flags: FeatureFlags;

  constructor(overrides: Partial<FeatureFlags> = {}) {
    this.flags = this.mergeFlags(defaultFeatures, overrides);
  }

  isEnabled(path: string): boolean {
    const keys = path.split('.');
    let current: any = this.flags;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return false;
      }
    }
    
    return Boolean(current);
  }

  getFlag<T>(path: string): T {
    const keys = path.split('.');
    let current: any = this.flags;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        throw new Error(`Feature flag path not found: ${path}`);
      }
    }
    
    return current as T;
  }

  private mergeFlags(base: FeatureFlags, overrides: Partial<FeatureFlags>): FeatureFlags {
    return {
      ticketing: { ...base.ticketing, ...overrides.ticketing },
      feed: { ...base.feed, ...overrides.feed },
      cache: { ...base.cache, ...overrides.cache },
      blockchain: { ...base.blockchain, ...overrides.blockchain },
    };
  }
}