// Flight search service

import { FlightsQuery } from '../schemas/validation';
import { FlightItineraryDTO } from '../types/api';
import { TravelpayoutsProvider } from '../providers/travelpayouts';
import { mapFlight } from '../mappers/travelpayouts';
import { cache, getCacheKey } from '../utils/cache';

const CACHE_TTL = 3600; // 1 hour in seconds (persisted to localStorage)

export class FlightService {
  private provider: TravelpayoutsProvider;

  constructor() {
    this.provider = new TravelpayoutsProvider();
  }

  async search(query: FlightsQuery): Promise<FlightItineraryDTO[]> {
    // Check cache
    const cacheKey = getCacheKey('flights', query);
    const cached = cache.get<FlightItineraryDTO[]>(cacheKey);

    if (cached) {
      console.log('Cache hit for flights:', cacheKey);
      return cached;
    }

    // Fetch from provider
    console.log('Cache miss for flights, fetching from provider:', query);
    const rawFlights = await this.provider.searchFlights(query);

    // Map to canonical format
    const flights = rawFlights.map((flight) => mapFlight(flight, query.currency));

    // Cache the result
    cache.set(cacheKey, flights, CACHE_TTL);

    return flights;
  }
}
