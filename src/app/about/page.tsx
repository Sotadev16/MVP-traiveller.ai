"use client";

import Head from "next/head";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { FaGlobe } from "react-icons/fa";

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>Over ons - TrAIveller.ai</title>
        <meta
          name="description"
          content="Meer over TrAIveller.ai en ons team"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/images/traiveller-logo.png" />
      </Head>

      <Navbar />

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
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        </div>

        <div
          className="relative z-10 max-w-4xl mx-auto px-4 py-8 lg:px-6"
          style={{ paddingTop: "120px" }}
        >
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
            <h1 className="font-black leading-none tracking-tight mb-6">
              <div className="text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] [text-shadow:_2px_2px_4px_rgba(0,0,0,0.9)]">
                <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter">
                  OVER
                </span>
                <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter mt-1 text-yellow-400">
                  TrAIveller.ai
                </span>
              </div>
            </h1>

            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-2xl p-6 my-8 border border-yellow-500/20">
              <p className="text-white/90 text-lg leading-relaxed drop-shadow-sm">
                <strong className="text-yellow-400">Onze missie:</strong>{" "}
                Reisplanning zo simpel en persoonlijk maken dat iedereen de
                perfecte reis kan vinden.
              </p>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-6 text-white drop-shadow-lg flex items-center gap-3">
              <FaGlobe className="text-yellow-400" />
              Wie zijn wij?
            </h2>
            <p className="mb-6 leading-relaxed text-white/90 text-lg drop-shadow-sm">
              TrAIveller.ai is een innovatief Nederlands reistech startup dat
              gebruik maakt van kunstmatige intelligentie om gepersonaliseerde
              reisadviezen te bieden. Wij geloven dat de perfecte reis voor
              iedereen anders is, en daarom bieden wij maatwerk in plaats van
              standaard pakketten.
            </p>

            <h2
              className="text-xl font-semibold mt-8 mb-4"
              style={{ color: "#e9eef7" }}
            >
              Hoe werkt het?
            </h2>
            <p className="mb-4 leading-relaxed" style={{ color: "#ffffff" }}>
              Ons platform werkt in drie eenvoudige stappen:
            </p>
            <ol className="pl-6 mb-4" style={{ color: "#ffffff" }}>
              <li className="mb-2">
                <strong>Intake:</strong> Je vult een uitgebreid formulier in met
                jouw voorkeuren
              </li>
              <li className="mb-2">
                <strong>AI Analyse:</strong> Onze AI analyseert jouw wensen en
                vergelijkt duizenden opties
              </li>
              <li className="mb-2">
                <strong>Gepersonaliseerde Keuze:</strong> Je krijgt 3 opties:
                beste prijs, beste kwaliteit, handigst
              </li>
            </ol>

            <h2
              className="text-xl font-semibold mt-8 mb-4"
              style={{ color: "#e9eef7" }}
            >
              Onze voordelen
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
              <div
                className="rounded-lg p-4"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid #1e293b",
                }}
              >
                <h3
                  className="text-base font-semibold mb-2 m-0"
                  style={{ color: "#facc15" }}
                >
                  🤖 AI-gedreven
                </h3>
                <p className="m-0 text-sm" style={{ color: "#ffffff" }}>
                  Geavanceerde algoritmes analyseren jouw voorkeuren en zoeken
                  de beste matches
                </p>
              </div>
              <div
                className="rounded-lg p-4"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid #1e293b",
                }}
              >
                <h3
                  className="text-base font-semibold mb-2 m-0"
                  style={{ color: "#facc15" }}
                >
                  ⚡ Supersnel
                </h3>
                <p className="m-0 text-sm" style={{ color: "#ffffff" }}>
                  Binnen seconden krijg je resultaten die normaal uren zoekwerk
                  kosten
                </p>
              </div>
              <div
                className="rounded-lg p-4"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid #1e293b",
                }}
              >
                <h3
                  className="text-base font-semibold mb-2 m-0"
                  style={{ color: "#facc15" }}
                >
                  🎯 Gepersonaliseerd
                </h3>
                <p className="m-0 text-sm" style={{ color: "#ffffff" }}>
                  Geen standaard pakketten, maar volledig op jouw wensen
                  afgestemd
                </p>
              </div>
              <div
                className="rounded-lg p-4"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid #1e293b",
                }}
              >
                <h3
                  className="text-base font-semibold mb-2 m-0"
                  style={{ color: "#facc15" }}
                >
                  🔒 Privacy-first
                </h3>
                <p className="m-0 text-sm" style={{ color: "#ffffff" }}>
                  Jouw gegevens blijven privé en worden niet gedeeld met derden
                </p>
              </div>
              <div
                className="rounded-lg p-4"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid #1e293b",
                }}
              >
                <h3
                  className="text-base font-semibold mb-2 m-0"
                  style={{ color: "#facc15" }}
                >
                  🇳🇱 Nederlands
                </h3>
                <p className="m-0 text-sm" style={{ color: "#ffffff" }}>
                  Lokaal team dat de Nederlandse reiziger begrijpt
                </p>
              </div>
              <div
                className="rounded-lg p-4"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid #1e293b",
                }}
              >
                <h3
                  className="text-base font-semibold mb-2 m-0"
                  style={{ color: "#facc15" }}
                >
                  💰 Transparant
                </h3>
                <p className="m-0 text-sm" style={{ color: "#ffffff" }}>
                  Geen verborgen kosten, duidelijke prijzen vanaf het begin
                </p>
              </div>
            </div>

            <h2
              className="text-xl font-semibold mt-8 mb-4"
              style={{ color: "#e9eef7" }}
            >
              Waarom TrAIveller.ai?
            </h2>
            <p className="mb-4 leading-relaxed" style={{ color: "#ffffff" }}>
              De reisbranche zit vol met verouderde websites waar je uren kunt
              spenderen aan zoeken zonder de perfecte match te vinden. Wij
              geloven dat technologie dit proces drastisch kan verbeteren. Door
              jouw voorkeuren te begrijpen en te combineren met real-time data,
              kunnen wij in seconden opties presenteren die echt bij je passen.
            </p>

            <h2
              className="text-xl font-semibold mt-8 mb-4"
              style={{ color: "#e9eef7" }}
            >
              De toekomst
            </h2>
            <p className="mb-4 leading-relaxed" style={{ color: "#ffffff" }}>
              Dit is pas het begin. In de komende maanden breiden wij uit met:
            </p>
            <ul className="pl-6 mb-4" style={{ color: "#ffffff" }}>
              <li className="mb-1">
                Live integraties met alle grote booking platforms
              </li>
              <li className="mb-1">Realtime prijsvergelijking en deals</li>
              <li className="mb-1">
                Gepersonaliseerde reisroutes en activiteiten
              </li>
              <li className="mb-1">Mobile app voor iOS en Android</li>
              <li className="mb-1">AI chatbot voor realtime reisadvies</li>
            </ul>

            <h2
              className="text-xl font-semibold mt-8 mb-4"
              style={{ color: "#e9eef7" }}
            >
              Contact
            </h2>
            <p className="mb-4 leading-relaxed" style={{ color: "#ffffff" }}>
              Vragen, suggesties of gewoon benieuwd naar onze technologie? We
              horen graag van je!
            </p>
            <p className="mb-4" style={{ color: "#ffffff" }}>
              <strong>E-mail:</strong> hello@traiveller.ai
              <br />
              <strong>Contact:</strong>{" "}
              <Link href="/contact" className="text-yellow-400 hover:underline">
                Contactformulier
              </Link>
            </p>

            <div
              className="rounded-lg p-4 my-6"
              style={{
                backgroundColor: "rgba(250, 204, 21, 0.1)",
                border: "1px solid rgba(250, 204, 21, 0.3)",
              }}
            >
              <p className="mb-2" style={{ color: "#ffffff" }}>
                <strong>Klaar om je volgende avontuur te vinden?</strong>
              </p>
              <Link
                href="/palm-intake"
                className="text-yellow-400 font-bold hover:underline"
              >
                Start je intake →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
