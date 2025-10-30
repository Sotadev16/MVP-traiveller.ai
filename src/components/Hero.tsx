"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ContentType } from "@/content/home";
import { COUNTRY_MAPPINGS } from "@/lib/utils/countryMappings";

interface HeroProps {
  content: ContentType;
}

export default function Hero({}: HeroProps) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<{city: string, country: string, dutchName?: string}[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Create flat list of all cities with their countries
  const allCities = COUNTRY_MAPPINGS.flatMap(country =>
    country.cities.map(city => ({
      city,
      country: country.country,
      dutchName: country.dutchName as string | undefined
    }))
  );

  // Handle input change and filter suggestions
  const handleInputChange = (value: string) => {
    setSearchInput(value);

    if (value.trim().length > 0) {
      const filtered = allCities
        .filter(item =>
          item.city.toLowerCase().includes(value.toLowerCase()) ||
          item.country.toLowerCase().includes(value.toLowerCase()) ||
          item.dutchName?.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 8); // Limit to 8 suggestions

      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (city: string, country: string) => {
    setSearchInput(`${city}, ${country}`);
    setShowSuggestions(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (searchInput.trim()) {
      // Extract city from input (format: "City, Country")
      const cityMatch = searchInput.split(',')[0].trim();

      // Navigate to results page with multi-airport search
      // The results page will fetch from all 4 airports
      router.push(`/results?to=${encodeURIComponent(cityMatch)}&multiAirport=true`);
    }
  };

  return (
    <section className="relative z-30 min-h-screen flex items-center justify-center pt-24 sm:pt-32 pb-16 px-4">
      <div className="relative z-30 w-full max-w-6xl mx-auto">
        {/* Hero Title */}
        <div className="text-center mb-8">
          <h1 className="font-black leading-tight tracking-tight mb-6">
            <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white drop-shadow-2xl tracking-tight">
              SLIMME AI
            </span>
            <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white drop-shadow-2xl tracking-tight">
              REISPLANNER
            </span>
          </h1>

          {/* Subtitle with outline effect */}
          <p
            className="text-white text-xl sm:text-2xl md:text-3xl mb-4 font-bold tracking-wide"
            style={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.5), -1px -1px 0px rgba(0,0,0,0.3), 1px -1px 0px rgba(0,0,0,0.3), -1px 1px 0px rgba(0,0,0,0.3), 1px 1px 0px rgba(0,0,0,0.3)'
            }}
          >
            Plan of Zoek je Volgende Reis in Seconden
          </p>

          <p
            className="text-white text-sm sm:text-base md:text-lg mb-8 max-w-2xl mx-auto leading-relaxed px-4"
            style={{
              textShadow: '1px 1px 3px rgba(0,0,0,0.5)'
            }}
          >
            Laat Ai je droomreis samenstellen of zoek zelf direct naar de beste vlucht- en hoteldeals — geheel gratis en zonder gedoe.
          </p>
        </div>

        {/* Dual CTAs - Side by Side */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 px-4">
          <Link
            href="/palm-intake"
            className="inline-flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-4 px-10 rounded-full text-base sm:text-lg shadow-lg transition-all duration-300 hover:scale-105 w-full sm:w-auto uppercase tracking-wide"
            aria-label="Plan met AI"
          >
            PLAN MET AI
          </Link>

          <Link
            href="/results"
            className="inline-flex items-center justify-center bg-[#1e3a5f] hover:bg-[#2a4d7c] text-white font-bold py-4 px-10 rounded-full text-base sm:text-lg shadow-lg transition-all duration-300 hover:scale-105 w-full sm:w-auto uppercase tracking-wide"
            aria-label="Zoek vluchten & hotels"
          >
            ZOEK VLUCHTEN & HOTELS
          </Link>
        </div>

        {/* QuickSearch - Horizontal Single Line with Autocomplete */}
        <div className="max-w-4xl mx-auto px-4">
          <form onSubmit={handleQuickSearch} className="flex flex-col sm:flex-row gap-3 items-stretch">
            {/* From - Static Display */}
            <div className="flex items-center bg-white rounded-full px-6 py-4 shadow-xl flex-shrink-0">
              <span className="text-gray-600 font-medium text-sm mr-4">From</span>
              <span className="text-gray-900 font-semibold text-sm">
                AMS • RTM • BRU • DUS
              </span>
            </div>

            {/* To - Input with Autocomplete */}
            <div className="relative flex-1" ref={dropdownRef}>
              <div className="flex items-center bg-white rounded-full px-6 py-4 shadow-xl">
                <span className="text-gray-600 font-medium text-sm mr-4">To</span>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onFocus={() => {
                    if (searchInput.trim().length > 0 && filteredSuggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  placeholder="Typ een stad of land..."
                  className="flex-1 text-gray-900 font-semibold text-sm outline-none bg-transparent"
                  aria-label="Destination"
                />
              </div>

              {/* Autocomplete Dropdown */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl z-[9999] max-h-64 overflow-y-auto">
                  {filteredSuggestions.map((item, index) => (
                    <div
                      key={`${item.city}-${item.country}-${index}`}
                      onClick={() => handleSelectSuggestion(item.city, item.country)}
                      className="px-6 py-3 hover:bg-yellow-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">
                            {item.city}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.dutchName || item.country}
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="bg-[#1e3a5f] hover:bg-[#2a4d7c] text-white font-bold py-4 px-10 rounded-full text-base shadow-xl transition-all duration-300 hover:scale-105 flex-shrink-0"
              aria-label="Zoek"
            >
              Zoek
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
