// Hotel search service

import { HotelsQuery } from '../schemas/validation';
import { HotelDTO } from '../types/api';
import { TravelpayoutsProvider } from '../providers/travelpayouts';
import { mapHotel } from '../mappers/travelpayouts';
import { cache, getCacheKey } from '../utils/cache';

const CACHE_TTL = 3600; // 1 hour in seconds (persisted to localStorage)

export class HotelService {
  private provider: TravelpayoutsProvider;

  constructor() {
    this.provider = new TravelpayoutsProvider();
  }

  async search(query: HotelsQuery): Promise<HotelDTO[]> {
    // Check cache
    const cacheKey = getCacheKey('hotels', query);
    const cached = cache.get<HotelDTO[]>(cacheKey);

    if (cached) {
      console.log('Cache hit for hotels:', cacheKey);
      return cached;
    }

    // Fetch from provider
    console.log('Cache miss for hotels, fetching from provider:', query);
    const rawHotels = await this.provider.searchHotels(query);

    // Map to canonical format
    const hotels = rawHotels.map((hotel) => mapHotel(hotel, query.currency));

    // Cache the result
    cache.set(cacheKey, hotels, CACHE_TTL);

    return hotels;
  }
}
