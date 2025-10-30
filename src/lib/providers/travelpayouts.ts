// Travelpayouts API Provider

import { FlightsQuery, HotelsQuery, LocationsQuery } from '../schemas/validation';
import { fetchWithRetry, buildQueryString } from '../utils/http';
import { ProviderError } from '../utils/errors';
import { getCityIdFromName, getCityIdFromIATA } from '../utils/hotelCityIds';
import { getIATACode } from '../utils/countryMappings';

const TP_MARKER = process.env.TP_MARKER || '678943';
const TP_TOKEN = process.env.TP_TOKEN || '';
const TP_API_BASE = process.env.TP_API_BASE || 'https://api.travelpayouts.com';

// Travelpayouts raw response types
export interface TravelpayoutsLocation {
  id?: number;
  type?: string;
  code?: string;
  name?: string;
  country_code?: string;
  city_name?: string;
  city_code?: string;
  coordinates?: {
    lat: number;
    lon: number;
  };
}

export interface TravelpayoutsFlight {
  origin: string;
  destination: string;
  origin_airport?: string;
  destination_airport?: string;
  departure_at: string;
  return_at?: string;
  price: number;
  duration: number;
  duration_to?: number;
  duration_back?: number;
  transfers: number;
  return_transfers?: number;
  flight_number?: string;
  airline?: string;
  link?: string;
}

export interface TravelpayoutsHotel {
  hotelId: number;
  hotelName: string;
  locationId?: number;
  location?: {
    name?: string;
    country?: string;
    state?: string | null;
    geo?: {
      lat: number;
      lon: number;
    };
  };
  stars?: number;
  priceFrom?: number;
  priceAvg?: number;
  pricePercentile?: Record<string, number>;
}

// Hotellook search response types
export interface HotellookSearchResponse {
  searchId: string;
  status: string;
}

export interface HotellookHotel {
  hotelId: number;
  hotelName: string;
  location: {
    lat: number;
    lon: number;
    name?: string;
  };
  stars?: number;
  priceFrom?: number;
  priceAvg?: number;
  photos?: Array<{
    url: string;
  }>;
}

export class TravelpayoutsProvider {
  private baseURL: string;
  private token: string;
  private marker: string;

  constructor() {
    this.baseURL = TP_API_BASE;
    this.token = TP_TOKEN;
    this.marker = TP_MARKER;

    if (!this.token) {
      console.warn('Warning: TP_TOKEN not set. API calls may fail.');
    }
  }

  async searchLocations(query: LocationsQuery): Promise<TravelpayoutsLocation[]> {
    try {
      const url = `https://autocomplete.travelpayouts.com/places2?${buildQueryString({
        term: query.q,
        locale: 'en',
        types: query.type === 'all' ? undefined : query.type,
      })}`;

      const response = await fetchWithRetry(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new ProviderError(
          `Travelpayouts locations API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      // Travelpayouts autocomplete returns array directly
      if (Array.isArray(data)) {
        return data.slice(0, query.limit);
      }

      return [];
    } catch (error) {
      if (error instanceof ProviderError) throw error;
      throw new ProviderError(
        `Failed to fetch locations: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { originalError: error }
      );
    }
  }

  async searchFlights(query: FlightsQuery): Promise<TravelpayoutsFlight[]> {
    try {
      // Use Aviasales v3 API - prices_for_dates endpoint
      const params: Record<string, string> = {
        origin: query.origin,
        destination: query.destination,
        depart_date: query.date,
        currency: query.currency || 'EUR',
        token: this.token,
      };

      // Add return date for round trips
      if (query.return_date) {
        params.return_date = query.return_date;
      }

      const url = `${this.baseURL}/aviasales/v3/prices_for_dates?${buildQueryString(params)}`;

      console.log(`🔍 Searching flights: ${query.origin} → ${query.destination} (${query.date} to ${query.return_date || 'one-way'})`);

      const response = await fetchWithRetry(url, {
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Token': this.token,
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unable to read error');
        console.error(`Aviasales API error: ${errorText}`);
        throw new ProviderError(
          `Aviasales flights API error: ${response.status} ${response.statusText}`,
          { responseBody: errorText }
        );
      }

      const response_data = await response.json();

      // Aviasales v3 returns { data: [ ... ], currency: "EUR" }
      const offers = response_data.data || [];

      if (Array.isArray(offers) && offers.length > 0) {
        const allFlights: TravelpayoutsFlight[] = offers.map((offer: Record<string, unknown>) => {
          const departureDate = offer.departure_at as string;
          const returnDate = offer.return_at as string | undefined;

          return {
            origin: (offer.origin as string) || query.origin,
            destination: (offer.destination as string) || query.destination,
            origin_airport: (offer.origin as string) || query.origin,
            destination_airport: (offer.destination as string) || query.destination,
            departure_at: departureDate,
            return_at: returnDate,
            price: (offer.price as number) || 0,
            duration: (offer.duration as number) || 180,
            duration_to: (offer.duration_to as number) || (offer.duration as number) || 180,
            duration_back: (offer.duration_back as number) || (offer.duration as number) || 180,
            transfers: (offer.transfers as number) || 0,
            return_transfers: (offer.return_transfers as number) || 0,
            flight_number: String(offer.flight_number || ''),
            airline: (offer.airline as string) || '',
            link: (offer.link as string) || undefined,
          };
        });

        // Sort by price
        allFlights.sort((a, b) => a.price - b.price);

        const limitedFlights = allFlights.slice(0, query.pageSize || 50);
        console.log(`✅ Found ${limitedFlights.length} flights from Aviasales v3`);
        return limitedFlights;
      }

      console.warn(`⚠️ No flight data available for ${query.origin} → ${query.destination}`);
      return [];

    } catch (error) {
      if (error instanceof ProviderError) {
        throw error;
      }
      console.error('Flights API error:', error);
      throw new ProviderError(
        `Failed to fetch flights: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { originalError: error }
      );
    }
  }

  async searchHotels(query: HotelsQuery): Promise<TravelpayoutsHotel[]> {
    try {
      // Hotels are optional - if we can't find them, flights still work
      // Get cityId from our hardcoded mapping
      let cityId: number | null = query.locationId || null;

      if (!cityId && query.location) {
        // First try direct city name lookup
        cityId = getCityIdFromName(query.location);

        // If not found, try converting to IATA code first
        if (!cityId) {
          const iataCode = getIATACode(query.location);
          cityId = getCityIdFromIATA(iataCode);
        }
      }

      if (!cityId) {
        console.warn(`⚠️ Cannot search hotels without cityId for ${query.location}`);
        console.log(`💡 Tip: Add ${query.location} to hotelCityIds.ts mapping if hotels are needed for this city`);
        return [];
      }

      // IMPORTANT: The Hotellook hotel search API requires special access
      // The free tier only provides static hotel data, not live pricing
      // For now, we'll return empty and focus on flights
      // To enable hotels, contact Travelpayouts support for API access

      console.warn(`⚠️ Hotel search not available - Hotellook API requires special access`);
      console.log(`💡 Flights API (Aviasales) works great! Hotels require upgraded API access from Travelpayouts`);
      console.log(`   Contact: https://support.travelpayouts.com`);
      return [];

      /* KEEPING THIS CODE FOR WHEN YOU GET API ACCESS:
      const params: Record<string, string> = {
        cityId: cityId.toString(),
        checkIn: query.checkIn,
        checkOut: query.checkOut,
        currency: query.currency || 'EUR',
        limit: (query.pageSize || 20).toString(),
        token: this.token,
      };

      const url = `https://engine.hotellook.com/api/v2/cache.json?${buildQueryString(params)}`;

      console.log(`🏨 Fetching hotels for cityId ${cityId} (${query.checkIn} to ${query.checkOut})`);

      const response = await fetchWithRetry(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unable to read error');
        console.warn(`⚠️ Hotel search failed (${response.status}): ${errorText}`);
        console.log(`This may mean the cityId format is incorrect or hotels data is not available for this city`);
        return [];
      }

      const data = await response.json();
      console.log(`📦 Hotel API response structure:`, Object.keys(data));

      // Process hotel results - try different response structures
      let hotelsList: Record<string, unknown>[] = [];

      if (data.hotels && Array.isArray(data.hotels)) {
        hotelsList = data.hotels;
      } else if (Array.isArray(data)) {
        hotelsList = data;
      } else if (data.results && Array.isArray(data.results)) {
        hotelsList = data.results;
      }

      if (hotelsList.length > 0) {
        const hotels: TravelpayoutsHotel[] = hotelsList.map((hotel: Record<string, unknown>) => ({
          hotelId: (hotel.id as number) || (hotel.hotelId as number) || 0,
          hotelName: (hotel.name as string) || (hotel.hotelName as string) || 'Unknown Hotel',
          locationId: cityId as number,
          location: {
            name: query.location,
            geo: {
              lat: (hotel.lat as number) || (hotel.latitude as number) || 0,
              lon: (hotel.lng as number) || (hotel.longitude as number) || (hotel.lon as number) || 0,
            },
          },
          stars: (hotel.stars as number),
          priceFrom: (hotel.price as number) || (hotel.price_per_night as number) || (hotel.priceFrom as number),
          priceAvg: (hotel.price as number) || (hotel.priceAvg as number),
        }));

        console.log(`✅ Found ${hotels.length} hotels from Hotellook`);
        return hotels;
      }

      console.warn('⚠️ No hotels found in response');
      return [];
      */

    } catch (error) {
      console.error('Hotel search error:', error);
      return [];
    }
  }
}
