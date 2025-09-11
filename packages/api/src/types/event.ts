export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  timezone: string;
  venue: string;
  isOnline: boolean;
  category: string;
  tags: string[];
  coverImage: string;
  images: string[];
  ticketTypes: TicketType[];
  maxCapacity: number;
  status: EventStatus;
  organizerId: string;
  organizer?: Organizer;
  viewCount: number;
  shareCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface TicketType {
  _id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  totalQuantity: number;
  availableQuantity: number;
  maxQuantityPerOrder: number;
  isActive: boolean;
  salesStart?: string;
  salesEnd?: string;
}

export interface Organizer {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
  verified: boolean;
  createdAt: string;
}

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  ENDED = 'ended',
  SOLD_OUT = 'sold_out'
}

export enum EventCategory {
  MUSIC = 'music',
  SPORTS = 'sports', 
  TECHNOLOGY = 'technology',
  ARTS = 'arts',
  BUSINESS = 'business',
  ENTERTAINMENT = 'entertainment',
  EDUCATION = 'education',
  FOOD = 'food',
  HEALTH = 'health',
  OTHER = 'other'
}

export interface EventFilters {
  category?: EventCategory;
  priceRange?: {
    min: number;
    max: number;
  };
  dateRange?: {
    start: string;
    end: string;
  };
  location?: string;
  isOnline?: boolean;
  search?: string;
}

export interface EventSummary {
  id: string;
  title: string;
  coverImage: string;
  startDateTime: string;
  venue: string;
  isOnline: boolean;
  category: string;
  minPrice: number;
  maxPrice: number;
  currency: string;
  availableTickets: number;
  totalCapacity: number;
  organizer: {
    name: string;
    verified: boolean;
  };
}