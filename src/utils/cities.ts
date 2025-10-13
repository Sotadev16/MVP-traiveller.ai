import citiesData from '@/data/cities.json';

export type City = {
  city: string;
  countryCode: string;
};

const citiesArray: City[] = citiesData as City[];

export function filterCities(prefix: string): City[] {
  const p = prefix.trim().toLowerCase();
  // Min 2-3 characters as specified
  if (p.length < 2) return [];
  return citiesArray
    .filter(c => c.city.toLowerCase().startsWith(p))
    .sort((a, b) => a.city.localeCompare(b.city))
    .slice(0, 20); // Reasonable limit for performance
}

export const ALL_CITIES = citiesArray;

// Popular cities for quick selection
export const POPULAR_CITIES: City[] = [
  { city: "Amsterdam", countryCode: "NL" },
  { city: "Madrid", countryCode: "ES" },
  { city: "Barcelona", countryCode: "ES" },
  { city: "Paris", countryCode: "FR" },
  { city: "Rome", countryCode: "IT" },
  { city: "Athens", countryCode: "GR" },
  { city: "Istanbul", countryCode: "TR" },
  { city: "London", countryCode: "GB" }
];

// Get cities by country code
export function getCitiesByCountry(countryCode: string): City[] {
  return citiesArray.filter(c => c.countryCode === countryCode);
}