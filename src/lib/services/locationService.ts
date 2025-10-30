// Location search service

import { LocationsQuery } from '../schemas/validation';
import { LocationDTO } from '../types/api';
import { TravelpayoutsProvider } from '../providers/travelpayouts';
import { mapLocation } from '../mappers/travelpayouts';
import { cache, getCacheKey } from '../utils/cache';

const CACHE_TTL = 24 * 60 * 60; // 24 hours in seconds

export class LocationService {
  private provider: TravelpayoutsProvider;

  constructor() {
    this.provider = new TravelpayoutsProvider();
  }

  async search(query: LocationsQuery): Promise<LocationDTO[]> {
    // Check cache
    const cacheKey = getCacheKey('locations', query);
    const cached = cache.get<LocationDTO[]>(cacheKey);

    if (cached) {
      console.log('Cache hit for locations:', cacheKey);
      return cached;
    }

    // Fetch from provider
    console.log('Cache miss for locations, fetching from provider:', query);
    const rawLocations = await this.provider.searchLocations(query);

    // Map to canonical format
    const locations = rawLocations.map(mapLocation);

    // Cache the result
    cache.set(cacheKey, locations, CACHE_TTL);

    return locations;
  }
}
