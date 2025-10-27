// Mappers to transform Travelpayouts responses to canonical DTOs

import {
  LocationDTO,
  FlightItineraryDTO,
  HotelDTO,
  LocationType,
} from '../types/api';
import {
  TravelpayoutsLocation,
  TravelpayoutsFlight,
  TravelpayoutsHotel,
} from '../providers/travelpayouts';

export function mapLocation(raw: TravelpayoutsLocation): LocationDTO {
  // Determine location type
  let type: LocationType = 'city';
  if (raw.type === 'airport') {
    type = 'airport';
  } else if (raw.type === 'hotel') {
    type = 'hotel';
  }

  return {
    id: raw.id?.toString() || raw.code || '',
    type,
    code: raw.code || raw.city_code,
    name: raw.name || raw.city_name || '',
    country: raw.country_code,
    lat: raw.coordinates?.lat,
    lon: raw.coordinates?.lon,
  };
}

export function mapFlight(raw: TravelpayoutsFlight, currency: string = 'EUR'): FlightItineraryDTO {
  const departureTime = raw.departure_at;

  // Calculate arrival time from departure + duration
  const arrivalTime = new Date(
    new Date(departureTime).getTime() + (raw.duration_to || raw.duration) * 60000
  ).toISOString();

  // Generate a unique ID
  const id = `${raw.origin}-${raw.destination}-${departureTime}-${raw.price}`;

  // Build leg information
  const legs = [];

  // Outbound leg
  legs.push({
    from: raw.origin_airport || raw.origin,
    to: raw.destination_airport || raw.destination,
    depTime: departureTime,
    arrTime: arrivalTime,
    durationMin: raw.duration_to || raw.duration,
    segments: [
      {
        carrier: raw.airline || 'Unknown',
        flightNumber: raw.flight_number || '',
        from: raw.origin_airport || raw.origin,
        to: raw.destination_airport || raw.destination,
        depTime: departureTime,
        arrTime: arrivalTime,
      },
    ],
  });

  // Return leg if available
  if (raw.return_at && raw.duration_back) {
    const returnArrival = new Date(
      new Date(raw.return_at).getTime() + raw.duration_back * 60000
    ).toISOString();

    legs.push({
      from: raw.destination_airport || raw.destination,
      to: raw.origin_airport || raw.origin,
      depTime: raw.return_at,
      arrTime: returnArrival,
      durationMin: raw.duration_back,
      segments: [
        {
          carrier: raw.airline || 'Unknown',
          flightNumber: raw.flight_number || '',
          from: raw.destination_airport || raw.destination,
          to: raw.origin_airport || raw.origin,
          depTime: raw.return_at,
          arrTime: returnArrival,
        },
      ],
    });
  }

  return {
    id,
    price: {
      amount: raw.price,
      currency,
    },
    legs,
    carriers: raw.airline ? [raw.airline] : [],
    bookingUrl: raw.link,
  };
}

export function mapHotel(raw: TravelpayoutsHotel, currency: string = 'EUR'): HotelDTO {
  // Generate hotel image URL using Hotellook Photo API
  // Format: https://photo.hotellook.com/image_v2/limit/{hotelId}/{width}/{height}.auto
  const hotelImageUrl = `https://photo.hotellook.com/image_v2/limit/${raw.hotelId}/800/520.auto`;

  // Generate booking URL with Hotellook
  const cityName = raw.location?.name?.toLowerCase().replace(/\s+/g, '-') || 'city';
  const bookingUrl = `https://www.hotellook.com/hotels/${cityName}/hotel/${raw.hotelId}`;

  return {
    id: raw.hotelId.toString(),
    name: raw.hotelName,
    location: {
      lat: raw.location?.geo?.lat,
      lon: raw.location?.geo?.lon,
      address: undefined,
      city: raw.location?.name,
      country: raw.location?.country,
    },
    rating: {
      score: undefined,
      reviews: undefined,
    },
    stars: raw.stars,
    price: raw.priceFrom
      ? {
          amount: raw.priceFrom,
          currency,
        }
      : undefined,
    thumbnail: hotelImageUrl,
    bookingUrl: bookingUrl,
  };
}
