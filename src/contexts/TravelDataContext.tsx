"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { FlightItineraryDTO, HotelDTO } from '@/lib/types/api';
import { POPULAR_DESTINATIONS, SUPPORTED_ORIGINS, getIATACode, getCityFromLocation, getCountryCode } from '@/lib/utils/countryMappings';

// Supported routes for our application (kept for backward compatibility)
const SUPPORTED_ROUTES = [
  // Netherlands departures
  { origin: 'AMS', destinations: ['BCN', 'FCO', 'CDG', 'LHR', 'MAD', 'BER', 'LIS', 'ATH', 'IST', 'RAK'] },
  { origin: 'EIN', destinations: ['BCN', 'FCO', 'CDG', 'LHR', 'MAD', 'BER', 'LIS'] },
  { origin: 'RTM', destinations: ['BCN', 'FCO', 'CDG', 'LHR', 'MAD'] },

  // Belgium departures
  { origin: 'BRU', destinations: ['BCN', 'FCO', 'CDG', 'LHR', 'MAD', 'BER', 'LIS', 'ATH', 'RAK'] },
];

const SUPPORTED_CITIES = [
  'Barcelona', 'Rome', 'Paris', 'London', 'Madrid',
  'Berlin', 'Lisbon', 'Athens', 'Istanbul', 'Marrakech'
];

interface CachedFlightData {
  [key: string]: { // key format: "ORIGIN-DESTINATION"
    data: FlightItineraryDTO[];
    lastFetched: number;
  };
}

interface CachedHotelData {
  [city: string]: {
    data: HotelDTO[];
    lastFetched: number;
  };
}

interface RouteOption {
  id: string;
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  destinationCountryCode?: string;
  flightCount: number;
  hotelCount: number;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  currency: string;
  dateRange: string;
  image: string;
}

interface CachedRouteData {
  routes: RouteOption[];
  lastFetched: number;
}

interface TravelDataContextType {
  flightData: CachedFlightData;
  hotelData: CachedHotelData;
  routeData: CachedRouteData | null;
  isLoading: boolean;
  isCached: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  getFlightsForRoute: (origin: string, destination: string) => FlightItineraryDTO[];
  getHotelsForCity: (city: string) => HotelDTO[];
  getRoutes: () => RouteOption[];
}

const TravelDataContext = createContext<TravelDataContextType | undefined>(undefined);

const CACHE_DURATION = 1000 * 60 * 60; // 1 hour
const CACHE_KEY = 'travel_data_cache';
const CACHE_TIMESTAMP_KEY = 'travel_data_cache_timestamp';

export function TravelDataProvider({ children }: { children: ReactNode }) {
  const [flightData, setFlightData] = useState<CachedFlightData>({});
  const [hotelData, setHotelData] = useState<CachedHotelData>({});
  const [routeData, setRouteData] = useState<CachedRouteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCached, setIsCached] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load cached data from localStorage
  const loadFromCache = useCallback(() => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cacheTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

      if (cachedData && cacheTimestamp) {
        const timestamp = parseInt(cacheTimestamp, 10);
        const now = Date.now();

        // Check if cache is still valid
        if (now - timestamp < CACHE_DURATION) {
          const parsed = JSON.parse(cachedData);
          setFlightData(parsed.flights || {});
          setHotelData(parsed.hotels || {});
          setRouteData(parsed.routes || null);
          setIsCached(true);
          console.log('✅ Loaded travel data from cache');
          return true;
        } else {
          console.log('⏰ Cache expired, will fetch fresh data');
        }
      }
    } catch (error) {
      console.error('Error loading cache:', error);
    }
    return false;
  }, []);

  // Save data to localStorage
  const saveToCache = useCallback((flights: CachedFlightData, hotels: CachedHotelData, routes: CachedRouteData | null) => {
    try {
      const data = {
        flights,
        hotels,
        routes,
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
      console.log('💾 Saved travel data to cache');
    } catch (error) {
      console.error('Error saving cache:', error);
    }
  }, []);

  // Fetch flight data for a specific route
  const fetchFlightsForRoute = async (origin: string, destination: string): Promise<FlightItineraryDTO[]> => {
    try {
      // Use dates 1 month from now
      const departDate = new Date();
      departDate.setDate(departDate.getDate() + 30);
      const returnDate = new Date(departDate);
      returnDate.setDate(returnDate.getDate() + 7);

      const params = new URLSearchParams({
        origin,
        destination,
        date: departDate.toISOString().split('T')[0],
        return_date: returnDate.toISOString().split('T')[0],
        adults: '2',
        children: '0',
        currency: 'EUR',
        pageSize: '20', // Get more results to cache
      });

      const response = await fetch(`/api/flights?${params}`, {
        cache: 'no-store',
      });

      const result = await response.json();

      if (result.ok && result.data) {
        console.log(`✅ Fetched ${result.data.length} flights for ${origin} → ${destination}`);
        return result.data;
      } else {
        console.warn(`⚠️ No flights for ${origin} → ${destination}`);
        return [];
      }
    } catch (error) {
      console.error(`Error fetching flights ${origin} → ${destination}:`, error);
      return [];
    }
  };

  // Fetch hotel data for a city
  const fetchHotelsForCity = async (city: string): Promise<HotelDTO[]> => {
    try {
      const checkIn = new Date();
      checkIn.setDate(checkIn.getDate() + 30);
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkOut.getDate() + 7);

      const params = new URLSearchParams({
        location: city,
        checkIn: checkIn.toISOString().split('T')[0],
        checkOut: checkOut.toISOString().split('T')[0],
        guests: '2',
        currency: 'EUR',
        pageSize: '20', // Get more results to cache
      });

      const response = await fetch(`/api/hotels?${params}`, {
        cache: 'no-store',
      });

      const result = await response.json();

      if (result.ok && result.data) {
        console.log(`✅ Fetched ${result.data.length} hotels for ${city}`);
        return result.data;
      } else {
        console.warn(`⚠️ No hotels for ${city}`);
        return [];
      }
    } catch (error) {
      console.error(`Error fetching hotels for ${city}:`, error);
      return [];
    }
  };

  // Fetch route summaries for multiple origin-destination combinations
  const fetchRouteSummaries = async (originsToFetch?: typeof SUPPORTED_ORIGINS): Promise<RouteOption[]> => {
    try {
      const routes: RouteOption[] = [];
      const today = new Date();
      const departDate = today.toISOString().split('T')[0];
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + 30);
      const returnDate = futureDate.toISOString().split('T')[0];

      // Use provided origins or default to base cities (to limit initial API calls)
      const origins = originsToFetch || SUPPORTED_ORIGINS.slice(0, 4); // Default: AMS, RTM, EIN, BRU

      console.log(`🌍 Fetching route summaries for ${origins.length} origins to ${POPULAR_DESTINATIONS.length} destinations...`);

      for (const originCity of origins) {
        for (const dest of POPULAR_DESTINATIONS) {
          try {
            // Skip if origin and destination are the same city
            if (originCity.iataCode === getIATACode(dest.city)) {
              console.log(`⏭️ Skipping ${originCity.city} → ${dest.city} (same city)`);
              continue;
            }

            const originCode = originCity.iataCode;
            const destinationCode = getIATACode(dest.city);
            const hotelCity = getCityFromLocation(dest.city);
            const countryCode = getCountryCode(dest.city);

            // Fetch flights for this route
            const flightParams = new URLSearchParams({
              origin: originCode,
              destination: destinationCode,
              date: departDate,
              return_date: returnDate,
              adults: '2',
              children: '0',
              currency: 'EUR',
              pageSize: '50',
            });

            const flightResponse = await fetch(`/api/flights?${flightParams}`, {
              cache: 'no-store',
            });
            const flightResult = await flightResponse.json();
            const flights = flightResult.ok && flightResult.data ? flightResult.data : [];

            // Fetch hotels for this destination
            const hotelParams = new URLSearchParams({
              location: hotelCity,
              checkIn: departDate,
              checkOut: returnDate,
              guests: '2',
              currency: 'EUR',
              pageSize: '50',
            });

            const hotelResponse = await fetch(`/api/hotels?${hotelParams}`, {
              cache: 'no-store',
            });
            const hotelResult = await hotelResponse.json();
            const hotels = hotelResult.ok && hotelResult.data ? hotelResult.data : [];

            if (flights.length > 0 || hotels.length > 0) {
              interface FlightWithPrice {
                price?: {
                  amount?: number;
                };
              }
              const prices = (flights as FlightWithPrice[]).map((f) => f.price?.amount || 0).filter((p: number) => p > 0);
              const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
              const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
              const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length) : 0;

              routes.push({
                id: `${originCode}-${destinationCode}`,
                origin: originCity.city,
                originCode,
                destination: hotelCity,
                destinationCode,
                destinationCountryCode: countryCode,
                flightCount: flights.length,
                hotelCount: hotels.length,
                minPrice,
                maxPrice,
                avgPrice,
                currency: 'EUR',
                dateRange: `${departDate} - ${returnDate}`,
                image: hotels[0]?.thumbnail || `https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`,
              });

              console.log(`✅ Route: ${originCity.city} → ${hotelCity}: ${flights.length} flights, ${hotels.length} hotels`);
            }

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 300));
          } catch (error) {
            console.error(`Failed to fetch route ${originCity.city} → ${dest.city}:`, error);
          }
        }
      }

      console.log(`✅ Total routes fetched: ${routes.length}`);
      return routes;
    } catch (error) {
      console.error('Error fetching route summaries:', error);
      return [];
    }
  };

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    console.log('🔄 Fetching all travel data...');
    setIsLoading(true);
    setError(null);

    const newFlightData: CachedFlightData = {};
    const newHotelData: CachedHotelData = {};

    try {
      // Fetch route summaries (primary data for results page)
      console.log('🌍 Fetching route summaries...');
      const routes = await fetchRouteSummaries();
      const newRouteData: CachedRouteData = {
        routes,
        lastFetched: Date.now(),
      };
      setRouteData(newRouteData);

      // OPTIONAL: Fetch individual flight/hotel data (for backward compatibility)
      // This can be skipped to save API calls since route summaries contain the data we need
      // Uncomment if you need the old caching behavior
      /*
      for (const route of SUPPORTED_ROUTES) {
        for (const destination of route.destinations) {
          const flights = await fetchFlightsForRoute(route.origin, destination);
          const key = `${route.origin}-${destination}`;
          newFlightData[key] = {
            data: flights,
            lastFetched: Date.now(),
          };
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      for (const city of SUPPORTED_CITIES) {
        const hotels = await fetchHotelsForCity(city);
        newHotelData[city] = {
          data: hotels,
          lastFetched: Date.now(),
        };
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      */

      setFlightData(newFlightData);
      setHotelData(newHotelData);
      saveToCache(newFlightData, newHotelData, newRouteData);
      setIsCached(true);

      console.log('✅ All travel data fetched successfully');
      console.log(`   - Routes: ${routes.length}`);
    } catch (err) {
      console.error('Error fetching travel data:', err);
      setError('Failed to fetch travel data');
    } finally {
      setIsLoading(false);
    }
  }, [saveToCache]);

  // Refresh data (public method)
  const refreshData = useCallback(async () => {
    console.log('🔄 Manual refresh requested');
    await fetchAllData();
  }, [fetchAllData]);

  // Get flights for a specific route
  const getFlightsForRoute = useCallback((origin: string, destination: string): FlightItineraryDTO[] => {
    const key = `${origin}-${destination}`;
    const cached = flightData[key];

    if (cached && cached.data.length > 0) {
      console.log(`📦 Retrieved ${cached.data.length} flights from cache: ${origin} → ${destination}`);
      return cached.data;
    }

    console.warn(`⚠️ No cached flights for ${origin} → ${destination}`);
    return [];
  }, [flightData]);

  // Get hotels for a specific city
  const getHotelsForCity = useCallback((city: string): HotelDTO[] => {
    const cached = hotelData[city];

    if (cached && cached.data.length > 0) {
      console.log(`📦 Retrieved ${cached.data.length} hotels from cache: ${city}`);
      return cached.data;
    }

    console.warn(`⚠️ No cached hotels for ${city}`);
    return [];
  }, [hotelData]);

  // Get route summaries
  const getRoutes = useCallback((): RouteOption[] => {
    if (routeData && routeData.routes.length > 0) {
      console.log(`📦 Retrieved ${routeData.routes.length} routes from cache`);
      return routeData.routes;
    }

    console.warn('⚠️ No cached route data');
    return [];
  }, [routeData]);

  // Initialize: load from cache or fetch new data
  // DISABLED AUTO-FETCH: User explicitly wants manual search only
  useEffect(() => {
    const hasCache = loadFromCache();

    // Always set loading to false, never auto-fetch
    setIsLoading(false);

    if (hasCache) {
      console.log('✅ Loaded travel data from cache (but not auto-fetching)');
    } else {
      console.log('⏭️ No cache found, but skipping auto-fetch (user must search manually)');
    }

    // REMOVED: Automatic fetchAllData() call
    // User must now manually trigger searches via the search form
  }, [loadFromCache]);

  const value: TravelDataContextType = {
    flightData,
    hotelData,
    routeData,
    isLoading,
    isCached,
    error,
    refreshData,
    getFlightsForRoute,
    getHotelsForCity,
    getRoutes,
  };

  return (
    <TravelDataContext.Provider value={value}>
      {children}
    </TravelDataContext.Provider>
  );
}

export function useTravelData() {
  const context = useContext(TravelDataContext);
  if (context === undefined) {
    throw new Error('useTravelData must be used within a TravelDataProvider');
  }
  return context;
}
