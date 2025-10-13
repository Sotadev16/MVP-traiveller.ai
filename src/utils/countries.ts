import { countries } from 'countries-list';
export type Country = { code: string; name: string };
const countryArray: Country[] = Object.entries(countries).map(([code, v]) => ({
  code,
  name: (v as { name: string }).name,
}));
export function filterCountries(prefix: string): Country[] {
  const p = prefix.trim().toLowerCase();
  if (!p) return countryArray;
  return countryArray
    .filter(c => c.name.toLowerCase().startsWith(p))
    .sort((a, b) => a.name.localeCompare(b.name));
}
export const ALL_COUNTRIES = countryArray.sort((a, b) => a.name.localeCompare(b.name));

// Popular countries for quick selection
export const POPULAR_COUNTRIES = [
  'Spain',
  'France',
  'Italy',
  'Greece',
  'Turkey',
  'Netherlands',
  'Germany',
  'United Kingdom'
].map(name => ALL_COUNTRIES.find(c => c.name === name)).filter(Boolean) as Country[];