// GET /api/hotels - Hotel search endpoint

import { NextRequest, NextResponse } from 'next/server';
import { hotelsQuerySchema } from '@/lib/schemas/validation';
import { HotelService } from '@/lib/services/hotelService';
import { getErrorResponse } from '@/lib/utils/errors';
import { generateRequestId } from '@/lib/utils/http';
import { APIResponse, HotelDTO } from '@/lib/types/api';

const hotelService = new HotelService();

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryParams = {
      location: searchParams.get('location') || undefined,
      locationId: searchParams.get('locationId') || undefined,
      lat: searchParams.get('lat') || undefined,
      lon: searchParams.get('lon') || undefined,
      checkIn: searchParams.get('checkIn') || '',
      checkOut: searchParams.get('checkOut') || '',
      guests: searchParams.get('guests') || '2',
      rooms: searchParams.get('rooms') || '1',
      stars: searchParams.get('stars') || undefined,
      priceMin: searchParams.get('priceMin') || undefined,
      priceMax: searchParams.get('priceMax') || undefined,
      currency: searchParams.get('currency') || 'EUR',
      page: searchParams.get('page') || '1',
      pageSize: searchParams.get('pageSize') || '20',
    };

    const validatedQuery = hotelsQuerySchema.parse(queryParams);

    // Search hotels
    const hotels = await hotelService.search(validatedQuery);

    // Build response
    const response: APIResponse<HotelDTO[]> = {
      ok: true,
      data: hotels,
      meta: {
        provider: 'travelpayouts',
        requestId,
        ts: Date.now(),
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Id': requestId,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Hotel search error:', error);

    const errorResponse = getErrorResponse(error);

    const response: APIResponse<never> = {
      ok: false,
      error: errorResponse.error,
      meta: {
        provider: 'travelpayouts',
        requestId,
        ts: Date.now(),
      },
    };

    return NextResponse.json(response, {
      status: errorResponse.statusCode,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Id': requestId,
      },
    });
  }
}

// CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
