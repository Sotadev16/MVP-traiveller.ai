// Zod validation schemas for API requests

import { z } from 'zod';

// Locations endpoint validation
export const locationsQuerySchema = z.object({
  q: z.string().min(1, 'Query string is required'),
  type: z.enum(['airport', 'city', 'hotel', 'all']).optional().default('all'),
  limit: z.coerce.number().int().min(1).max(20).optional().default(10),
});

export type LocationsQuery = z.infer<typeof locationsQuerySchema>;

// Flights endpoint validation
export const flightsQuerySchema = z.object({
  origin: z.string().length(3, 'Origin must be a 3-letter IATA code'),
  destination: z.string().length(3, 'Destination must be a 3-letter IATA code'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  return_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Return date must be in YYYY-MM-DD format').optional(),
  adults: z.coerce.number().int().min(1).max(9).optional().default(1),
  children: z.coerce.number().int().min(0).max(8).optional().default(0),
  infants: z.coerce.number().int().min(0).max(8).optional().default(0),
  cabin: z.enum(['economy', 'premium_economy', 'business', 'first']).optional().default('economy'),
  nonstop: z.coerce.boolean().optional().default(false),
  currency: z.string().length(3).optional().default('EUR'),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export type FlightsQuery = z.infer<typeof flightsQuerySchema>;

// Hotels endpoint validation
export const hotelsQuerySchema = z.object({
  location: z.string().optional(), // City name (e.g., "Barcelona,Spain" or "Amsterdam")
  locationId: z.coerce.number().int().optional(),
  lat: z.coerce.number().optional(),
  lon: z.coerce.number().optional(),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Check-in date must be in YYYY-MM-DD format'),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Check-out date must be in YYYY-MM-DD format'),
  guests: z.coerce.number().int().min(1).optional().default(2),
  rooms: z.coerce.number().int().min(1).optional().default(1),
  stars: z.coerce.number().int().min(1).max(5).optional(),
  priceMin: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  currency: z.string().length(3).optional().default('EUR'),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(20),
}).refine(
  (data) => data.location || data.locationId || (data.lat && data.lon),
  {
    message: 'Either location, locationId, or both lat and lon must be provided',
  }
);

export type HotelsQuery = z.infer<typeof hotelsQuerySchema>;
