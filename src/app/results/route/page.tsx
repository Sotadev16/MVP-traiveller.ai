"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { FlightItineraryDTO, HotelDTO } from "@/lib/types/api";
import { getFlagUrl, getCountryCode } from "@/lib/utils/countryMappings";

interface FlightHotelCombo {
  id: string;
  flight: FlightItineraryDTO;
  hotel: HotelDTO | null;
  totalPrice: number;
}

function RouteDetailsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const origin = searchParams.get("origin") || "";
  const destination = searchParams.get("destination") || "";
  const departDate = searchParams.get("from") || "";
  const returnDate = searchParams.get("to") || "";

  const [combos, setCombos] = useState<FlightHotelCombo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(10);

  useEffect(() => {
    const fetchRouteDetails = async () => {
      if (!origin || !destination || !departDate || !returnDate) {
        setError("Missing route parameters");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Fetch flights for this specific route
        const flightParams = new URLSearchParams({
          origin,
          destination,
          date: departDate,
          return_date: returnDate,
          adults: "2",
          children: "0",
          currency: "EUR",
          pageSize: "50", // Max allowed by API
        });

        const flightResponse = await fetch(`/api/flights?${flightParams}`, {
          cache: "no-store",
        });
        const flightResult = await flightResponse.json();

        if (!flightResult.ok || !flightResult.data || flightResult.data.length === 0) {
          setError("Geen vluchten gevonden voor deze route");
          setIsLoading(false);
          return;
        }

        const flights: FlightItineraryDTO[] = flightResult.data;

        // Fetch hotels for the destination city
        const hotelParams = new URLSearchParams({
          location: destination,
          checkIn: departDate,
          checkOut: returnDate,
          guests: "2",
          currency: "EUR",
          pageSize: "50",
        });

        const hotelResponse = await fetch(`/api/hotels?${hotelParams}`, {
          cache: "no-store",
        });
        const hotelResult = await hotelResponse.json();

        const hotels: HotelDTO[] = hotelResult.ok && hotelResult.data ? hotelResult.data : [];

        // Create flight + hotel combinations
        const combinations: FlightHotelCombo[] = flights.map((flight, index) => {
          const hotel = hotels.length > 0 ? hotels[index % hotels.length] : null;
          const totalPrice = flight.price.amount + (hotel?.price?.amount || 0);

          return {
            id: `${flight.id}-${hotel?.id || "no-hotel"}`,
            flight,
            hotel,
            totalPrice,
          };
        });

        setCombos(combinations);
      } catch (err) {
        console.error("Error fetching route details:", err);
        setError("Er is een fout opgetreden bij het ophalen van de gegevens");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRouteDetails();
  }, [origin, destination, departDate, returnDate]);

  const handleLoadMore = () => {
    setDisplayCount((prev) => Math.min(prev + 10, combos.length));
  };

  const destinationCountryCode = getCountryCode(destination);
  const fallbackImage = destinationCountryCode
    ? getFlagUrl(destinationCountryCode, "w320")
    : "/placeholder-destination.jpg";

  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Same background as results page */}
        <div className="fixed inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/beach-hero.jpg')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-yellow-400 rounded-full animate-spin"></div>
            </div>
            <p className="text-white text-xl font-semibold drop-shadow-lg">Vluchten laden...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Same background as results page */}
        <div className="fixed inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/beach-hero.jpg')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md border border-white/20">
            <p className="text-white text-xl font-semibold mb-4">⚠️ {error}</p>
            <button
              onClick={() => router.back()}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-black px-6 py-3 rounded-xl font-bold transition-all duration-300"
            >
              ← Terug naar overzicht
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Parallax Background - Same as results page */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/beach-hero.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
      </div>

      <div className="relative z-10 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-300 mb-6 border border-white/20"
            >
              ← Terug naar overzicht
            </button>

            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 text-white border border-white/20 shadow-2xl">
              <h1 className="font-black leading-none tracking-tight mb-4">
                <span className="block text-4xl md:text-5xl text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                  {origin} → {destination}
                </span>
              </h1>
              <div className="flex flex-wrap gap-4 text-lg">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">📅</span>
                  <span className="text-white/90">{new Date(departDate).toLocaleDateString("nl-NL")} - {new Date(returnDate).toLocaleDateString("nl-NL")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">✈️</span>
                  <span className="font-bold text-yellow-400">{combos.length}</span>
                  <span className="text-white/90">vlucht{combos.length !== 1 ? "en" : ""} gevonden</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {combos.slice(0, displayCount).map((combo) => (
              <article
                key={combo.id}
                className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/20 hover:border-yellow-400/50"
              >
                {/* Hotel Image or Flag */}
                <div className="relative h-48 bg-gray-900">
                  {combo.hotel?.thumbnail ? (
                    <Image
                      src={combo.hotel.thumbnail}
                      alt={combo.hotel.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <Image
                      src={fallbackImage}
                      alt={destination}
                      fill
                      className="object-cover opacity-60"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  )}

                  {/* Price Badge */}
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    vanaf €{Math.round(combo.totalPrice)}
                  </div>
                </div>

                {/* Flight Details */}
                <div className="p-5 space-y-4">
                  <div className="border-b border-white/20 pb-3">
                    <h3 className="text-white font-bold text-lg mb-2">✈️ Vlucht</h3>
                    <div className="space-y-1 text-sm text-white/90">
                      <p>🛫 Vertrek: {new Date(combo.flight.legs[0]?.depTime || "").toLocaleString("nl-NL")}</p>
                      <p>🛬 Aankomst: {new Date(combo.flight.legs[combo.flight.legs.length - 1]?.arrTime || "").toLocaleString("nl-NL")}</p>
                      {combo.flight.carriers && combo.flight.carriers.length > 0 && (
                        <p>🏢 Maatschappij: {combo.flight.carriers.join(", ")}</p>
                      )}
                      <p className="font-semibold text-yellow-400">💰 €{Math.round(combo.flight.price.amount)}</p>
                    </div>
                  </div>

                  {/* Hotel Details */}
                  {combo.hotel && (
                    <div>
                      <h3 className="text-white font-bold text-lg mb-2">🏨 Hotel</h3>
                      <div className="space-y-1 text-sm text-white/90">
                        <p className="font-medium">{combo.hotel.name}</p>
                        {combo.hotel.stars && (
                          <p>⭐ {combo.hotel.stars} sterren</p>
                        )}
                        {combo.hotel.price && (
                          <p className="font-semibold text-yellow-400">💰 €{Math.round(combo.hotel.price.amount)}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Total Price */}
                  <div className="pt-3 border-t border-white/20">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold">Totaal:</span>
                      <span className="text-2xl font-bold text-yellow-400">€{Math.round(combo.totalPrice)}</span>
                    </div>
                  </div>

                  {/* Book Button */}
                  <button className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-black font-bold py-3 rounded-xl transition-all duration-300 shadow-lg">
                    Boek nu →
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Load More Button */}
          {displayCount < combos.length && (
            <div className="mt-8 text-center">
              <button
                onClick={handleLoadMore}
                className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur-md text-white px-8 py-4 rounded-xl font-semibold hover:from-yellow-400/30 hover:to-orange-400/30 transition-all duration-300 shadow-lg border border-yellow-400/30"
              >
                Meer laden ({combos.length - displayCount} nog te zien)
              </button>
            </div>
          )}

          {/* No more results */}
          {displayCount >= combos.length && combos.length > 0 && (
            <div className="mt-8 text-center">
              <p className="text-white/80">Je hebt alle vluchten gezien</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RouteDetailsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen relative overflow-hidden">
        <div className="fixed inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/beach-hero.jpg')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-yellow-400 rounded-full animate-spin"></div>
            </div>
            <p className="text-white text-xl font-semibold drop-shadow-lg">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <RouteDetailsContent />
    </Suspense>
  );
}
