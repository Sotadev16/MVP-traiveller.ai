// API Integration Foundation for Phase 3
// Clean wrapper for external API calls

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  adults: number;
  children: number;
  cabinClass: 'economy' | 'premium_economy' | 'business' | 'first';
}

export interface HotelSearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  source?: string;
}

// Mock API wrapper (replace with real APIs in Phase 3)
export class TravelAPIClient {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = process.env.TRAVEL_API_BASE_URL || 'https://api.example.com';
    this.apiKey = process.env.TRAVEL_API_KEY || '';
  }

  async searchFlights(params: FlightSearchParams): Promise<APIResponse<any>> {
    try {
      // Mock implementation - replace with real API call
      const mockResponse = {
        flights: [
          {
            id: 'FL001',
            airline: 'KLM',
            price: 350,
            currency: 'EUR',
            duration: '2h 15m',
            stops: 0,
            departure: params.departureDate,
            return: params.returnDate
          }
        ],
        searchParams: params
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Flight search API called:', params);

      return {
        success: true,
        data: mockResponse,
        source: 'mock_api'
      };

    } catch (error) {
      console.error('Flight API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'flight_api'
      };
    }
  }

  async searchHotels(params: HotelSearchParams): Promise<APIResponse<any>> {
    try {
      // Mock implementation - replace with real API call
      const mockResponse = {
        hotels: [
          {
            id: 'HT001',
            name: 'Grand Hotel Example',
            price: 120,
            currency: 'EUR',
            rating: 4.5,
            location: params.destination
          }
        ],
        searchParams: params
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      console.log('Hotel search API called:', params);

      return {
        success: true,
        data: mockResponse,
        source: 'mock_api'
      };

    } catch (error) {
      console.error('Hotel API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'hotel_api'
      };
    }
  }

  async testConnection(): Promise<APIResponse<{ status: string }>> {
    try {
      console.log('Testing API connection...');

      // Mock test call
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        success: true,
        data: {
          status: 'connected',
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        },
        source: 'test_api'
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed',
        source: 'test_api'
      };
    }
  }
}

// Test API functionality
export async function runAPITest(): Promise<void> {
  console.log('🧪 Running API Integration Test...');

  const client = new TravelAPIClient();

  // Test connection
  const connectionTest = await client.testConnection();
  console.log('Connection test:', connectionTest);

  // Test flight search
  const flightTest = await client.searchFlights({
    origin: 'AMS',
    destination: 'BCN',
    departureDate: '2025-10-15',
    returnDate: '2025-10-22',
    adults: 2,
    children: 0,
    cabinClass: 'economy'
  });
  console.log('Flight search test:', flightTest);

  // Test hotel search
  const hotelTest = await client.searchHotels({
    destination: 'Barcelona',
    checkIn: '2025-10-15',
    checkOut: '2025-10-22',
    adults: 2,
    children: 0,
    rooms: 1
  });
  console.log('Hotel search test:', hotelTest);

  console.log('✅ API Integration Test Complete');
}