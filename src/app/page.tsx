"use client";

import { useState, FormEvent, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaBolt,
  FaLock,
  FaBrain,
  FaDollarSign,
  FaPaperPlane,
  FaMapMarkedAlt,
  FaCamera,
  FaCocktail,
  FaUmbrellaBeach,
  FaPassport,
  FaGlobeAmericas,
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaEnvelope,
  FaMapMarkerAlt,
  FaArrowRight,
} from "react-icons/fa";
import Navbar from "@/components/Navbar";

export default function Home() {
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [timestamp, setTimestamp] = useState(0);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (honeypot.trim().length > 0 || Date.now() - timestamp < 2000) {
      alert("Inzending geweigerd.");
      return;
    }
    console.log("Newsletter submitted:", email);
    alert("Aanmelding succesvol!");
    setEmail("");
  };

  useEffect(() => {
    setTimestamp(Date.now());
  }, []);

  return (
    <div className="min-h-screen bg-dark-bg text-dark-fg overflow-x-hidden">
      <Navbar />

      {/* Parallax Background - Fixed */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/homeScreenWallpaper.png"
          alt="Beautiful Beach Paradise"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Enhanced overlay for better text readability */}
        <div className="absolute " />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20"></div>
      </div>

      {/* Hero Section */}
      <main className="mt-16 relative z-10 min-h-screen flex items-center justify-center pt-16 sm:pt-20">
        {/* Content Container */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Main Title with Gaming-Inspired Typography */}
          <div className="mb-8 sm:mb-12">
            <h1 className="font-black leading-none tracking-tight">
              <div
                className="mt-15 animate-slide-up text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] [text-shadow:_2px_2px_4px_rgba(0,0,0,0.9)]"
                style={{ animationDelay: "0.2s" }}
              >
                <span className="block text-3xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tighter">
                  SLIMME AI
                </span>
                <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tighter mt-2">
                  REISPLANNER
                </span>
              </div>
              <div
                className="animate-slide-up mt-4 sm:mt-6"
                style={{ animationDelay: "0.6s" }}
              >
                <span className="block text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-400 bg-clip-text text-yellow-500 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] [text-shadow:_2px_2px_4px_rgba(0,0,0,0.9)] tracking-wide">
                  LAAT JE VERRASSEN IN SECONDEN
                </span>
              </div>
            </h1>
          </div>

          {/* Subtitle */}
          <p
            className="animate-fade-in text-white/95 text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] [text-shadow:_1px_1px_3px_rgba(0,0,0,0.9)] tracking-wide"
            style={{ animationDelay: "1s" }}
          >
            Jouw perfecte vakantie, gepersonaliseerd door AI
          </p>

          {/* Primary CTA Button - Responsive & Gaming Style */}
          <div
            className="animate-scale-in mb-16 sm:mb-20"
            style={{ animationDelay: "1.4s" }}
          >
            <Link
              href="/palm-intake"
              className="group inline-flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 hover:from-yellow-300 hover:via-orange-300 hover:to-yellow-400 text-black font-black py-4 sm:py-6 px-6 sm:px-10 rounded-full text-sm sm:text-xl shadow-2xl transform transition-all duration-500 hover:-translate-y-3 hover:shadow-yellow-400/60 hover:scale-105 tracking-wider"
            >
              <FaPaperPlane className="text-sm sm:text-xl" />
              <span className="font-black tracking-wider">
                PLAN MIJN DROOMREIS
              </span>
              <span className="ml-1 sm:ml-2 group-hover:translate-x-2 transition-transform duration-300">
                →
              </span>
            </Link>
          </div>

          {/* Trust Badges - Structured like How It Works cards */}
          <div
            className="animate-fade-in grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
            style={{ animationDelay: "1s" }}
          >
            {[
              {
                icon: <FaLock className="text-3xl text-yellow-400" />,
                title: "PRIVACY-FIRST",
                description:
                  "Jouw gegevens blijven veilig - Nederlandse servers en volledige transparantie",
                color: "from-yellow-500/20 via-orange-500/10 to-transparent",
                borderColor: "border-yellow-300/30",
                hoverBorder: "hover:border-yellow-400/80",
                hoverShadow: "hover:shadow-yellow-400/40",
                iconBg: "from-yellow-400/40 to-orange-500/40",
                titleColor: "group-hover:text-yellow-300"
              },
              {
                icon: <FaDollarSign className="text-3xl text-yellow-400" />,
                title: "BESTE PRIJS GARANTIE",
                description:
                  "Altijd de scherpste prijzen - vinden we het goedkoper? Je krijgt het verschil terug",
                color: "from-emerald-500/20 via-green-500/10 to-transparent",
                borderColor: "border-emerald-300/30",
                hoverBorder: "hover:border-green-400/80",
                hoverShadow: "hover:shadow-green-400/40",
                iconBg: "from-emerald-400/40 to-green-500/40",
                titleColor: "group-hover:text-green-300"
              },
              {
                icon: <FaBrain className="text-3xl text-yellow-400" />,
                title: "AI-ONDERSTEUND",
                description:
                  "Slimme algoritmes vinden jouw perfecte droombestemming in seconden",
                color: "from-blue-500/20 via-cyan-500/10 to-transparent",
                borderColor: "border-cyan-300/30",
                hoverBorder: "hover:border-cyan-400/80",
                hoverShadow: "hover:shadow-cyan-400/40",
                iconBg: "from-blue-400/40 to-cyan-500/40",
                titleColor: "group-hover:text-cyan-300"
              },
              {
                icon: <FaBolt className="text-3xl text-yellow-400" />,
                title: "SUPERSNEL ZOEKEN",
                description:
                  "Van zoeken tot boeken in 60 seconden - de snelste reisplanner van Nederland",
                color: "from-purple-500/20 via-pink-500/10 to-transparent",
                borderColor: "border-purple-300/30",
                hoverBorder: "hover:border-pink-400/80",
                hoverShadow: "hover:shadow-pink-400/40",
                iconBg: "from-purple-400/40 to-pink-500/40",
                titleColor: "group-hover:text-pink-300"
              },
            ].map((badge, index) => (
              <div
                key={index}
                className={`group relative bg-gradient-to-br ${badge.color} border ${badge.borderColor} ${badge.hoverBorder} rounded-3xl p-6 sm:p-8 shadow-2xl min-h-[280px] flex flex-col transition-all duration-700 hover:-translate-y-4 ${badge.hoverShadow} backdrop-blur-lg overflow-hidden hover:bg-gradient-to-br hover:${badge.color.replace('/10', '/15')} opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards]`}
                style={{ animationDelay: `${2000 + index * 200}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${badge.color.replace('/10', '/10')} opacity-0 group-hover:opacity-100 transition-all duration-700`}></div>
                <div className={`absolute -inset-1 bg-gradient-to-br ${badge.iconBg} rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-lg -z-10`}></div>
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center justify-center mb-6">
                    <div className={`flex items-center justify-center w-16 h-16 bg-gradient-to-br ${badge.iconBg} rounded-2xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500`}>
                      {badge.icon}
                    </div>
                  </div>
                  <h3 className={`text-lg sm:text-xl font-black mb-4 text-white transition-colors duration-300 ${badge.titleColor} drop-shadow-lg [text-shadow:_2px_2px_4px_rgba(0,0,0,0.8)] tracking-wide text-center`}>
                    {badge.title}
                  </h3>
                  <p className="text-white/95 text-sm sm:text-base flex-grow leading-relaxed group-hover:text-white drop-shadow-sm [text-shadow:_1px_1px_3px_rgba(0,0,0,0.7)] font-medium text-center">
                    {badge.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* How It Works Section - 3 Steps */}
      <section className="relative z-20 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-black leading-none tracking-tight mb-6">
              <div className="text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] [text-shadow:_2px_2px_4px_rgba(0,0,0,0.9)]">
                <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter">
                  ZO SIMPEL
                </span>
                <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter mt-2 text-yellow-400">
                  WERKT HET
                </span>
              </div>
            </h2>
            <p className="text-white/95 text-lg sm:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-lg [text-shadow:_1px_1px_3px_rgba(0,0,0,0.8)]">
              Van droomreis tot boeking in 3 eenvoudige stappen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              {
                step: "1",
                title: "Vul je voorkeuren in",
                description: "Vertel ons over je droomreis: budget, bestemming, reisgenoten en wat je leuk vindt",
                icon: "📝",
                color: "from-blue-500/20 via-cyan-500/10 to-transparent",
                borderColor: "border-cyan-300/30",
                hoverBorder: "hover:border-cyan-400/80",
                hoverShadow: "hover:shadow-cyan-400/40",
                iconBg: "from-blue-400/40 to-cyan-500/40",
                titleColor: "group-hover:text-cyan-300"
              },
              {
                step: "2",
                title: "Ontvang 3 opties",
                description: "Onze AI selecteert de 3 beste reisopties speciaal voor jou, met de beste prijzen",
                icon: "🎯",
                color: "from-purple-500/20 via-pink-500/10 to-transparent",
                borderColor: "border-purple-300/30",
                hoverBorder: "hover:border-pink-400/80",
                hoverShadow: "hover:shadow-pink-400/40",
                iconBg: "from-purple-400/40 to-pink-500/40",
                titleColor: "group-hover:text-pink-300"
              },
              {
                step: "3",
                title: "Boek je droomreis",
                description: "Kies je favoriete optie en boek direct - wij regelen alles voor de perfecte vakantie",
                icon: "✈️",
                color: "from-emerald-500/20 via-green-500/10 to-transparent",
                borderColor: "border-emerald-300/30",
                hoverBorder: "hover:border-green-400/80",
                hoverShadow: "hover:shadow-green-400/40",
                iconBg: "from-emerald-400/40 to-green-500/40",
                titleColor: "group-hover:text-green-300"
              }
            ].map((step, index) => (
              <div
                key={index}
                className={`group relative bg-gradient-to-br ${step.color} border ${step.borderColor} ${step.hoverBorder} rounded-3xl p-8 shadow-2xl min-h-[280px] flex flex-col transition-all duration-700 hover:-translate-y-4 ${step.hoverShadow} backdrop-blur-lg overflow-hidden hover:bg-gradient-to-br hover:${step.color.replace('/10', '/15')}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${step.color.replace('/10', '/10')} opacity-0 group-hover:opacity-100 transition-all duration-700`}></div>
                <div className={`absolute -inset-1 bg-gradient-to-br ${step.iconBg} rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-lg -z-10`}></div>
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`flex items-center justify-center w-16 h-16 bg-gradient-to-br ${step.iconBg} rounded-2xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500`}>
                      <span className="text-3xl">{step.icon}</span>
                    </div>
                    <div className="flex items-center justify-center w-12 h-12 bg-yellow-400 rounded-full">
                      <span className="text-xl font-black text-black">{step.step}</span>
                    </div>
                  </div>
                  <h3 className={`text-2xl font-black mb-4 text-white transition-colors duration-300 ${step.titleColor} drop-shadow-lg [text-shadow:_2px_2px_4px_rgba(0,0,0,0.8)] tracking-wide`}>
                    {step.title}
                  </h3>
                  <p className="text-white/95 text-base flex-grow leading-relaxed group-hover:text-white drop-shadow-sm [text-shadow:_1px_1px_3px_rgba(0,0,0,0.7)] font-medium">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Repeat CTA Button */}
          <div className="text-center animate-scale-in">
            <Link
              href="/palm-intake"
              className="group inline-flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 hover:from-yellow-300 hover:via-orange-300 hover:to-yellow-400 text-black font-black py-4 sm:py-5 px-6 sm:px-8 rounded-full text-sm sm:text-lg shadow-2xl transform transition-all duration-500 hover:-translate-y-3 hover:shadow-yellow-400/60 hover:scale-105 tracking-wider"
            >
              <FaPaperPlane className="text-sm sm:text-lg" />
              <span className="font-black tracking-wider">
                START NU MIJN REIS
              </span>
              <span className="ml-1 sm:ml-2 group-hover:translate-x-2 transition-transform duration-300">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - Scrolls over parallax background */}
      <section className="relative z-20 py-20 px-6 bg-gradient-to-b  backdrop-blur-sm">
        <div className="max-w-[1200px] mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="font-black leading-none tracking-tight mb-8">
              <div className="text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] [text-shadow:_2px_2px_4px_rgba(0,0,0,0.9)]">
                <span className="block text-3xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tighter">
                  JOUW DROOMVAKANTIE
                </span>
                <span className="block text-2xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tighter mt-2 text-yellow-400 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] [text-shadow:_2px_2px_4px_rgba(0,0,0,0.9)]">
                  BEGINT HIER
                </span>
              </div>
            </h2>
            <p className="text-white text-lg sm:text-xl lg:text-2xl max-w-4xl mx-auto leading-relaxed font-medium drop-shadow-lg [text-shadow:_1px_1px_3px_rgba(0,0,0,0.8)]">
              Van tropische stranden tot spannende steden — wij maken elke reis
              onvergetelijk
            </p>
          </div>

          {/* Travel Experience Grid */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            aria-label="Reiservaringen"
          >
            <article className="group relative bg-gradient-to-br from-orange/20 via-yellow-500/10 to-transparent border border-orange-300/30 hover:border-yellow-400/80 rounded-3xl p-8 shadow-2xl min-h-[320px] flex flex-col transition-all duration-700 hover:-translate-y-4 hover:shadow-orange-400/40 backdrop-blur-lg overflow-hidden hover:bg-gradient-to-br hover:from-orange-400/20 hover:via-yellow-400/15 hover:to-transparent">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 via-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
              <div className="absolute -inset-1 bg-gradient-to-br from-orange-400/40 to-yellow-500/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-lg -z-10"></div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400/40 to-yellow-500/40 rounded-2xl mb-6 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
                  <FaUmbrellaBeach className="text-3xl text-orange-300 group-hover:text-yellow-300" />
                </div>
                <h3 className="text-2xl font-black mb-6 text-white transition-colors duration-300 group-hover:text-yellow-300 drop-shadow-lg [text-shadow:_2px_2px_4px_rgba(0,0,0,0.8)] tracking-wide">
                  STRANDPARADIJS
                </h3>
                <p className="text-white/95 text-base flex-grow leading-relaxed group-hover:text-white drop-shadow-sm [text-shadow:_1px_1px_3px_rgba(0,0,0,0.7)] font-medium">
                  Ontdek kristalhelder water, witte zandstranden en tropische
                  cocktails. Van Bali tot Barbados — jouw perfecte strand wacht
                  op je!
                </p>
              </div>
            </article>

            <article className="group relative bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-transparent border border-cyan-300/30 hover:border-cyan-400/80 rounded-3xl p-8 shadow-2xl min-h-[320px] flex flex-col transition-all duration-700 hover:-translate-y-4 hover:shadow-cyan-400/40 backdrop-blur-lg overflow-hidden hover:bg-gradient-to-br hover:from-blue-400/20 hover:via-cyan-400/15 hover:to-transparent">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-400/40 to-cyan-500/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-lg -z-10"></div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400/40 to-cyan-500/40 rounded-2xl mb-6 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
                  <FaMapMarkedAlt className="text-3xl text-blue-300 group-hover:text-cyan-300" />
                </div>
                <h3 className="text-2xl font-black mb-6 text-white transition-colors duration-300 group-hover:text-cyan-300 drop-shadow-lg [text-shadow:_2px_2px_4px_rgba(0,0,0,0.8)] tracking-wide">
                  STADSAVONTUREN
                </h3>
                <p className="text-white/95 text-base flex-grow leading-relaxed group-hover:text-white drop-shadow-sm [text-shadow:_1px_1px_3px_rgba(0,0,0,0.7)] font-medium">
                  Verken bruisende metropolen, historische centra en verborgen
                  hotspots. Van Parijs tot Tokyo — elke stad heeft haar eigen
                  magie!
                </p>
              </div>
            </article>

            <article className="group relative bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-transparent border border-purple-300/30 hover:border-pink-400/80 rounded-3xl p-8 shadow-2xl min-h-[320px] flex flex-col transition-all duration-700 hover:-translate-y-4 hover:shadow-pink-400/40 backdrop-blur-lg overflow-hidden hover:bg-gradient-to-br hover:from-purple-400/20 hover:via-pink-400/15 hover:to-transparent">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
              <div className="absolute -inset-1 bg-gradient-to-br from-purple-400/40 to-pink-500/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-lg -z-10"></div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400/40 to-pink-500/40 rounded-2xl mb-6 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
                  <FaCamera className="text-3xl text-purple-300 group-hover:text-pink-300" />
                </div>
                <h3 className="text-2xl font-black mb-6 text-white transition-colors duration-300 group-hover:text-pink-300 drop-shadow-lg [text-shadow:_2px_2px_4px_rgba(0,0,0,0.8)] tracking-wide">
                  CULTUUR & NATUUR
                </h3>
                <p className="text-white/95 text-base flex-grow leading-relaxed group-hover:text-white drop-shadow-sm [text-shadow:_1px_1px_3px_rgba(0,0,0,0.7)] font-medium">
                  Adembenemende landschappen, rijke culturen en onvergetelijke
                  momenten. Van safaris tot bergtoppen — maak memories die
                  blijven!
                </p>
              </div>
            </article>

            <article className="group relative bg-gradient-to-br from-emerald-500/20 via-green-500/10 to-transparent border border-emerald-300/30 hover:border-green-400/80 rounded-3xl p-8 shadow-2xl min-h-[320px] flex flex-col transition-all duration-700 hover:-translate-y-4 hover:shadow-green-400/40 backdrop-blur-lg overflow-hidden hover:bg-gradient-to-br hover:from-emerald-400/20 hover:via-green-400/15 hover:to-transparent">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 via-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
              <div className="absolute -inset-1 bg-gradient-to-br from-emerald-400/40 to-green-500/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-lg -z-10"></div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400/40 to-green-500/40 rounded-2xl mb-6 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
                  <FaPassport className="text-3xl text-emerald-300 group-hover:text-green-300" />
                </div>
                <h3 className="text-2xl font-black mb-6 text-white transition-colors duration-300 group-hover:text-green-300 drop-shadow-lg [text-shadow:_2px_2px_4px_rgba(0,0,0,0.8)] tracking-wide">
                  ALLES GEREGELD
                </h3>
                <p className="text-white/95 text-base flex-grow leading-relaxed group-hover:text-white drop-shadow-sm [text-shadow:_1px_1px_3px_rgba(0,0,0,0.7)] font-medium">
                  Van vluchten tot hotels, transfers tot activiteiten. Wij
                  zorgen voor alles zodat jij alleen maar hoeft te genieten van
                  je vakantie! 🎒🌟
                </p>
              </div>
            </article>

            <article className="group relative bg-gradient-to-br from-rose-500/20 via-red-500/10 to-transparent border border-rose-300/30 hover:border-red-400/80 rounded-3xl p-8 shadow-2xl min-h-[320px] flex flex-col transition-all duration-700 hover:-translate-y-4 hover:shadow-red-400/40 backdrop-blur-lg overflow-hidden hover:bg-gradient-to-br hover:from-rose-400/20 hover:via-red-400/15 hover:to-transparent">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-400/10 via-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
              <div className="absolute -inset-1 bg-gradient-to-br from-rose-400/40 to-red-500/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-lg -z-10"></div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-400/40 to-red-500/40 rounded-2xl mb-6 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
                  <FaCocktail className="text-3xl text-rose-300 group-hover:text-red-300" />
                </div>
                <h3 className="text-2xl font-black mb-6 text-white transition-colors duration-300 group-hover:text-red-300 drop-shadow-lg [text-shadow:_2px_2px_4px_rgba(0,0,0,0.8)] tracking-wide">
                  🍹 PURE ONTSPANNING
                </h3>
                <p className="text-white/95 text-base flex-grow leading-relaxed group-hover:text-white drop-shadow-sm [text-shadow:_1px_1px_3px_rgba(0,0,0,0.7)] font-medium">
                  Spa retreats, wellness resorts en romantische getaways. Tijd
                  om te ontspannen, bij te tanken en te genieten van het goede
                  leven! 💆‍♀️🌸
                </p>
              </div>
            </article>

            <article className="group relative bg-gradient-to-br from-teal-500/20 via-emerald-500/10 to-transparent border border-teal-300/30 hover:border-emerald-400/80 rounded-3xl p-8 shadow-2xl min-h-[320px] flex flex-col transition-all duration-700 hover:-translate-y-4 hover:shadow-emerald-400/40 backdrop-blur-lg overflow-hidden hover:bg-gradient-to-br hover:from-teal-400/20 hover:via-emerald-400/15 hover:to-transparent">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-400/10 via-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
              <div className="absolute -inset-1 bg-gradient-to-br from-teal-400/40 to-emerald-500/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-lg -z-10"></div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-400/40 to-emerald-500/40 rounded-2xl mb-6 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
                  <FaLock className="text-3xl text-teal-300 group-hover:text-emerald-300" />
                </div>
                <h3 className="text-2xl font-black mb-6 text-white transition-colors duration-300 group-hover:text-emerald-300 drop-shadow-lg [text-shadow:_2px_2px_4px_rgba(0,0,0,0.8)] tracking-wide">
                  🛡️ VEILIG & BETROUWBAAR
                </h3>
                <p className="text-white/95 text-base flex-grow leading-relaxed group-hover:text-white drop-shadow-sm [text-shadow:_1px_1px_3px_rgba(0,0,0,0.7)] font-medium">
                  GDPR-compliant, Nederlandse servers en transparante werkwijze.
                  Jouw privacy en veiligheid staan altijd voorop bij elke reis!
                  🔒✨
                </p>
              </div>
            </article>
          </div>

          {/* Trust & Reviews Section */}
          <div className="mt-16 animate-fade-in-card">
            <div className="relative bg-gradient-to-br from-white/10 to-white/5 border border-white/20 hover:border-yellow-400/30 rounded-3xl p-8 sm:p-10 backdrop-blur-sm overflow-hidden group transition-all duration-700 shadow-xl hover:shadow-yellow-400/10 mb-16">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-blue-500/5 to-purple-500/10 opacity-60 group-hover:opacity-80 transition-opacity duration-700"></div>

              {/* Floating Elements */}
              <div className="absolute top-10 left-[10%] w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-80 transition-all duration-1000 transform translate-y-10 group-hover:translate-y-0"></div>
              <div className="absolute bottom-10 right-[15%] w-32 h-32 bg-gradient-to-bl from-blue-400/20 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-70 transition-all duration-1000 delay-100"></div>

              <div className="relative z-10">
                <div className="text-center">
                  <div className="text-white inline-block mb-6 bg-white/10 rounded-full px-6 py-2 text-sm font-semibold text-yellow-400">
                    🛡️ VERTROUWD & TRANSPARANT
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bold mb-6 bg-gradient-to-r from-white via-slate-200 to-slate-300 bg-clip-text text-transparent">
                    Wat onze reizigers zeggen
                  </h3>

                  {/* Placeholder Reviews */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md shadow-lg mb-6">
                    <div className="flex items-center justify-center mb-4">
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-yellow-400 text-2xl">★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-white/90 text-lg leading-relaxed mb-6 italic">
                      &ldquo;Binnenkort beschikbaar: reviews van onze eerste reizigers.&rdquo;
                    </p>
                    <p className="text-white/70 text-sm">
                      We lanceren binnenkort en zullen hier echte ervaringen van onze gebruikers delen.
                      Transparantie en eerlijke feedback staan bij ons voorop.
                    </p>

                    {/* Trust Indicators */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                      <div className="text-center p-4 bg-white/5 rounded-xl">
                        <div className="text-2xl mb-2">🔒</div>
                        <p className="text-white font-medium">GDPR Compliant</p>
                        <p className="text-white/70 text-sm">Nederlandse servers</p>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-xl">
                        <div className="text-2xl mb-2">💎</div>
                        <p className="text-white font-medium">Beste Prijs Garantie</p>
                        <p className="text-white/70 text-sm">Altijd scherpe tarieven</p>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-xl">
                        <div className="text-2xl mb-2">⚡</div>
                        <p className="text-white font-medium">24/7 Support</p>
                        <p className="text-white/70 text-sm">Nederlands team</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="mt-16 animate-fade-in-card">
            <div className="relative bg-gradient-to-br from-white/10 to-white/5 border border-white/20 hover:border-cta/30 rounded-3xl p-8 sm:p-10 backdrop-blur-sm overflow-hidden group transition-all duration-700 shadow-xl hover:shadow-cta/10">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-cta/10 via-blue-500/5 to-purple-500/10 opacity-60 group-hover:opacity-80 transition-opacity duration-700"></div>

              {/* Floating Elements */}
              <div className="absolute top-10 left-[10%] w-20 h-20 bg-gradient-to-br from-cta/20 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-80 transition-all duration-1000 transform translate-y-10 group-hover:translate-y-0"></div>
              <div className="absolute bottom-10 right-[15%] w-32 h-32 bg-gradient-to-bl from-blue-400/20 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-70 transition-all duration-1000 delay-100"></div>

              {/* Shine Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 overflow-hidden">
                <div className="absolute top-0 left-[-100%] w-[200%] h-[200%] bg-gradient-to-r from-transparent via-white/5 to-transparent transform -rotate-45 group-hover:translate-x-[60%] transition-transform duration-1500"></div>
              </div>

              <div className="relative z-10">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="text-center md:text-left md:flex-1">
                    <div className="text-white inline-block mb-3 bg-white/10 rounded-full px-4 py-1 text-xs font-semibold text-cta">
                      BLIJF OP DE HOOGTE
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-white via-slate-200 to-slate-300 bg-clip-text text-transparent">
                      Mis geen enkele reisdeal
                    </h3>
                    <p className="text-slate-300 leading-relaxed max-w-md mx-auto md:mx-0">
                      Ontvang exclusieve aanbiedingen, vroege toegang tot nieuwe
                      functies en reistips direct in je inbox.
                    </p>

                    {/* Benefits list */}
                    <div className="mt-6 space-y-3 text-left hidden md:block">
                      {[
                        "Exclusieve kortingen en aanbiedingen",
                        "Toegang tot bèta-functies",
                        "Wekelijkse reistips en inspiratie",
                      ].map((benefit, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-slate-300"
                        >
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-cta to-cta-hover flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3 text-black"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <span className="text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="w-full md:w-auto md:flex-1">
                    <form
                      onSubmit={handleSubmit}
                      className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-lg transform transition-all duration-500 hover:scale-[1.02]"
                    >
                      <div className="space-y-4">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-slate-400"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                          </div>
                          <input
                            className="w-full pl-10 pr-5 py-4 rounded-xl border-2 border-white/20 bg-white/5 text-white placeholder:text-white transition-all duration-300 focus:outline-none focus:border-cta focus:ring-2 focus:ring-cta/20 backdrop-blur-sm"
                            type="email"
                            name="email"
                            placeholder="Jouw e-mail voor updates"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                        <button
                          className="group relative w-full px-6 py-4 rounded-xl bg-gradient-to-r from-cta to-cta-hover hover:from-cta-hover hover:to-cta-active text-black font-bold transition-all duration-300 hover:-translate-y-1 hover:shadow-cta-heavy active:scale-95 overflow-hidden border-2 border-white"
                          type="submit"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                          <div className="relative z-10 flex items-center justify-center gap-2">
                            <span className="text-white">Direct aanmelden</span>
                            <FaPaperPlane className="text-white text-sm group-hover:translate-x-1 transition-transform duration-300" />
                          </div>
                        </button>
                      </div>
                      <p className="text-white text-xs mt-4 text-center">
                        We sturen alleen relevante updates. Uitschrijven kan
                        altijd.
                      </p>
                    </form>
                  </div>
                </div>

                {/* Honeypot */}
                <div
                  className="absolute -left-[9999px] w-px h-px overflow-hidden"
                  aria-hidden="true"
                >
                  <label>
                    Laat dit veld leeg:
                    <input
                      type="text"
                      name="company"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </label>
                </div>
                <input type="hidden" name="ts" value={timestamp} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 bg-gradient-to-b from-slate-900/90 via-slate-900/95 to-slate-950">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-5 space-y-8">
              <div className="flex items-center space-x-4">
                <div className="relative p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-2xl">
                  <FaGlobeAmericas className="h-10 w-10 text-white" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-300 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white tracking-tight">
                    Tr<span className="text-yellow-400">AI</span>veller
                  </h3>
                  <p className="text-yellow-400/80 text-sm font-medium uppercase tracking-wider">
                    AI-Powered Adventures
                  </p>
                </div>
              </div>

              <p className="text-slate-300 text-lg leading-relaxed">
                Ontdek de wereld zoals nooit tevoren. Onze geavanceerde AI
                creëert
                <span className="text-yellow-400 font-semibold">
                  {" "}
                  gepersonaliseerde reiservaringen
                </span>{" "}
                die perfect aansluiten bij jouw dromen en voorkeuren.
              </p>

              <div className="flex items-center space-x-6">
                <span className="text-slate-400 text-sm font-medium">
                  Volg ons:
                </span>
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="group relative p-3 bg-slate-800/50 hover:bg-gradient-to-br hover:from-yellow-500/20 hover:to-orange-500/20 rounded-xl transition-all duration-300"
                  >
                    <FaFacebook className="h-5 w-5 text-slate-400 group-hover:text-yellow-400 transition-colors" />
                  </a>
                  <a
                    href="#"
                    className="group relative p-3 bg-slate-800/50 hover:bg-gradient-to-br hover:from-yellow-500/20 hover:to-orange-500/20 rounded-xl transition-all duration-300"
                  >
                    <FaInstagram className="h-5 w-5 text-slate-400 group-hover:text-yellow-400 transition-colors" />
                  </a>
                  <a
                    href="#"
                    className="group relative p-3 bg-slate-800/50 hover:bg-gradient-to-br hover:from-yellow-500/20 hover:to-orange-500/20 rounded-xl transition-all duration-300"
                  >
                    <FaTwitter className="h-5 w-5 text-slate-400 group-hover:text-yellow-400 transition-colors" />
                  </a>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-8">
              <div className="space-y-6">
                <h4 className="text-white font-bold text-lg uppercase tracking-wider">
                  Ontdek
                </h4>
                <ul className="space-y-4">
                  <li>
                    <Link
                      href="/palm-intake"
                      className="group flex items-center text-slate-400 hover:text-yellow-400 transition-all duration-300"
                    >
                      <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      AI Reisplanner
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/about"
                      className="group flex items-center text-slate-400 hover:text-yellow-400 transition-all duration-300"
                    >
                      <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      Over ons
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="group flex items-center text-slate-400 hover:text-yellow-400 transition-all duration-300"
                    >
                      <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-6">
                <h4 className="text-white font-bold text-lg uppercase tracking-wider">
                  Support
                </h4>
                <ul className="space-y-4">
                  <li>
                    <Link
                      href="/privacy"
                      className="group flex items-center text-slate-400 hover:text-yellow-400 transition-all duration-300"
                    >
                      <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="group flex items-center text-slate-400 hover:text-yellow-400 transition-all duration-300"
                    >
                      <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      Voorwaarden
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="group flex items-center text-slate-400 hover:text-yellow-400 transition-all duration-300"
                    >
                      <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      Help Center
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact Section */}
            <div className="lg:col-span-3 space-y-6">
              <h4 className="text-white font-bold text-lg uppercase tracking-wider">
                Contact
              </h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg mt-0.5">
                    <FaEnvelope className="h-4 w-4 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Email</p>
                    <a
                      href="mailto:info@traiveller.ai"
                      className="text-slate-400 hover:text-yellow-400 transition-colors"
                    >
                      info@traiveller.ai
                    </a>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg mt-0.5">
                    <FaMapMarkerAlt className="h-4 w-4 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Locatie</p>
                    <p className="text-slate-400">Amsterdam, Nederland</p>
                  </div>
                </div>
              </div>

              {/* CTA in Footer */}
              <div className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-2xl border border-yellow-500/20">
                <p className="text-white font-medium mb-3">
                  Klaar voor je volgende avontuur?
                </p>
                <Link
                  href="/palm-intake"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:from-yellow-400 hover:to-orange-400 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Start Nu
                  <FaArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-6">
                <p className="text-slate-500 text-sm">
                  © {new Date().getFullYear()} TrAIveller.ai — Alle rechten
                  voorbehouden.
                </p>
              </div>

              <div className="flex items-center space-x-2 text-slate-500 text-sm">
                <span>Gebouwd met</span>
                <span className="text-yellow-400">⚡</span>
                <span>in Nederland</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
