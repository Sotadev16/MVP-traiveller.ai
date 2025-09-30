"use client";

import Head from "next/head";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function PrivacyPage() {
  return (
    <>
      <Head>
        <title>Privacybeleid - TrAIveller.ai</title>
        <meta
          name="description"
          content="Ons privacybeleid en hoe we met jouw gegevens omgaan"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/images/traiveller-logo.png" />
      </Head>

      <Navbar />

      {/* Parallax Background */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/beach-hero.jpg')",
          }}
        />
        <div className="absolute" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 lg:px-6 pt-32">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-black leading-none tracking-tight mb-4">
            <div className="text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] [text-shadow:_2px_2px_4px_rgba(0,0,0,0.9)]">
              <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter">
                PRIVACY
              </span>
              <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter mt-1 text-yellow-400">
                BELEID
              </span>
            </div>
          </h1>
          <p className="text-white text-lg drop-shadow-lg max-w-2xl mx-auto font-medium">
            Transparant over hoe we jouw gegevens beschermen en gebruiken
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <p className="text-yellow-400 font-medium mb-2">
              <strong>Laatst bijgewerkt:</strong>{" "}
              {new Date().toLocaleDateString("nl-NL")}
            </p>
          </div>

          <h2 className="text-2xl font-bold mt-8 mb-4 text-white drop-shadow-lg">
            1. Wie zijn wij
          </h2>
          <p className="mb-6 leading-relaxed text-white drop-shadow-sm">
            TrAIveller.ai is een AI-gedreven reisplanningsplatform dat
            gepersonaliseerde reisadviezen biedt. Wij zijn gevestigd in
            Nederland en houden ons aan de Europese privacywetgeving (GDPR/AVG).
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4 text-white drop-shadow-lg">
            2. Welke gegevens verzamelen wij
          </h2>
          <p className="mb-4 leading-relaxed text-white drop-shadow-sm">
            Wij verzamelen alleen de gegevens die noodzakelijk zijn voor onze
            dienstverlening:
          </p>
          <ul className="pl-6 mb-6 space-y-2 text-white">
            <li>
              <strong className="text-yellow-400">Contactgegevens:</strong>{" "}
              E-mailadres voor communicatie
            </li>
            <li>
              <strong className="text-yellow-400">Reisvoorkeuren:</strong>{" "}
              Bestemmingen, datums, budget, reizigers
            </li>
            <li>
              <strong className="text-yellow-400">Technische gegevens:</strong>{" "}
              IP-adres, browser type (anoniem)
            </li>
            <li>
              <strong className="text-yellow-400">Communicatie:</strong>{" "}
              Berichten die je ons stuurt
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4 text-white drop-shadow-lg">
            3. Waarom verzamelen wij deze gegevens
          </h2>
          <p className="mb-4 leading-relaxed text-white drop-shadow-sm">
            Wij gebruiken jouw gegevens uitsluitend voor:
          </p>
          <ul className="pl-6 mb-6 space-y-2 text-white">
            <li>Het bieden van gepersonaliseerde reisadviezen</li>
            <li>Communicatie over jouw reisopties</li>
            <li>Verbetering van onze diensten</li>
            <li>Wettelijke verplichtingen nakomen</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4 text-white drop-shadow-lg">
            4. Beveiliging van jouw gegevens
          </h2>
          <p className="mb-6 leading-relaxed text-white drop-shadow-sm">
            Wij nemen de beveiliging van jouw gegevens zeer serieus. Alle
            gegevens worden beveiligd met moderne encryptie en worden opgeslagen
            op servers in de Europese Unie.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4 text-white drop-shadow-lg">
            5. Delen van gegevens
          </h2>
          <p className="mb-6 leading-relaxed text-white drop-shadow-sm">
            Wij delen jouw persoonlijke gegevens nooit met derden voor
            commerciële doeleinden. Uitsluitend met jouw expliciete toestemming
            delen wij minimale gegevens met reispartners voor het uitvoeren van
            boekingen.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4 text-white drop-shadow-lg">
            6. Jouw rechten
          </h2>
          <p className="mb-4 leading-relaxed text-white drop-shadow-sm">
            Je hebt altijd het recht om:
          </p>
          <ul className="pl-6 mb-6 space-y-2 text-white">
            <li>Inzage te krijgen in jouw gegevens</li>
            <li>Correctie van onjuiste gegevens</li>
            <li>Verwijdering van jouw gegevens</li>
            <li>Beperking van de verwerking</li>
            <li>Gegevensoverdracht</li>
            <li>Bezwaar tegen verwerking</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4 text-white drop-shadow-lg">
            7. Cookies
          </h2>
          <p className="mb-6 leading-relaxed text-white drop-shadow-sm">
            Wij gebruiken alleen functionele cookies die noodzakelijk zijn voor
            de werking van de website. Geen tracking cookies zonder jouw
            toestemming.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4 text-white drop-shadow-lg">
            8. Bewaartermijn
          </h2>
          <p className="mb-6 leading-relaxed text-white drop-shadow-sm">
            Wij bewaren jouw gegevens niet langer dan noodzakelijk voor de
            doeleinden waarvoor ze zijn verzameld, met een maximum van 2 jaar na
            laatste contact.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4 text-white drop-shadow-lg">
            9. Contact
          </h2>
          <p className="mb-4 leading-relaxed text-white drop-shadow-sm">
            Heb je vragen over dit privacybeleid of wil je gebruik maken van
            jouw rechten? Neem contact met ons op:
          </p>
          <div className="mb-6 p-6 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
            <p className="text-white/90 mb-2">
              <strong className="text-yellow-400">E-mail:</strong>{" "}
              privacy@traiveller.ai
            </p>
            <p className="text-white">
              <strong className="text-yellow-400">Website:</strong>{" "}
              <Link
                href="/contact"
                className="text-yellow-400 hover:underline font-medium"
              >
                Contactformulier
              </Link>
            </p>
          </div>

          <h2 className="text-2xl font-bold mt-8 mb-4 text-white drop-shadow-lg">
            10. Wijzigingen
          </h2>
          <p className="mb-6 leading-relaxed text-white/80 drop-shadow-sm">
            Wij kunnen dit privacybeleid van tijd tot tijd aanpassen.
            Belangrijke wijzigingen communiceren wij altijd vooraf per e-mail.
          </p>
        </div>
      </div>
    </>
  );
}
