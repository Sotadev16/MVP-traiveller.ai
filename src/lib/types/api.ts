// API Response Types and Interfaces

export type LocationType = 'airport' | 'city' | 'hotel';

export interface LocationDTO {
  id: string;
  type: LocationType;
  code?: string; // IATA code for airports/cities
  name: string;
  country?: string;
  lat?: number;
  lon?: number;
}

export interface FlightSegmentDTO {
  carrier: string;
  flightNumber: string;
  from: string;
  to: string;
  depTime: string;
  arrTime: string;
}

export interface FlightLegDTO {
  from: string;
  to: string;
  depTime: string;
  arrTime: string;
  durationMin: number;
  segments: FlightSegmentDTO[];
}

export interface FlightItineraryDTO {
  id: string;
  price: {
    amount: number;
    currency: string;
  };
  legs: FlightLegDTO[];
  carriers: string[];
  bookingUrl?: string;
}

export interface HotelDTO {
  id: string;
  name: string;
  location: {
    lat?: number;
    lon?: number;
    address?: string;
    city?: string;
    country?: string;
  };
  rating?: {
    score?: number;
    reviews?: number;
  };
  stars?: number;
  price?: {
    amount: number;
    currency: string;
  };
  thumbnail?: string;
  bookingUrl?: string;
}

export interface APIResponseMeta {
  provider: string;
  requestId: string;
  ts: number;
}

export interface APIResponse<T> {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: APIResponseMeta;
}
