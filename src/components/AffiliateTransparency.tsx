"use client";

import { FaInfoCircle, FaPlane, FaHotel, FaGem } from "react-icons/fa";
import type { ContentType } from "@/content/home";

interface AffiliateTransparencyProps {
  content: ContentType;
}

export default function AffiliateTransparency({ content }: AffiliateTransparencyProps) {
  return (
    <section className="relative z-20 py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-slate-50 to-white">
      <div className="max-w-5xl mx-auto">
        <div className="relative bg-white rounded-3xl p-10 sm:p-12 shadow-xl border border-gray-100 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full blur-3xl opacity-30 -z-10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full blur-3xl opacity-30 -z-10" />

          <div className="relative z-10">
            {/* Badge */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-6 py-2.5">
                <FaInfoCircle className="text-blue-600 text-lg" />
                <span className="text-blue-700 font-semibold text-sm uppercase tracking-wide">
                  {content.affiliateTransparency.poweredBy}
                </span>
              </div>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-6 text-center tracking-tight">
              {content.affiliateTransparency.headline}
            </h2>

            {/* Text Content */}
            <p className="text-gray-600 text-lg sm:text-xl leading-relaxed text-center max-w-3xl mx-auto mb-12 font-medium">
              {content.affiliateTransparency.text}
            </p>

            {/* Trust Indicators - Redesigned */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="group relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 border border-blue-100">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FaPlane className="text-3xl text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Flights</h3>
                  <p className="text-sm text-gray-600 font-medium">via Aviasales</p>
                </div>
              </div>

              <div className="group relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 border border-purple-100">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FaHotel className="text-3xl text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Hotels</h3>
                  <p className="text-sm text-gray-600 font-medium">via Hotellook</p>
                </div>
              </div>

              <div className="group relative bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 border border-yellow-100">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FaGem className="text-3xl text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Free Forever</h3>
                  <p className="text-sm text-gray-600 font-medium">No hidden fees</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
