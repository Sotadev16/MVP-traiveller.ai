"use client";

import Link from "next/link";
import type { ContentType } from "@/content/home";

interface ChoiceBlockProps {
  content: ContentType;
}

export default function ChoiceBlock({  }: ChoiceBlockProps) {
  return (
    <section className="relative z-20 py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-stone-50 via-amber-50/50 to-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#1e3a5f] mb-6 uppercase tracking-tight leading-tight">
            KIES JOUW MANIER VAN REIZEN
          </h2>
          <p className="text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
            Twee manieren om je reis te boeken — laat Ai je helpen of zoek het zzelf via onze handige filters. Jij kiest.
          </p>
        </div>

        {/* Two Columns - Professional Design */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Planner Column */}
          <article className="group relative bg-white rounded-3xl p-10 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden">
            {/* Subtle gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500" />

            <div className="relative z-10">
              {/* Icon Badge */}
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>

              <h3 className="text-3xl sm:text-4xl font-black text-gray-900 mb-5 tracking-tight">
                Ai-planner
              </h3>

              <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-8 font-medium">
                Laat AI je helpen met een personlijke reis op maat. Perfect als je inspiralte zoekt of geen tijd hebt om te ver·
              </p>

              <Link
                href="/palm-intake"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-4 px-8 rounded-full text-base shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl uppercase tracking-wide"
                aria-label="Start met AI"
              >
                Start met AI
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </article>

          {/* Self Search Column */}
          <article className="group relative bg-white rounded-3xl p-10 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden">
            {/* Subtle gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700" />

            <div className="relative z-10">
              {/* Icon Badge */}
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <h3 className="text-3xl sm:text-4xl font-black text-gray-900 mb-5 tracking-tight">
                Zelf Zoeken
              </h3>

              <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-8 font-medium">
                Liever zelf controleren? Gebruik onze zoekfunctie om direct vluchten en hotels te bekijken met echte prijzen via onze partners.
              </p>

              <Link
                href="/results"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-4 px-8 rounded-full text-base shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl uppercase tracking-wide"
                aria-label="Bekijk Resultaten"
              >
                Bekijk Resultaten
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
