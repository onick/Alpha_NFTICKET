import { FeedRanker, UserSignals, FeedItem } from '../src/feed/ranker';

describe('FeedRanker', () => {
  let ranker: FeedRanker;

  beforeEach(() => {
    ranker = new FeedRanker();
  });

  describe('calculateWeights', () => {
    it('should return base weights when signals are equal', () => {
      const userSignals: UserSignals = {
        likesOnPurchases: 10,
        likesOnSocial: 10,
        dwellOnPurchases: 100,
        categoriesFav: ['music', 'sports']
      };

      const weights = ranker.calculateWeights(userSignals);
      
      expect(weights.purchaseShareWeight).toBe(0.30);
      expect(weights.socialWeight).toBe(0.70);
    });

    it('should increase purchase weight when user likes purchases more', () => {
      const userSignals: UserSignals = {
        likesOnPurchases: 20,
        likesOnSocial: 10,
        dwellOnPurchases: 200,
        categoriesFav: ['music']
      };

      const weights = ranker.calculateWeights(userSignals);
      
      expect(weights.purchaseShareWeight).toBeGreaterThan(0.30);
      expect(weights.socialWeight).toBeLessThan(0.70);
    });

    it('should clamp weights within bounds', () => {
      const userSignals: UserSignals = {
        likesOnPurchases: 100,
        likesOnSocial: 0,
        dwellOnPurchases: 1000,
        categoriesFav: ['music']
      };

      const weights = ranker.calculateWeights(userSignals);
      
      expect(weights.purchaseShareWeight).toBeLessThanOrEqual(0.4);
      expect(weights.socialWeight).toBeGreaterThanOrEqual(0.6);
    });
  });
});