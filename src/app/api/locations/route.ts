// GET /api/locations - Location autocomplete endpoint

import { NextRequest, NextResponse } from 'next/server';
import { locationsQuerySchema } from '@/lib/schemas/validation';
import { LocationService } from '@/lib/services/locationService';
import { getErrorResponse } from '@/lib/utils/errors';
import { generateRequestId } from '@/lib/utils/http';
import { APIResponse, LocationDTO } from '@/lib/types/api';

const locationService = new LocationService();

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryParams = {
      q: searchParams.get('q') || '',
      type: searchParams.get('type') || 'all',
      limit: searchParams.get('limit') || '10',
    };

    const validatedQuery = locationsQuerySchema.parse(queryParams);

    // Search locations
    const locations = await locationService.search(validatedQuery);

    // Build response
    const response: APIResponse<LocationDTO[]> = {
      ok: true,
      data: locations,
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
        'Cache-Control': 'public, max-age=86400', // 24 hours
      },
    });
  } catch (error) {
    console.error('Location search error:', error);

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
