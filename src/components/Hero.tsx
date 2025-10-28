"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ContentType } from "@/content/home";

interface HeroProps {
  content: ContentType;
}

export default function Hero({  }: HeroProps) {
  const router = useRouter();
  const [to, setTo] = useState("");

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (to) {
      router.push(`/results?to=${to}`);
    }
  };

  return (
    <section className="relative z-10 min-h-screen flex items-center justify-center pt-24 sm:pt-32 pb-16 px-4">
      <div className="relative z-20 w-full max-w-6xl mx-auto">
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

        {/* QuickSearch - Horizontal Single Line */}
        <div className="max-w-4xl mx-auto px-4">
          <form onSubmit={handleQuickSearch} className="flex flex-col sm:flex-row gap-3 items-stretch">
            {/* From - Static Display */}
            <div className="flex items-center bg-white rounded-full px-6 py-4 shadow-xl flex-shrink-0">
              <span className="text-gray-600 font-medium text-sm mr-4">From</span>
              <span className="text-gray-900 font-semibold text-sm">
                AMS • RTM • BRU • DUS
              </span>
            </div>

            {/* To - Input */}
            <div className="flex items-center bg-white rounded-full px-6 py-4 shadow-xl flex-1">
              <span className="text-gray-600 font-medium text-sm mr-4">To</span>
              <input
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder=""
                className="flex-1 text-gray-900 font-semibold text-sm outline-none bg-transparent"
                aria-label="Destination"
              />
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
