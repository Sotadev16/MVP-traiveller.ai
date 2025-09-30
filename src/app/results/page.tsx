"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Head from "next/head";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { FaChevronDown } from "react-icons/fa";

interface TravelOption {
  id: string;
  title: string;
  price: number;
  currency: string;
  duration: number; // in nights
  rating: number;
  description: string;
  image: string;
  origin: string;
  destination: string;
  hotel: {
    name: string;
    rating: number;
  };
  score: number; // recommendation score 0-1
  bookUrl: string;
  type: "flight" | "cruise" | "surprise";
  highlights: string[];
}

// Mock API function - simulates database/API call
const getMockTravelOptions = (): TravelOption[] => [
  {
    id: "1",
    title: "🏝️ Zonnige Aruba Strandvakantie",
    price: 1450,
    currency: "EUR",
    duration: 7,
    rating: 4.8,
    description:
      "Perfect strandparadijs met kristalhelder water en witte stranden. Inclusief vlucht, hotel en ontbijt.",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    origin: "AMS",
    destination: "Aruba",
    hotel: {
      name: "Palm Beach Resort & Spa",
      rating: 4.5,
    },
    score: 0.92,
    bookUrl: "#",
    type: "flight",
    highlights: [
      "🛫 Direct vlucht",
      "🏖️ Strandlocatie",
      "🍳 Ontbijt inbegrepen",
      "💎 Beste prijs",
    ],
  },
  {
    id: "2",
    title: "🚢 Mediterrane Cruise Ervaring",
    price: 1200,
    currency: "EUR",
    duration: 8,
    rating: 4.6,
    description:
      "Ontdek de prachtige havensteden van de Middellandse Zee op deze luxe cruise met balkonhut.",
    image:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    origin: "Barcelona",
    destination: "Middellandse Zee",
    hotel: {
      name: "MSC Seaside",
      rating: 4.3,
    },
    score: 0.87,
    bookUrl: "#",
    type: "cruise",
    highlights: [
      "🛳️ Balkonhut",
      "🍽️ All-inclusive",
      "🌍 5 bestemmingen",
      "⭐ Populair",
    ],
  },
  {
    id: "3",
    title: "🗼 Romantisch Parijs Weekend",
    price: 650,
    currency: "EUR",
    duration: 3,
    rating: 4.7,
    description:
      "Perfecte stedentrip naar de stad van de liefde. Centraal gelegen boutique hotel in Le Marais.",
    image:
      "https://images.unsplash.com/photo-1549144511-f099e773c147?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    origin: "AMS",
    destination: "Parijs",
    hotel: {
      name: "Hotel Le Marais Boutique",
      rating: 4.4,
    },
    score: 0.85,
    bookUrl: "#",
    type: "flight",
    highlights: [
      "🏰 Centrale locatie",
      "💕 Romantisch",
      "⚡ Korte vlucht",
      "🏆 Handigst",
    ],
  },
  {
    id: "4",
    title: "🏛️ Avontuurlijke Thaise Verkenning",
    price: 1800,
    currency: "EUR",
    duration: 12,
    rating: 4.9,
    description:
      "Ontdek het betoverende Thailand: van Bangkok's tempels tot de paradijselijke eilanden van het zuiden.",
    image:
      "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    origin: "AMS",
    destination: "Thailand",
    hotel: {
      name: "Premium Mixed Accommodaties",
      rating: 4.2,
    },
    score: 0.91,
    bookUrl: "#",
    type: "surprise",
    highlights: [
      "🌴 3 bestemmingen",
      "🛕 Culturele ervaring",
      "🏖️ Strand + Stad",
      "🌟 Beste kwaliteit",
    ],
  },
  {
    id: "5",
    title: "🏺 Luxe Griekse Eilanden Tour",
    price: 2100,
    currency: "EUR",
    duration: 10,
    rating: 4.8,
    description:
      "Verken de prachtige Griekse eilanden Santorini en Mykonos in luxe stijl met zeezicht villa's.",
    image:
      "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    origin: "AMS",
    destination: "Griekenland",
    hotel: {
      name: "Santorini Villa Collections",
      rating: 4.7,
    },
    score: 0.89,
    bookUrl: "#",
    type: "flight",
    highlights: [
      "🏛️ Luxe accommodatie",
      "🌊 Zeezicht",
      "🚗 Privé transfers",
      "💰 Premium deal",
    ],
  },
  {
    id: "6",
    title: "🌺 Caribbean Cruise Adventure",
    price: 1650,
    currency: "EUR",
    duration: 9,
    rating: 4.5,
    description:
      "Ontdek de Caribische eilanden op deze spectaculaire cruise vanuit Miami met suite accommodatie.",
    image:
      "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    origin: "Miami",
    destination: "Caribbean",
    hotel: {
      name: "Royal Caribbean Explorer",
      rating: 4.4,
    },
    score: 0.83,
    bookUrl: "#",
    type: "cruise",
    highlights: [
      "🛏️ Suite hut",
      "🏝️ 6 eilanden",
      "🎭 Entertainment",
      "☀️ Tropisch",
    ],
  },
];

function ResultsContent() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<TravelOption[]>([]);
  const [filteredResults, setFilteredResults] = useState<TravelOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    maxPrice: "",
    duration: "",
    rating: "",
  });

  const applyFilters = useCallback(() => {
    let filtered = [...results];

    if (filters.maxPrice) {
      filtered = filtered.filter(
        (option) => option.price <= parseInt(filters.maxPrice)
      );
    }

    if (filters.duration) {
      filtered = filtered.filter(
        (option) => option.duration === parseInt(filters.duration)
      );
    }

    if (filters.rating) {
      filtered = filtered.filter(
        (option) => option.rating >= parseFloat(filters.rating)
      );
    }

    // Sort by recommendation score
    filtered.sort((a, b) => b.score - a.score);

    setFilteredResults(filtered);
  }, [filters, results]);

  useEffect(() => {
    // Simulate API call with query parameters
    const fetchResults = async () => {
      setLoading(true);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Get mock data
      const options = getMockTravelOptions();

      // Filter based on query parameters if needed
      const intakeId = searchParams.get("id");
      console.log("Loading results for intake:", intakeId);

      setResults(options);
      setFilteredResults(options);
      setLoading(false);
    };

    fetchResults();
  }, [searchParams]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      maxPrice: "",
      duration: "",
      rating: "",
    });
  };

  interface CustomSelectProps {
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
  }

  const CustomSelect = ({
    label,
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
      options.find((opt) => opt.value === value)?.label || options[0].label;

    return (
      <div
        className="flex-1 min-w-[140px] bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/30 transition-all duration-200 relative rounded-xl"
        style={{ zIndex: 100 }}
        ref={dropdownRef}
      >
        <div className="flex items-center px-4 py-3 gap-3">
          <label className="text-sm font-medium text-white/90 whitespace-nowrap flex-shrink-0">
            {label}
          </label>
          <div className="relative flex-1 min-w-0">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-between w-full text-sm text-left border-0 outline-0 cursor-pointer text-white hover:text-yellow-400 transition-colors duration-200 bg-transparent"
            >
              <span className="truncate">{selectedLabel}</span>
              <FaChevronDown
                className={`ml-2 text-yellow-400 transition-transform duration-200 flex-shrink-0 text-xs ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isOpen && (
              <div
                className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden max-h-48 overflow-y-auto bg-slate-900/98 backdrop-blur-md border border-white/30 shadow-2xl"
                style={{ zIndex: 100000 }}
              >
                {options.map((option) => (
                  <div
                    key={option.value}
                    className={`px-3 py-3 cursor-pointer transition-all duration-200 first:rounded-t-xl last:rounded-b-xl ${
                      option.value === value
                        ? "bg-yellow-400/20 text-yellow-400 font-medium"
                        : "text-white/90 hover:bg-white/15 hover:text-yellow-400"
                    }`}
                    onClick={() => handleSelect(option.value)}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const formatPrice = (price: number, currency: string = "EUR") => {
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: currency,
    }).format(price);
  };

  const getQueryChips = () => {
    const chips = [];
    const id = searchParams.get("id");

    if (id) {
      chips.push(`Zoekresultaat ID: ${id}`);
    }

    // Add more chips based on query parameters
    const params = [
      { key: "type", label: "Type" },
      { key: "budget", label: "Budget" },
      { key: "destination", label: "Bestemming" },
      { key: "adults", label: "Volwassenen" },
      { key: "children", label: "Kinderen" },
    ];

    params.forEach((param) => {
      const value = searchParams.get(param.key);
      if (value) {
        chips.push(`${param.label}: ${value}`);
      }
    });

    return chips;
  };

  return (
    <>
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

        <main
          className="relative z-10 w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-4 sm:py-6 md:py-8"
          style={{ paddingTop: "120px" }}
        >
          <div className="mb-6 sm:mb-8 text-center">
            <h1 className="font-black leading-none tracking-tight mb-3 sm:mb-4">
              <div className="text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] [text-shadow:_2px_2px_4px_rgba(0,0,0,0.9)]">
                <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tighter">
                  JOUW PERFECTE
                </span>
                <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tighter mt-1 text-yellow-400">
                  REISMATCHES
                </span>
              </div>
            </h1>
            <p className="text-white/90 text-sm sm:text-base md:text-lg drop-shadow-lg px-2 sm:px-0 font-medium">
              Handpicked door onze AI • Beste prijzen gegarandeerd • Klaar om te
              boeken
            </p>
          </div>

          {/* Query summary chips */}
          <div className="flex flex-wrap gap-2 my-2.5 mb-6 justify-center">
            {getQueryChips().map((chip, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm text-white/80 font-medium"
              >
                {chip}
              </span>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-2 sm:gap-2.5 flex-wrap my-3 mb-6 p-3 sm:p-4 md:p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 relative z-50">
            <div className="flex gap-2 items-center rounded-lg px-3 py-3 flex-1 min-w-[140px] bg-white/10 border border-white/20">
              <label className="text-sm font-semibold text-white/80 whitespace-nowrap">
                Max prijs
              </label>
              <input
                type="number"
                placeholder="€"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                className="border-0 outline-0 w-full bg-transparent text-sm flex-1 text-white placeholder:text-white/50"
              />
            </div>

            <CustomSelect
              label="Nachten"
              value={filters.duration}
              onChange={(value) => handleFilterChange("duration", value)}
              options={[
                { value: "", label: "Alle" },
                { value: "3", label: "3 nachten" },
                { value: "7", label: "7 nachten" },
                { value: "8", label: "8 nachten" },
                { value: "9", label: "9 nachten" },
                { value: "10", label: "10 nachten" },
                { value: "12", label: "12 nachten" },
              ]}
            />

            <CustomSelect
              label="Min. rating"
              value={filters.rating}
              onChange={(value) => handleFilterChange("rating", value)}
              options={[
                { value: "", label: "Alle" },
                { value: "4.0", label: "4.0+" },
                { value: "4.5", label: "4.5+" },
                { value: "4.7", label: "4.7+" },
              ]}
            />

            <button
              className="border-0 bg-yellow-400 text-black rounded-lg px-4 py-3 font-bold cursor-pointer transition-all duration-300 ease-out hover:bg-yellow-500 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-yellow-400/30 text-sm whitespace-nowrap flex-shrink-0"
              onClick={applyFilters}
            >
              Toepassen
            </button>

            <button
              className="bg-transparent rounded-lg px-4 py-3 font-bold cursor-pointer transition-all duration-300 ease-out text-sm whitespace-nowrap flex-shrink-0"
              style={{
                color: "#ffffff",
                borderColor: "#1e293b",
                border: "1px solid #1e293b",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#1e293b";
                e.currentTarget.style.color = "#e9eef7";
                e.currentTarget.style.borderColor = "#a9b7cd";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#ffffff";
                e.currentTarget.style.borderColor = "#1e293b";
              }}
              onClick={resetFilters}
            >
              Reset
            </button>
          </div>

          {loading ? (
            <div className="p-10 text-center" style={{ color: "#ffffff" }}>
              <div className="flex flex-col items-center gap-6 py-16">
                {/* Animated spinner */}
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-spin"></div>
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-yellow-400 rounded-full animate-spin"></div>
                  <div
                    className="absolute top-2 left-2 w-12 h-12 border-4 border-transparent border-t-blue-400 rounded-full animate-spin"
                    style={{
                      animationDirection: "reverse",
                      animationDuration: "0.8s",
                    }}
                  ></div>
                  <div
                    className="absolute top-4 left-4 w-8 h-8 border-4 border-transparent border-t-green-400 rounded-full animate-spin"
                    style={{ animationDuration: "0.6s" }}
                  ></div>
                </div>

                {/* Loading text with animation */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-2 animate-pulse">
                    Zoeken naar de beste reisopties voor jou...
                  </h3>
                  <p className="text-gray-400 animate-fade-in">
                    Onze AI analyseert duizenden opties om jou de perfecte
                    matches te bieden
                  </p>
                </div>

                {/* Progress dots */}
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-green-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.3s" }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-pink-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>

                {/* Loading stats */}
                <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-8 text-center">
                  <div className="text-gray-400">
                    <div className="text-xl sm:text-2xl font-bold text-yellow-400 animate-pulse">
                      1000+
                    </div>
                    <div className="text-xs sm:text-sm">Hotels gecheckt</div>
                  </div>
                  <div className="text-gray-400">
                    <div className="text-xl sm:text-2xl font-bold text-blue-400 animate-pulse">
                      500+
                    </div>
                    <div className="text-xs sm:text-sm">
                      Vluchten vergeleken
                    </div>
                  </div>
                  <div className="text-gray-400">
                    <div className="text-xl sm:text-2xl font-bold text-green-400 animate-pulse">
                      50+
                    </div>
                    <div className="text-xs sm:text-sm">Cruise opties</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="my-2.5 text-sm text-white">
                {filteredResults.length} resultaten gevonden
              </div>

              {filteredResults.length > 0 ? (
                <div className="grid gap-3 sm:gap-4 md:gap-5">
                  {filteredResults.map((option, index) => (
                    <article
                      key={option.id}
                      className="rounded-3xl overflow-hidden shadow-2xl grid transition-all duration-[400ms] ease-out transform translate-y-0 opacity-0 animate-[cardFadeIn_0.6s_ease-out_forwards] group lg:grid-cols-[280px_1fr] grid-cols-1 bg-white/20 backdrop-blur-sm border border-white/40 hover:border-yellow-400/80 hover:bg-white/30"
                      style={{
                        animationDelay: `${(index + 1) * 100}ms`,
                        boxShadow: "0 12px 40px rgba(0,0,0,.35)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-8px)";
                        e.currentTarget.style.boxShadow =
                          "0 25px 60px rgba(250,204,21,0.3), 0 12px 40px rgba(0,0,0,.35)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 12px 40px rgba(0,0,0,.35)";
                      }}
                    >
                      <div className="relative overflow-hidden h-full lg:min-h-[240px] h-[200px] sm:h-[220px] md:h-[240px]">
                        <Image
                          src={option.image}
                          alt={option.title}
                          fill
                          className="object-cover"
                        />

                        {/* Rating badge - top right */}
                        <div className="absolute top-4 right-4">
                          <div className="bg-black/70 backdrop-blur text-white font-bold px-2 py-1 rounded-full text-xs flex items-center gap-1">
                            ⭐ {option.rating}
                          </div>
                        </div>

                        {/* Single quality label per card - top left */}
                        {(() => {
                          if (option.type === "cruise") {
                            return (
                              <div className="absolute top-4 left-4">
                                <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold px-3 py-1.5 rounded-full text-xs shadow-lg">
                                  🚢 Binnenkort beschikbaar
                                </div>
                              </div>
                            );
                          } else if (index === 0) {
                            return (
                              <div className="absolute top-4 left-4">
                                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold px-3 py-1.5 rounded-full text-xs shadow-lg">
                                  🏆 Topkwaliteit
                                </div>
                              </div>
                            );
                          } else if (
                            option.price ===
                            Math.min(...filteredResults.map((r) => r.price))
                          ) {
                            return (
                              <div className="absolute top-4 left-4">
                                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold px-3 py-1.5 rounded-full text-xs shadow-lg">
                                  💰 Beste prijs
                                </div>
                              </div>
                            );
                          } else if (option.score > 0.88) {
                            return (
                              <div className="absolute top-4 left-4">
                                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-3 py-1.5 rounded-full text-xs shadow-lg">
                                  🔥 Populair
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>

                      <div className="p-4 sm:p-5 lg:p-6 flex flex-col">
                        {/* Header with title and route */}
                        <div className="mb-3">
                          <h3 className="font-black m-0 mb-2 text-xl sm:text-2xl lg:text-xl text-white group-hover:text-yellow-400 transition-colors duration-300">
                            {option.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm sm:text-base lg:text-sm">
                            <span className="font-semibold text-teal-300">
                              {option.origin} → {option.destination}
                            </span>
                            <span className="text-white">•</span>
                            <span className="text-white">
                              {option.duration} nachten
                            </span>
                          </div>
                        </div>

                        {/* Hotel info */}
                        <p className="text-sm sm:text-base lg:text-sm text-white leading-relaxed m-0 mb-4 flex-grow">
                          <span className="font-medium text-white">
                            🏨 {option.hotel.name}
                          </span>
                          <br />
                          {option.description}
                        </p>

                        {/* Key highlights - show only 3 most important */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {option.highlights
                            .slice(0, 3)
                            .map((highlight, index) => (
                              <span
                                key={index}
                                className="text-xs sm:text-sm lg:text-xs px-2 py-1 bg-gray-600 text-yellow-300 rounded-full font-medium border border-slate-600"
                              >
                                {highlight}
                              </span>
                            ))}
                        </div>

                        {/* Bottom section with price and booking */}
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-auto pt-3 border-t border-white/10">
                          <div className="flex flex-col">
                            <div className="text-2xl sm:text-3xl lg:text-2xl font-black text-white mb-1">
                              {formatPrice(option.price, option.currency)}
                            </div>
                            <div className="text-sm text-white">
                              per persoon
                            </div>
                          </div>

                          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-2">
                            <div className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-full font-bold">
                              {Math.round(option.score * 100)}% match
                            </div>
                            <a
                              href={option.bookUrl}
                              className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-black no-underline px-6 py-3 rounded-lg font-black text-sm transition-all duration-300 ease-out transform translate-y-0 inline-block hover:-translate-y-1 hover:shadow-xl flex-shrink-0"
                            >
                              Boek nu
                            </a>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center" style={{ color: "#a9b7cd" }}>
                  <p>Geen resultaten gevonden met de huidige filters.</p>
                  <button
                    className="border-0 bg-yellow-400 text-black rounded-lg px-4 py-2.5 font-bold cursor-pointer transition-all duration-300 ease-out hover:bg-yellow-500 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-yellow-400/30"
                    onClick={resetFilters}
                  >
                    Reset filters
                  </button>
                </div>
              )}
            </>
          )}
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
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-yellow-400 rounded-full animate-spin mx-auto"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
