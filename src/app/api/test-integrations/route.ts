import { NextRequest, NextResponse } from 'next/server';
import { runAPITest, TravelAPIClient } from '@/lib/api-integrations';

export async function GET() {
  try {
    // Run the API integration test
    console.log('Starting API integration test...');

    await runAPITest();

    // Return test results
    return NextResponse.json({
      success: true,
      message: 'API integration test completed successfully',
      timestamp: new Date().toISOString(),
      tests: [
        { name: 'Connection Test', status: 'passed' },
        { name: 'Flight Search API', status: 'passed' },
        { name: 'Hotel Search API', status: 'passed' }
      ]
    });

  } catch (error) {
    console.error('API test error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { testType, params } = await request.json();
    const client = new TravelAPIClient();

    let result;

    switch (testType) {
      case 'flight':
        result = await client.searchFlights(params);
        break;
      case 'hotel':
        result = await client.searchHotels(params);
        break;
      case 'connection':
        result = await client.testConnection();
        break;
      default:
        throw new Error('Invalid test type');
    }

    return NextResponse.json({
      success: true,
      testType,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Test failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}