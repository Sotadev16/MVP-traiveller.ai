// GET /api/flights - Flight search endpoint

import { NextRequest, NextResponse } from 'next/server';
import { flightsQuerySchema } from '@/lib/schemas/validation';
import { FlightService } from '@/lib/services/flightService';
import { getErrorResponse } from '@/lib/utils/errors';
import { generateRequestId } from '@/lib/utils/http';
import { APIResponse, FlightItineraryDTO } from '@/lib/types/api';

const flightService = new FlightService();

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryParams = {
      origin: searchParams.get('origin') || '',
      destination: searchParams.get('destination') || '',
      date: searchParams.get('date') || '',
      return_date: searchParams.get('return_date') || undefined,
      adults: searchParams.get('adults') || '1',
      children: searchParams.get('children') || '0',
      infants: searchParams.get('infants') || '0',
      cabin: searchParams.get('cabin') || 'economy',
      nonstop: searchParams.get('nonstop') || 'false',
      currency: searchParams.get('currency') || 'EUR',
      page: searchParams.get('page') || '1',
      pageSize: searchParams.get('pageSize') || '20',
    };

    const validatedQuery = flightsQuerySchema.parse(queryParams);

    // Search flights
    const flights = await flightService.search(validatedQuery);

    // Build response
    const response: APIResponse<FlightItineraryDTO[]> = {
      ok: true,
      data: flights,
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
    console.error('Flight search error:', error);

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
