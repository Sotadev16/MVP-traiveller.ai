// Country to city and IATA code mappings for travel search
// This file provides mappings between country names (in both Dutch and English),
// their major cities, IATA airport codes, and country codes for flag display

export interface CountryMapping {
  country: string;
  countryCode: string; // ISO 3166-1 alpha-2 code for flags
  cities: string[];
  mainCity: string;
  iataCode: string;
  dutchName?: string;
}

// Comprehensive country mappings
export const COUNTRY_MAPPINGS: CountryMapping[] = [
  // Popular European destinations
  { country: 'Spain', countryCode: 'ES', dutchName: 'Spanje', cities: ['Barcelona', 'Madrid', 'Seville', 'Valencia'], mainCity: 'Barcelona', iataCode: 'BCN' },
  { country: 'France', countryCode: 'FR', dutchName: 'Frankrijk', cities: ['Paris', 'Nice', 'Lyon', 'Marseille'], mainCity: 'Paris', iataCode: 'CDG' },
  { country: 'Italy', countryCode: 'IT', dutchName: 'Italië', cities: ['Rome', 'Milan', 'Venice', 'Florence'], mainCity: 'Rome', iataCode: 'FCO' },
  { country: 'Greece', countryCode: 'GR', dutchName: 'Griekenland', cities: ['Athens', 'Santorini', 'Mykonos', 'Crete'], mainCity: 'Athens', iataCode: 'ATH' },
  { country: 'Turkey', countryCode: 'TR', dutchName: 'Turkije', cities: ['Istanbul', 'Antalya', 'Ankara'], mainCity: 'Istanbul', iataCode: 'IST' },
  { country: 'Portugal', countryCode: 'PT', dutchName: 'Portugal', cities: ['Lisbon', 'Porto', 'Faro'], mainCity: 'Lisbon', iataCode: 'LIS' },
  { country: 'Germany', countryCode: 'DE', dutchName: 'Duitsland', cities: ['Berlin', 'Munich', 'Frankfurt'], mainCity: 'Berlin', iataCode: 'BER' },
  { country: 'United Kingdom', countryCode: 'GB', dutchName: 'Verenigd Koninkrijk', cities: ['London', 'Manchester', 'Edinburgh'], mainCity: 'London', iataCode: 'LHR' },
  { country: 'Netherlands', countryCode: 'NL', dutchName: 'Nederland', cities: ['Amsterdam', 'Rotterdam', 'The Hague'], mainCity: 'Amsterdam', iataCode: 'AMS' },
  { country: 'Belgium', countryCode: 'BE', dutchName: 'België', cities: ['Brussels', 'Antwerp', 'Bruges'], mainCity: 'Brussels', iataCode: 'BRU' },

  // African & Middle Eastern destinations
  { country: 'Morocco', countryCode: 'MA', dutchName: 'Marokko', cities: ['Marrakech', 'Casablanca', 'Fez'], mainCity: 'Marrakech', iataCode: 'RAK' },
  { country: 'Egypt', countryCode: 'EG', dutchName: 'Egypte', cities: ['Cairo', 'Hurghada', 'Sharm El Sheikh'], mainCity: 'Cairo', iataCode: 'CAI' },
  { country: 'Tunisia', countryCode: 'TN', dutchName: 'Tunesië', cities: ['Tunis', 'Djerba', 'Sousse'], mainCity: 'Tunis', iataCode: 'TUN' },
  { country: 'United Arab Emirates', countryCode: 'AE', dutchName: 'Verenigde Arabische Emiraten', cities: ['Dubai', 'Abu Dhabi'], mainCity: 'Dubai', iataCode: 'DXB' },

  // Caribbean & Americas
  { country: 'Aruba', countryCode: 'AW', dutchName: 'Aruba', cities: ['Oranjestad'], mainCity: 'Oranjestad', iataCode: 'AUA' },
  { country: 'Curaçao', countryCode: 'CW', dutchName: 'Curaçao', cities: ['Willemstad'], mainCity: 'Willemstad', iataCode: 'CUR' },
  { country: 'United States', countryCode: 'US', dutchName: 'Verenigde Staten', cities: ['New York', 'Los Angeles', 'Miami', 'Las Vegas'], mainCity: 'New York', iataCode: 'JFK' },
  { country: 'Mexico', countryCode: 'MX', dutchName: 'Mexico', cities: ['Cancun', 'Mexico City', 'Playa del Carmen'], mainCity: 'Cancun', iataCode: 'CUN' },
  { country: 'Cuba', countryCode: 'CU', dutchName: 'Cuba', cities: ['Havana', 'Varadero'], mainCity: 'Havana', iataCode: 'HAV' },

  // Asian destinations
  { country: 'Thailand', countryCode: 'TH', dutchName: 'Thailand', cities: ['Bangkok', 'Phuket', 'Chiang Mai'], mainCity: 'Bangkok', iataCode: 'BKK' },
  { country: 'Indonesia', countryCode: 'ID', dutchName: 'Indonesië', cities: ['Bali', 'Jakarta'], mainCity: 'Bali', iataCode: 'DPS' },
  { country: 'Japan', countryCode: 'JP', dutchName: 'Japan', cities: ['Tokyo', 'Osaka', 'Kyoto'], mainCity: 'Tokyo', iataCode: 'NRT' },
  { country: 'Singapore', countryCode: 'SG', dutchName: 'Singapore', cities: ['Singapore'], mainCity: 'Singapore', iataCode: 'SIN' },
  { country: 'Malaysia', countryCode: 'MY', dutchName: 'Maleisië', cities: ['Kuala Lumpur'], mainCity: 'Kuala Lumpur', iataCode: 'KUL' },

  // Other European destinations
  { country: 'Austria', countryCode: 'AT', dutchName: 'Oostenrijk', cities: ['Vienna', 'Salzburg'], mainCity: 'Vienna', iataCode: 'VIE' },
  { country: 'Switzerland', countryCode: 'CH', dutchName: 'Zwitserland', cities: ['Zurich', 'Geneva'], mainCity: 'Zurich', iataCode: 'ZRH' },
  { country: 'Croatia', countryCode: 'HR', dutchName: 'Kroatië', cities: ['Dubrovnik', 'Split', 'Zagreb'], mainCity: 'Dubrovnik', iataCode: 'DBV' },
  { country: 'Czech Republic', countryCode: 'CZ', dutchName: 'Tsjechië', cities: ['Prague'], mainCity: 'Prague', iataCode: 'PRG' },
  { country: 'Poland', countryCode: 'PL', dutchName: 'Polen', cities: ['Warsaw', 'Krakow'], mainCity: 'Warsaw', iataCode: 'WAW' },
  { country: 'Hungary', countryCode: 'HU', dutchName: 'Hongarije', cities: ['Budapest'], mainCity: 'Budapest', iataCode: 'BUD' },
  { country: 'Denmark', countryCode: 'DK', dutchName: 'Denemarken', cities: ['Copenhagen'], mainCity: 'Copenhagen', iataCode: 'CPH' },
  { country: 'Sweden', countryCode: 'SE', dutchName: 'Zweden', cities: ['Stockholm'], mainCity: 'Stockholm', iataCode: 'ARN' },
  { country: 'Norway', countryCode: 'NO', dutchName: 'Noorwegen', cities: ['Oslo'], mainCity: 'Oslo', iataCode: 'OSL' },
  { country: 'Finland', countryCode: 'FI', dutchName: 'Finland', cities: ['Helsinki'], mainCity: 'Helsinki', iataCode: 'HEL' },
  { country: 'Iceland', countryCode: 'IS', dutchName: 'IJsland', cities: ['Reykjavik'], mainCity: 'Reykjavik', iataCode: 'KEF' },
];

// Helper functions
export function getCountryMapping(countryName: string): CountryMapping | undefined {
  const normalized = countryName.toLowerCase().trim();
  return COUNTRY_MAPPINGS.find(
    mapping =>
      mapping.country.toLowerCase() === normalized ||
      mapping.dutchName?.toLowerCase() === normalized ||
      mapping.mainCity.toLowerCase() === normalized ||
      mapping.cities.some(city => city.toLowerCase() === normalized)
  );
}

export function getIATACode(locationName: string): string {
  const normalized = locationName.toLowerCase().trim();

  // First, check city-specific IATA codes (highest priority)
  const cityIATAMap: Record<string, string> = {
    // Netherlands
    'amsterdam': 'AMS',
    'eindhoven': 'EIN',
    'rotterdam': 'RTM',

    // Belgium
    'brussels': 'BRU',
    'antwerp': 'ANR',

    // France
    'paris': 'CDG',
    'nice': 'NCE',
    'lyon': 'LYS',
    'marseille': 'MRS',

    // UK
    'london': 'LHR',
    'manchester': 'MAN',
    'edinburgh': 'EDI',

    // Spain
    'barcelona': 'BCN',
    'madrid': 'MAD',
    'seville': 'SVQ',
    'valencia': 'VLC',

    // Italy
    'rome': 'FCO',
    'milan': 'MXP',
    'venice': 'VCE',
    'florence': 'FLR',

    // Greece
    'athens': 'ATH',
    'santorini': 'JTR',
    'mykonos': 'JMK',
    'crete': 'HER',

    // Germany
    'berlin': 'BER',
    'munich': 'MUC',
    'frankfurt': 'FRA',

    // Other European
    'istanbul': 'IST',
    'lisbon': 'LIS',
    'porto': 'OPO',
    'vienna': 'VIE',
    'prague': 'PRG',
    'budapest': 'BUD',
    'copenhagen': 'CPH',
    'stockholm': 'ARN',
    'oslo': 'OSL',
    'helsinki': 'HEL',
    'reykjavik': 'KEF',
    'zurich': 'ZRH',
    'geneva': 'GVA',
    'dubrovnik': 'DBV',
    'split': 'SPU',

    // Africa & Middle East
    'marrakech': 'RAK',
    'casablanca': 'CMN',
    'cairo': 'CAI',
    'dubai': 'DXB',
    'abu dhabi': 'AUH',

    // Americas
    'new york': 'JFK',
    'los angeles': 'LAX',
    'miami': 'MIA',
    'las vegas': 'LAS',
    'cancun': 'CUN',
    'havana': 'HAV',
    'oranjestad': 'AUA',
    'willemstad': 'CUR',

    // Asia
    'bangkok': 'BKK',
    'phuket': 'HKT',
    'bali': 'DPS',
    'tokyo': 'NRT',
    'singapore': 'SIN',
    'kuala lumpur': 'KUL',
  };

  // Check if it's a specific city
  if (cityIATAMap[normalized]) {
    return cityIATAMap[normalized];
  }

  // Fallback to country main city
  const mapping = getCountryMapping(locationName);
  if (mapping) {
    return mapping.iataCode;
  }

  // Default to Amsterdam
  return 'AMS';
}

export function getCityFromLocation(location: string): string {
  const mapping = getCountryMapping(location);
  if (mapping) {
    return mapping.mainCity;
  }

  // If it's not a recognized country, assume it's already a city name
  return location;
}

export function getCountryCode(locationName: string): string | undefined {
  const mapping = getCountryMapping(locationName);
  return mapping?.countryCode;
}

// Get flag emoji from country code
export function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// Get flag URL from country code (using flagcdn.com)
export function getFlagUrl(countryCode: string, size: 'w20' | 'w40' | 'w80' | 'w160' | 'w320' = 'w160'): string {
  return `https://flagcdn.com/${size}/${countryCode.toLowerCase()}.png`;
}

// Popular destinations matching the intake form EXACTLY
// These are the same countries shown in SimpleDestinationStep.tsx
export const POPULAR_DESTINATIONS = [
  { country: 'Aruba', dutchName: 'Aruba', countryCode: 'AW', city: 'Oranjestad' },
  { country: 'Spain', dutchName: 'Spanje', countryCode: 'ES', city: 'Barcelona' },
  { country: 'Greece', dutchName: 'Griekenland', countryCode: 'GR', city: 'Athens' },
  { country: 'Italy', dutchName: 'Italië', countryCode: 'IT', city: 'Rome' },
  { country: 'France', dutchName: 'Frankrijk', countryCode: 'FR', city: 'Paris' },
  { country: 'Turkey', dutchName: 'Turkije', countryCode: 'TR', city: 'Istanbul' },
  { country: 'Morocco', dutchName: 'Marokko', countryCode: 'MA', city: 'Marrakech' },
];

// Supported origin cities for multi-origin routing
// Includes both base cities (NL/BE) AND popular destinations for full city-to-city coverage
export const SUPPORTED_ORIGINS = [
  // Base departure cities
  { city: 'Amsterdam', countryCode: 'NL', iataCode: 'AMS', dutchName: 'Amsterdam' },
  { city: 'Rotterdam', countryCode: 'NL', iataCode: 'RTM', dutchName: 'Rotterdam' },
  { city: 'Eindhoven', countryCode: 'NL', iataCode: 'EIN', dutchName: 'Eindhoven' },
  { city: 'Brussels', countryCode: 'BE', iataCode: 'BRU', dutchName: 'Brussel' },

  // Popular destinations that can also be origins (for country-to-country flights)
  { city: 'Barcelona', countryCode: 'ES', iataCode: 'BCN', dutchName: 'Barcelona' },
  { city: 'Rome', countryCode: 'IT', iataCode: 'FCO', dutchName: 'Rome' },
  { city: 'Paris', countryCode: 'FR', iataCode: 'CDG', dutchName: 'Parijs' },
  { city: 'Athens', countryCode: 'GR', iataCode: 'ATH', dutchName: 'Athene' },
  { city: 'Istanbul', countryCode: 'TR', iataCode: 'IST', dutchName: 'Istanbul' },
  { city: 'Marrakech', countryCode: 'MA', iataCode: 'RAK', dutchName: 'Marrakech' },
  { city: 'Oranjestad', countryCode: 'AW', iataCode: 'AUA', dutchName: 'Oranjestad' },
];
