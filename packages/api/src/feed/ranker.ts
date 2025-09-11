export interface UserSignals {
  likesOnPurchases: number;
  likesOnSocial: number;
  dwellOnPurchases: number;
  categoriesFav: string[];
  locationPreference?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
}

export interface RankingWeights {
  purchaseShareWeight: number;
  socialWeight: number;
}

export interface FeedItem {
  id: string;
  type: 'purchase' | 'social';
  score: number;
  userId: string;
  eventId?: string;
  categories: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
  timestamp: Date;
  metadata: Record<string, any>;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class FeedRanker {
  calculateWeights(userSignals: UserSignals): RankingWeights {
    const basePurchase = 0.30;
    const delta = clamp((userSignals.likesOnPurchases - userSignals.likesOnSocial) * 0.05, -0.1, 0.1);
    const purchaseShareWeight = clamp(basePurchase + delta, 0.2, 0.4);
    const socialWeight = 1 - purchaseShareWeight;

    return {
      purchaseShareWeight,
      socialWeight
    };
  }

  rankFeedItems(
    items: FeedItem[],
    userSignals: UserSignals,
    weights: RankingWeights
  ): FeedItem[] {
    const rankedItems = items.map(item => {
      let score = item.type === 'purchase' ? weights.purchaseShareWeight : weights.socialWeight;
      
      if (userSignals.locationPreference && item.location) {
        const distance = calculateDistance(
          userSignals.locationPreference.latitude,
          userSignals.locationPreference.longitude,
          item.location.latitude,
          item.location.longitude
        );
        
        if (distance <= userSignals.locationPreference.radius) {
          score += 0.2;
        }
      }
      
      const categoryMatch = item.categories.some(cat => 
        userSignals.categoriesFav.includes(cat)
      );
      if (categoryMatch) {
        score += 0.2;
      }
      
      const ageInHours = (Date.now() - item.timestamp.getTime()) / (1000 * 60 * 60);
      const freshnessBoost = Math.max(0, 1 - ageInHours / 24) * 0.1;
      score += freshnessBoost;

      return {
        ...item,
        score: clamp(score, 0, 1)
      };
    });

    return rankedItems.sort((a, b) => b.score - a.score);
  }
}