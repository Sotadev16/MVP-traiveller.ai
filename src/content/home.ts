// Homepage content for TrAIveller.ai
// Supports both Dutch (nl) and English (en)

export const content = {
  nl: {
    hero: {
      title: "Slimme AI Reisplanner",
      subtitle: "Plan of Zoek Je Volgende Reis in Seconden",
      description: "Laat AI je droomreis ontwerpen, of zoek direct naar de beste vlucht- en hotelaanbiedingen - volledig gratis en zonder gedoe.",
      ctaPrimary: "Plan met AI",
      ctaSecondary: "Zoek Vluchten & Hotels",
    },
    quickSearch: {
      from: "Van",
      to: "Naar",
      departure: "Vertrek",
      return: "Terug",
      searchButton: "Zoeken",
      popularFrom: ["AMS", "RTM", "BRU", "DUS"],
    },
    choiceBlock: {
      headline: "Kies Je Manier van Reizen",
      subtext: "Twee manieren om je reis te boeken - laat AI je helpen, of zoek zelf via onze krachtige filters. Jij bepaalt.",
      aiPlanner: {
        title: "AI Planner",
        text: "Laat AI je helpen bij het samenstellen van een gepersonaliseerde reis. Perfect als je inspiratie nodig hebt of geen tijd hebt om opties te vergelijken.",
        button: "Start met AI",
      },
      selfSearch: {
        title: "Zelf Zoeken",
        text: "Liever volledige controle? Gebruik onze zoektool om direct vluchten en hotels te bekijken met echte prijzen van onze vertrouwde partners.",
        button: "Bekijk Resultaten",
      },
    },
    whyUs: {
      headline: "Waarom TrAIveller",
      subtext: "Slim, veilig, en gebouwd voor reizigers die waarde hechten aan snelheid, privacy en transparantie.",
      features: [
        {
          icon: "lock",
          title: "Privacy First",
          description: "Je gegevens blijven veilig op Nederlandse servers.",
        },
        {
          icon: "money",
          title: "Beste Prijs Garantie",
          description: "Altijd de laagste tarieven via onze partners.",
        },
        {
          icon: "brain",
          title: "AI-Ondersteund",
          description: "Intelligente algoritmes vinden jouw perfecte reis.",
        },
        {
          icon: "bolt",
          title: "Supersnel Zoeken",
          description: "Resultaten in seconden, zonder gedoe.",
        },
      ],
    },
    affiliateTransparency: {
      headline: "Affiliate Transparantie",
      text: "TrAIveller werkt samen met vertrouwde reisplatforms zoals Aviasales en Hotellook via Travelpayouts. Wanneer je boekt via onze links, ontvangen wij een kleine commissie - zonder extra kosten voor jou. Dit helpt TrAIveller gratis, snel en continu te verbeteren.",
      poweredBy: "Mogelijk gemaakt door Travelpayouts",
    },
    footer: {
      gdpr: "Je privacy is belangrijk - TrAIveller draait veilig op Nederlandse servers.",
      privacyLink: "Privacy Policy",
      termsLink: "Algemene Voorwaarden",
      tagline: "Veilig, Transparant en Betrouwbaar - TrAIveller 2025",
    },
  },
  en: {
    hero: {
      title: "Smart AI Travel Planner",
      subtitle: "Plan or Search Your Next Trip in Seconds",
      description: "Let AI design your dream trip, or search directly for the best flight and hotel deals - completely free and hassle-free.",
      ctaPrimary: "Plan with AI",
      ctaSecondary: "Search Flights & Hotels",
    },
    quickSearch: {
      from: "From",
      to: "To",
      departure: "Departure",
      return: "Return",
      searchButton: "Search",
      popularFrom: ["AMS", "RTM", "BRU", "DUS"],
    },
    choiceBlock: {
      headline: "Choose Your Way to Travel",
      subtext: "Two ways to book your trip - let AI help you, or search yourself through our powerful filters. You decide.",
      aiPlanner: {
        title: "AI Planner",
        text: "Let AI help you craft a personalized trip. Perfect if you need inspiration or don't have time to compare options.",
        button: "Start with AI",
      },
      selfSearch: {
        title: "Self Search",
        text: "Prefer full control? Use our search tool to instantly view flights and hotels with real prices from our trusted partners.",
        button: "View Results",
      },
    },
    whyUs: {
      headline: "Why TrAIveller",
      subtext: "Smart, secure, and built for travelers who value speed, privacy, and transparency.",
      features: [
        {
          icon: "lock",
          title: "Privacy First",
          description: "Your data stays safe on Dutch servers.",
        },
        {
          icon: "money",
          title: "Best Price Guarantee",
          description: "Always the lowest rates via our partners.",
        },
        {
          icon: "brain",
          title: "AI-Powered",
          description: "Intelligent algorithms find your perfect trip.",
        },
        {
          icon: "bolt",
          title: "Super-Fast Search",
          description: "Results in seconds, without hassle.",
        },
      ],
    },
    affiliateTransparency: {
      headline: "Affiliate Transparency",
      text: "TrAIveller partners with trusted travel platforms like Aviasales and Hotellook via Travelpayouts. When you book through our links, we receive a small commission - at no extra cost to you. This helps keep TrAIveller free, fast, and continuously improving.",
      poweredBy: "Powered by Travelpayouts",
    },
    footer: {
      gdpr: "Your privacy matters - TrAIveller runs securely on Dutch servers.",
      privacyLink: "Privacy Policy",
      termsLink: "Terms & Conditions",
      tagline: "Secure, Transparent, and Reliable - TrAIveller 2025",
    },
  },
};

export type Language = keyof typeof content;
export type ContentType = typeof content.nl;
