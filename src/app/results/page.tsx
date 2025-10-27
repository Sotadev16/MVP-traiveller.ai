"use client";

import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Head from "next/head";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { FaChevronDown } from "react-icons/fa";
import toast, { Toaster } from 'react-hot-toast';
import {
  getIATACode,
  getCountryCode,
  getFlagUrl,
  COUNTRY_MAPPINGS,
} from "@/lib/utils/countryMappings";

interface RouteOption {
  id: string;
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  destinationCountryCode?: string;
  flightCount: number;
  hotelCount: number;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  currency: string;
  dateRange: string;
  image: string;
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const submissionId = searchParams.get("id");

  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<RouteOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // New state for country/city selection
  const [departureCountry, setDepartureCountry] = useState<string>("");
  const [departureCity, setDepartureCity] = useState<string>("");
  const [arrivalCountry, setArrivalCountry] = useState<string>("");
  const [arrivalCity, setArrivalCity] = useState<string>("");

  const [dateFilters, setDateFilters] = useState({
    departureDate: "",
    returnDate: "",
  });

  // Initialize date filters with today and +30 days, and restore saved state
  useEffect(() => {
    const today = new Date();
    const future = new Date();
    future.setDate(today.getDate() + 30);

    // Try to restore saved state from sessionStorage
    const savedState = sessionStorage.getItem('resultsPageState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        console.log('🔄 Restoring saved state:', parsed);
        setDepartureCountry(parsed.departureCountry || "");
        setDepartureCity(parsed.departureCity || "");
        setArrivalCountry(parsed.arrivalCountry || "");
        setArrivalCity(parsed.arrivalCity || "");
        setDateFilters(parsed.dateFilters || {
          departureDate: today.toISOString().split('T')[0],
          returnDate: future.toISOString().split('T')[0],
        });
        setRoutes(parsed.routes || []);
      } catch (e) {
        console.error('Failed to restore state:', e);
      }
    } else {
      // Set default dates if no saved state
      setDateFilters({
        departureDate: today.toISOString().split('T')[0],
        returnDate: future.toISOString().split('T')[0],
      });
    }

    // Mark as initialized after restoring state
    setIsInitialized(true);
  }, []);

  // Filter routes
  useEffect(() => {
    setFilteredRoutes(routes);
  }, [routes]);

  // Save state to sessionStorage whenever it changes (but only after initialization)
  useEffect(() => {
    // Don't save during initial mount/restoration
    if (!isInitialized) return;

    const stateToSave = {
      departureCountry,
      departureCity,
      arrivalCountry,
      arrivalCity,
      dateFilters,
      routes,
    };
    console.log('💾 Saving state to sessionStorage:', stateToSave);
    sessionStorage.setItem('resultsPageState', JSON.stringify(stateToSave));
  }, [isInitialized, departureCountry, departureCity, arrivalCountry, arrivalCity, dateFilters, routes]);

  // Removed auto-fetch on page load - user must manually search now

  useEffect(() => {
    // Show thank you message when coming from intake submission
    if (submissionId && submissionId !== 'demo') {
      setShowThankYou(true);
      const timer = setTimeout(() => setShowThankYou(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [submissionId]);

  const handleSearch = useCallback(async () => {
    // Validation
    if (!departureCountry || !departureCity) {
      toast.error('Selecteer vertrekland en stad', { icon: '🛫' });
      return;
    }
    if (!arrivalCountry || !arrivalCity) {
      toast.error('Selecteer aankomstland en stad', { icon: '🛬' });
      return;
    }
    if (!dateFilters.departureDate || !dateFilters.returnDate) {
      toast.error('Selecteer beide datums', { icon: '📅' });
      return;
    }

    setLoading(true);
    try {
      const originCode = getIATACode(departureCity);
      const destinationCode = getIATACode(arrivalCity);

      console.log(`🔍 Searching flights: ${departureCity} (${originCode}) → ${arrivalCity} (${destinationCode})`);
      console.log(`📅 Dates: ${dateFilters.departureDate} to ${dateFilters.returnDate}`);

      // Fetch flights for the selected route
      const flightParams = new URLSearchParams({
        origin: originCode,
        destination: destinationCode,
        date: dateFilters.departureDate,
        return_date: dateFilters.returnDate,
        adults: '2',
        children: '0',
        currency: 'EUR',
        pageSize: '50',
      });

      const flightResponse = await fetch(`/api/flights?${flightParams}`, {
        cache: 'no-store',
      });
      const flightResult = await flightResponse.json();
      const flights = flightResult.ok && flightResult.data ? flightResult.data : [];

      // Fetch hotels for arrival city
      const hotelParams = new URLSearchParams({
        location: arrivalCity,
        checkIn: dateFilters.departureDate,
        checkOut: dateFilters.returnDate,
        guests: '2',
        currency: 'EUR',
        pageSize: '50',
      });

      const hotelResponse = await fetch(`/api/hotels?${hotelParams}`, {
        cache: 'no-store',
      });
      const hotelResult = await hotelResponse.json();
      const hotels = hotelResult.ok && hotelResult.data ? hotelResult.data : [];

      console.log(`✈️ Found ${flights.length} flights, 🏨 ${hotels.length} hotels`);

      if (flights.length > 0 || hotels.length > 0) {
        interface Flight {
          price?: {
            amount?: number;
          };
        }
        const prices = (flights as Flight[]).map((f) => f.price?.amount || 0).filter((p: number) => p > 0);
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
        const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length) : 0;
        const countryCode = getCountryCode(arrivalCity);

        const route: RouteOption = {
          id: `${originCode}-${destinationCode}`,
          origin: departureCity,
          originCode,
          destination: arrivalCity,
          destinationCode,
          destinationCountryCode: countryCode,
          flightCount: flights.length,
          hotelCount: hotels.length,
          minPrice,
          maxPrice,
          avgPrice,
          currency: 'EUR',
          dateRange: `${dateFilters.departureDate} - ${dateFilters.returnDate}`,
          image: hotels[0]?.thumbnail || `https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`,
        };

        setRoutes([route]);

        // Show appropriate success message based on what was found
        if (flights.length > 0 && hotels.length > 0) {
          toast.success(`${flights.length} vluchten en ${hotels.length} hotels gevonden!`, { icon: '✈️' });
        } else if (flights.length > 0) {
          toast.success(`${flights.length} vluchten gevonden! (Geen hotels beschikbaar)`, { icon: '✈️' });
        } else {
          toast.success(`${hotels.length} hotels gevonden! (Geen vluchten beschikbaar)`, { icon: '🏨' });
        }
      } else {
        toast.error('Geen vluchten of hotels gevonden voor deze route.', { icon: '😔' });
        setRoutes([]);
      }
    } catch (error) {
      console.error('Error searching:', error);
      toast.error('Er is een fout opgetreden bij het zoeken.', { icon: '❌' });
    } finally {
      setLoading(false);
    }
  }, [departureCountry, departureCity, arrivalCountry, arrivalCity, dateFilters]);

  const handleRouteClick = (route: RouteOption) => {
    // Navigate to detailed page with route info using Next.js router
    const url = `/results/route?origin=${route.originCode}&destination=${route.destinationCode}&from=${dateFilters.departureDate}&to=${dateFilters.returnDate}`;
    router.push(url);
  };

  interface CustomSelectProps {
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
  }

  const CustomSelect = ({
    value,
    options,
    onChange,
  }: CustomSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    const handleSelect = (optionValue: string) => {
      onChange(optionValue);
      setIsOpen(false);
    };

    const selectedLabel =
      options.find((opt) => opt.value === value)?.label || options[0]?.label || "Selecteer...";

    return (
      <div className="relative" ref={dropdownRef} style={{ zIndex: isOpen ? 50 : 10 }}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 text-base text-left outline-0 cursor-pointer text-white hover:text-yellow-400 transition-all duration-200 bg-white/10 rounded-xl hover:bg-white/20 border border-white/20"
        >
          <span className="truncate font-medium">{selectedLabel}</span>
          <FaChevronDown
            className={`ml-2 text-yellow-400 transition-transform duration-200 flex-shrink-0 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div
            className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-yellow-400/50 shadow-2xl rounded-xl overflow-hidden max-h-60 overflow-y-auto"
            style={{ zIndex: 100 }}
          >
            {options.map((option) => (
              <div
                key={option.value}
                className={`px-4 py-3 cursor-pointer transition-all duration-200 text-sm ${
                  option.value === value
                    ? "bg-yellow-400 text-black font-semibold"
                    : "text-gray-800 hover:bg-yellow-50 hover:text-yellow-600"
                }`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };


  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#fff',
            padding: '16px',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <Head>
        <title>Zoekresultaten - TrAIveller.ai</title>
        <meta
          name="description"
          content="Jouw gepersonaliseerde reisopties op basis van je intake"
        />
        <link rel="icon" type="image/png" href="/images/traiveller-logo.png" />
      </Head>

      <style jsx global>{`
        @keyframes cardFadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="min-h-screen relative overflow-hidden">
        {/* Parallax Background */}
        <div className="fixed inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/beach-hero.jpg')",
            }}
          />
          <div className="absolute" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
        </div>

        <Navbar />

        {/* Thank You Banner */}
        {showThankYou && (
          <div className="fixed top-20 left-4 right-4 z-50 max-w-md mx-auto">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-lg shadow-lg animate-bounce">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🎉</div>
                <div>
                  <h3 className="font-bold">Bedankt voor je intake!</h3>
                  <p className="text-sm opacity-90">Hier zijn je 5 gepersonaliseerde reisopties. Check ook je email!</p>
                </div>
                <button
                  onClick={() => setShowThankYou(false)}
                  className="text-white/80 hover:text-white text-xl"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}

        <main
          className="relative z-10 container mx-auto px-6 py-12"
          style={{ paddingTop: "120px" }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="font-black leading-none tracking-tight mb-4">
                <div className="text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] [text-shadow:_2px_2px_4px_rgba(0,0,0,0.9)]">
                  <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter">
                    JOUW PERFECTE
                  </span>
                  <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter mt-1 text-yellow-400">
                    REISMATCHES
                  </span>
                </div>
              </h1>
              <p className="text-white/90 text-lg drop-shadow-lg font-medium">
                Handpicked door onze AI • Beste prijzen gegarandeerd
              </p>
            </div>

          {/* Main Content Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
            {/* Search Section */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-4 text-center">
                <span className="text-2xl mr-2">✈️</span>
                Zoek je perfecte reis
              </h2>
              <p className="text-white/80 text-center mb-6">Kies je vertrek- en aankomstlocatie met reisdatums</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Departure Country */}
              <div>
                <label className="text-sm font-medium text-white/90 mb-2 block">🛫 Vertrek Land</label>
                <CustomSelect
                  value={departureCountry}
                  onChange={(value) => {
                    setDepartureCountry(value);
                    setDepartureCity(""); // Reset city when country changes
                  }}
                  options={[
                    { value: "", label: "Selecteer land" },
                    ...COUNTRY_MAPPINGS.map(country => ({
                      value: country.country,
                      label: country.dutchName || country.country
                    }))
                  ]}
                />
              </div>

              {/* Departure City */}
              <div>
                <label className="text-sm font-medium text-white/90 mb-2 block">🏙️ Vertrek Stad</label>
                {departureCountry ? (
                  <CustomSelect
                    value={departureCity}
                    onChange={(value) => setDepartureCity(value)}
                    options={[
                      { value: "", label: "Selecteer stad" },
                      ...(COUNTRY_MAPPINGS.find(c => c.country === departureCountry)?.cities.map(city => ({
                        value: city,
                        label: city
                      })) || [])
                    ]}
                  />
                ) : (
                  <div className="text-sm text-white/60 py-3 px-4 bg-white/5 rounded-xl border border-white/10 italic">
                    Selecteer eerst een land
                  </div>
                )}
              </div>

              {/* Arrival Country */}
              <div>
                <label className="text-sm font-medium text-white/90 mb-2 block">🛬 Aankomst Land</label>
                <CustomSelect
                  value={arrivalCountry}
                  onChange={(value) => {
                    setArrivalCountry(value);
                    setArrivalCity(""); // Reset city when country changes
                  }}
                  options={[
                    { value: "", label: "Selecteer land" },
                    ...COUNTRY_MAPPINGS.map(country => ({
                      value: country.country,
                      label: country.dutchName || country.country
                    }))
                  ]}
                />
              </div>

              {/* Arrival City */}
              <div>
                <label className="text-sm font-medium text-white/90 mb-2 block">🏝️ Aankomst Stad</label>
                {arrivalCountry ? (
                  <CustomSelect
                    value={arrivalCity}
                    onChange={(value) => setArrivalCity(value)}
                    options={[
                      { value: "", label: "Selecteer stad" },
                      ...(COUNTRY_MAPPINGS.find(c => c.country === arrivalCountry)?.cities.map(city => ({
                        value: city,
                        label: city
                      })) || [])
                    ]}
                  />
                ) : (
                  <div className="text-sm text-white/60 py-3 px-4 bg-white/5 rounded-xl border border-white/10 italic">
                    Selecteer eerst een land
                  </div>
                )}
              </div>

              {/* Departure Date */}
              <div>
                <label className="text-sm font-medium text-white/90 mb-2 block">📅 Vertrekdatum</label>
                <input
                  type="date"
                  value={dateFilters.departureDate}
                  onChange={(e) => setDateFilters(prev => ({ ...prev, departureDate: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-xl outline-0 text-base text-white py-3 px-4 focus:border-yellow-400/50 hover:bg-white/15 transition-all"
                />
              </div>

              {/* Return Date */}
              <div>
                <label className="text-sm font-medium text-white/90 mb-2 block">📅 Retourdatum</label>
                <input
                  type="date"
                  value={dateFilters.returnDate}
                  onChange={(e) => setDateFilters(prev => ({ ...prev, returnDate: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-xl outline-0 text-base text-white py-3 px-4 focus:border-yellow-400/50 hover:bg-white/15 transition-all"
                />
              </div>
            </div>

            {/* Search Button */}
            <div className="flex justify-center mt-6">
              <button
                className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-black font-bold px-8 py-3 rounded-xl transition-all duration-300 disabled:opacity-70 flex items-center gap-2"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent" />
                    Zoeken...
                  </>
                ) : (
                  <>
                    🔍 Zoek Vluchten & Hotels
                  </>
                )}
              </button>
            </div>

            {/* Results Section */}
            {loading ? (
            <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-12 text-center mt-6">
              <div className="flex flex-col items-center gap-8 py-12">
                {/* Animated spinner */}
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-transparent border-t-yellow-400 rounded-full animate-spin"></div>
                  <div
                    className="absolute inset-2 border-4 border-transparent border-t-orange-400 rounded-full animate-spin"
                    style={{
                      animationDirection: "reverse",
                      animationDuration: "0.8s",
                    }}
                  ></div>
                  <div
                    className="absolute inset-4 border-4 border-transparent border-t-yellow-300 rounded-full animate-spin"
                    style={{ animationDuration: "0.6s" }}
                  ></div>
                </div>

                {/* Loading text with animation */}
                <div className="text-center">
                  <h3 className="text-2xl font-black text-white mb-3 animate-pulse">
                    Zoeken naar vluchten en hotels...
                  </h3>
                  <p className="text-white/70 text-lg">
                    Even geduld, we doorzoeken duizenden opties voor jou
                  </p>
                </div>

                {/* Progress dots */}
                <div className="flex space-x-3">
                  <div className="w-4 h-4 bg-yellow-400 rounded-full animate-bounce shadow-lg"></div>
                  <div
                    className="w-4 h-4 bg-orange-400 rounded-full animate-bounce shadow-lg"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-4 h-4 bg-yellow-300 rounded-full animate-bounce shadow-lg"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-4 h-4 bg-orange-300 rounded-full animate-bounce shadow-lg"
                    style={{ animationDelay: "0.3s" }}
                  ></div>
                  <div
                    className="w-4 h-4 bg-yellow-400 rounded-full animate-bounce shadow-lg"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </div>
          ) : routes.length === 0 ? (
            <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-12 text-center mt-6">
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="text-6xl">✈️</div>
                <h3 className="text-2xl font-bold text-white">Klaar voor je volgende avontuur?</h3>
                <p className="text-white/70">
                  Vul bovenstaande velden in om vluchten te zoeken
                </p>
              </div>
            </div>
          ) : filteredRoutes.length > 0 ? (
            <>
              <div className="space-y-4 mt-6">
                {filteredRoutes.map((route) => (
                    <article
                      key={route.id}
                      onClick={() => handleRouteClick(route)}
                      className="rounded-2xl overflow-hidden shadow-xl grid transition-all duration-300 ease-out group lg:grid-cols-[300px_1fr] grid-cols-1 bg-white/10 backdrop-blur-sm border border-white/20 hover:border-yellow-400/50 hover:bg-white/15 cursor-pointer"
                    >
                      <div className="relative overflow-hidden lg:min-h-[240px] h-[200px]">
                        {route.image && route.image !== `https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80` ? (
                          <Image
                            src={route.image}
                            alt={route.destination}
                            fill
                            className="object-cover"
                          />
                        ) : route.destinationCountryCode ? (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                            <Image
                              src={getFlagUrl(route.destinationCountryCode, 'w320')}
                              alt={`${route.destination} flag`}
                              width={320}
                              height={240}
                              className="object-contain max-h-[60%]"
                            />
                          </div>
                        ) : (
                          <Image
                            src={route.image}
                            alt={route.destination}
                            fill
                            className="object-cover"
                          />
                        )}

                        {/* Price label */}
                        <div className="absolute top-3 left-3">
                          <div className="bg-yellow-400 text-black font-bold px-3 py-1 rounded-lg text-sm">
                            vanaf €{route.minPrice}
                          </div>
                        </div>
                      </div>

                      <div className="p-6 flex flex-col">
                        <div className="mb-4">
                          <h3 className="font-bold m-0 mb-2 text-2xl text-white group-hover:text-yellow-400 transition-colors duration-300">
                            {route.origin} → {route.destination}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-white/80">
                            <span>✈️ {route.flightCount} vluchten</span>
                            <span>•</span>
                            <span>🏨 {route.hotelCount} hotels</span>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4 text-sm text-white/90">
                          <div>📅 {route.dateRange}</div>
                          <div>💰 €{route.minPrice} - €{route.maxPrice}</div>
                          <div>📊 Gemiddeld: €{route.avgPrice}</div>
                        </div>

                        <div className="mt-auto">
                          <button className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-black px-6 py-2 rounded-xl font-bold text-sm transition-all duration-300 w-full">
                            Bekijk alle opties →
                          </button>
                        </div>
                      </div>
                    </article>
                ))}
              </div>
            </>
          ) : null}
          </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-yellow-400 rounded-full animate-spin"></div>
          </div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
