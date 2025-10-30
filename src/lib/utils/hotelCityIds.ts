// Hotellook cityId mappings for popular destinations
// These numeric IDs are required by the Hotellook cache.json API
// Source: https://www.hotellook.com or Travelpayouts city database

export const HOTEL_CITY_IDS: Record<string, number> = {
  // Europe
  'AMS': 12679, // Amsterdam
  'BCN': 10947, // Barcelona
  'BER': 10677, // Berlin
  'BRU': 10499, // Brussels
  'CDG': 12053, // Paris
  'PAR': 12053, // Paris (alternative)
  'CPH': 11005, // Copenhagen
  'DBV': 10729, // Dubrovnik
  'EDI': 12641, // Edinburgh
  'FCO': 12898, // Rome
  'ROM': 12898, // Rome (alternative)
  'FRA': 12356, // Frankfurt
  'LHR': 12640, // London
  'LON': 12640, // London (alternative)
  'LIS': 12836, // Lisbon
  'MAD': 12934, // Madrid
  'MXP': 12874, // Milan
  'MIL': 12874, // Milan (alternative)
  'MUC': 12679, // Munich
  'NCE': 12602, // Nice
  'OPO': 12837, // Porto
  'OSL': 11103, // Oslo
  'PRG': 11100, // Prague
  'VCE': 12973, // Venice
  'VIE': 10946, // Vienna
  'ZRH': 13014, // Zurich

  // Greece & Turkey
  'ATH': 10943, // Athens
  'IST': 12758, // Istanbul
  'JTR': 10909, // Santorini

  // Africa & Middle East
  'CAI': 10725, // Cairo
  'CMN': 10699, // Casablanca
  'DXB': 11181, // Dubai
  'RAK': 12892, // Marrakech

  // Americas
  'AUA': 10436, // Aruba
  'CUN': 10735, // Cancun
  'CUR': 10734, // Curaçao
  'HAV': 10745, // Havana
  'JFK': 13046, // New York
  'NYC': 13046, // New York (alternative)
  'LAX': 12829, // Los Angeles
  'LAS': 12835, // Las Vegas
  'MIA': 12897, // Miami

  // Asia
  'BKK': 10497, // Bangkok
  'DPS': 11151, // Bali
  'HKT': 10786, // Phuket
  'KUL': 12806, // Kuala Lumpur
  'NRT': 13024, // Tokyo
  'TYO': 13024, // Tokyo (alternative)
  'SIN': 13170, // Singapore
};

// Get cityId from IATA code or city name
export function getCityIdFromIATA(iataCode: string): number | null {
  const upperCode = iataCode.toUpperCase();
  return HOTEL_CITY_IDS[upperCode] || null;
}

// Get cityId from city name using our country mappings
export function getCityIdFromName(cityName: string): number | null {
  const normalized = cityName.toLowerCase().trim();

  // Map city names to IATA codes
  const cityToIATA: Record<string, string> = {
    'amsterdam': 'AMS',
    'barcelona': 'BCN',
    'berlin': 'BER',
    'brussels': 'BRU',
    'paris': 'PAR',
    'copenhagen': 'CPH',
    'dubrovnik': 'DBV',
    'edinburgh': 'EDI',
    'rome': 'ROM',
    'frankfurt': 'FRA',
    'london': 'LON',
    'lisbon': 'LIS',
    'madrid': 'MAD',
    'milan': 'MIL',
    'munich': 'MUC',
    'nice': 'NCE',
    'porto': 'OPO',
    'oslo': 'OSL',
    'prague': 'PRG',
    'venice': 'VCE',
    'vienna': 'VIE',
    'zurich': 'ZRH',
    'athens': 'ATH',
    'istanbul': 'IST',
    'santorini': 'JTR',
    'cairo': 'CAI',
    'casablanca': 'CMN',
    'dubai': 'DXB',
    'marrakech': 'RAK',
    'aruba': 'AUA',
    'oranjestad': 'AUA',
    'cancun': 'CUN',
    'curacao': 'CUR',
    'willemstad': 'CUR',
    'havana': 'HAV',
    'new york': 'NYC',
    'los angeles': 'LAX',
    'las vegas': 'LAS',
    'miami': 'MIA',
    'bangkok': 'BKK',
    'bali': 'DPS',
    'phuket': 'HKT',
    'kuala lumpur': 'KUL',
    'tokyo': 'TYO',
    'singapore': 'SIN',
  };

  const iataCode = cityToIATA[normalized];
  if (iataCode) {
    return getCityIdFromIATA(iataCode);
  }

  return null;
}
