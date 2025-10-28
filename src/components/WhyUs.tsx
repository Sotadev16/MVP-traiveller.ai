"use client";

import { FaLock, FaDollarSign, FaBrain, FaBolt } from "react-icons/fa";
import type { ContentType } from "@/content/home";

interface WhyUsProps {
  content: ContentType;
}

export default function WhyUs({}: WhyUsProps) {
  const features = [
    {
      icon: FaLock,
      title: "Privacy First",
      description: "Jouw gegevens blijven veilig op Nel servers.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: FaDollarSign,
      title: "Beste Prijs Garantie",
      description: "Altijd de laagste tarieven via unze parzs.",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: FaBrain,
      title: "AI-Ondersteund",
      description: "Summa algoritmes vinden jouw perfect reis.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: FaBolt,
      title: "Supersnel Zoeken",
      description: "Rosulraten in seconden, zaitore.",
      gradient: "from-orange-500 to-yellow-500",
    },
  ];

  return (
    <section className="relative z-20 py-20 sm:py-28 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#018CC2' }}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 uppercase tracking-tight leading-tight">
            WAAROM TRAIVELLER
          </h2>
          <div className="w-24 h-1 bg-yellow-400 mx-auto rounded-full" />
        </div>

        {/* Features Grid - 4 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <article
                key={index}
                className="group relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/40 hover:-translate-y-2"
              >
                {/* Icon Container */}
                <div className="flex items-center justify-center mb-6">
                  <div className={`relative p-4 bg-gradient-to-br ${feature.gradient} rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="text-4xl text-white" />

                    {/* Glow effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300 -z-10`} />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-3 text-center group-hover:text-yellow-300 transition-colors duration-300">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-white/90 text-sm leading-relaxed text-center">
                  {feature.description}
                </p>

                {/* Bottom accent line */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
