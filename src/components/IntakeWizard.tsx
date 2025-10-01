"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaPlane,
  FaShip,
  FaGift,
  FaUsers,
  FaChild,
  FaEnvelope,
  FaEuroSign,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaHeart,
  FaBaby,
  FaHome,
  FaCar,
  FaHotel,
  FaUmbrellaBeach,
  FaMountain,
  FaStar,
  FaCity,
  FaLeaf,
  FaSpa,
  FaGlobe,
  FaCog,
} from "react-icons/fa";

interface WizardData {
  // Step 1: Trip Type
  tripType: "flight" | "cruise" | "surprise" | "";

  // Step 2: Traveler Type (Flight intake)
  travelerType: "jongeren" | "couples" | "honeymoon" | "familievakantie" | "";

  // Step 3: Destination
  destination: string;
  destinationType: "popular" | "worldwide" | "";

  // Step 4: Dates & Flexibility
  departureDate: string;
  returnDate: string;
  flexibility: "exact" | "2days" | "3days" | "";

  // Step 5: Departure Airports
  departureAirport: "AMS" | "RTM" | "EIN" | "DUS" | "BRU" | "";

  // Step 6: Passengers
  adults: number;
  children: number;
  childrenAges: number[];

  // Step 7: Flight Options
  flightType: "direct" | "stopover" | "";
  flightClass: "economy" | "premium" | "business" | "first" | "";

  // Step 8: Car Rental
  carRental: boolean;
  carType: "hatchback" | "sedan" | "mpv" | "suv" | "4x4" | "";
  carGearbox: "manual" | "automatic" | "";
  driverAge: number;

  // Step 9: Accommodation
  accommodation: "hotel" | "apartment" | "house" | "hostel" | "all-inclusive" | "";

  // Step 10: Budget
  budget: string;
  customBudget: string;

  // Step 11: Trip Type
  tripStyle: "beach" | "adventure" | "luxury" | "city-trip" | "family" | "wellness" | "nature" | "surprise-me" | "";

  // Surprise Me Flow
  email: string;
  accommodationLevel: "budget" | "mid-range" | "luxury" | "";

  // Cruise specific (kept for compatibility)
  cruiseRegion: string;
  cruiseDuration: string;
  cabinType: string;
  departurePort: string;

  // Security
  timestamp: number;
}

const INITIAL_DATA: WizardData = {
  tripType: "",
  travelerType: "",
  destination: "",
  destinationType: "",
  departureDate: "",
  returnDate: "",
  flexibility: "",
  departureAirport: "",
  adults: 1,
  children: 0,
  childrenAges: [],
  flightType: "",
  flightClass: "",
  carRental: false,
  carType: "",
  carGearbox: "",
  driverAge: 25,
  accommodation: "",
  budget: "",
  customBudget: "",
  tripStyle: "",
  email: "",
  accommodationLevel: "",
  cruiseRegion: "",
  cruiseDuration: "",
  cabinType: "",
  departurePort: "",
  timestamp: Date.now(),
};

export default function IntakeWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>(INITIAL_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const getTotalSteps = () => {
    if (wizardData.tripType === "surprise") return 4;
    if (wizardData.tripType === "flight") return 11;
    if (wizardData.tripType === "cruise") return 5;
    return 11; // Default to flight steps for initial calculation
  };

  const totalSteps = getTotalSteps();

  useEffect(() => {
    setWizardData((prev) => ({ ...prev, timestamp: Date.now() }));
  }, []);

  const updateData = (updates: Partial<WizardData>) => {
    setWizardData((prev) => ({ ...prev, ...updates }));
    setErrors({});

    // Reset to step 1 if trip type changes
    if (updates.tripType && updates.tripType !== wizardData.tripType) {
      setCurrentStep(1);
    }
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 1: // Trip Type
        if (!wizardData.tripType) {
          newErrors.tripType = "Selecteer een type reis";
        }
        break;

      case 2: // Traveler Type (Flight only)
        if (wizardData.tripType === "flight" && !wizardData.travelerType) {
          newErrors.travelerType = "Selecteer reizigerstype";
        }
        break;

      case 3: // Destination (Flight only)
        if (wizardData.tripType === "flight" && !wizardData.destination) {
          newErrors.destination = "Selecteer een bestemming";
        }
        break;

      case 4: // Dates & Flexibility
        if (!wizardData.departureDate)
          newErrors.departureDate = "Vertrekdatum is verplicht";
        if (!wizardData.returnDate)
          newErrors.returnDate = "Terugkomstdatum is verplicht";
        if (!wizardData.flexibility)
          newErrors.flexibility = "Flexibiliteit is verplicht";

        // Date validation
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const depDate = new Date(wizardData.departureDate);
        const retDate = new Date(wizardData.returnDate);

        if (depDate < today)
          newErrors.departureDate =
            "Vertrekdatum kan niet in het verleden liggen";
        if (retDate < today)
          newErrors.returnDate =
            "Terugkomstdatum kan niet in het verleden liggen";
        if (retDate <= depDate)
          newErrors.returnDate = "Terugkomstdatum moet na vertrekdatum liggen";
        break;

      case 5: // Departure Airport (Flight only)
        if (wizardData.tripType === "flight" && !wizardData.departureAirport) {
          newErrors.departureAirport = "Selecteer een vertrekreiport";
        }
        break;

      case 6: // Passengers
        if (wizardData.adults < 1) newErrors.adults = "Minimaal 1 volwassene";
        break;

      case 7: // Flight Options (Flight only)
        if (wizardData.tripType === "flight") {
          if (!wizardData.flightType) newErrors.flightType = "Selecteer vluchttype";
          if (!wizardData.flightClass) newErrors.flightClass = "Selecteer vluchtklasse";
        }
        break;

      case 9: // Accommodation
        if (!wizardData.accommodation) newErrors.accommodation = "Selecteer accommodatie";
        break;

      case 10: // Budget
        if (!wizardData.budget && !wizardData.customBudget)
          newErrors.budget = "Budget is verplicht";

        // Budget validation
        if (wizardData.budget === "custom") {
          if (!wizardData.customBudget) {
            newErrors.customBudget = "Aangepast budget is verplicht";
          } else {
            const budget = parseInt(wizardData.customBudget);
            if (budget < 100)
              newErrors.customBudget = "Minimum €100 per persoon";
            if (budget > 50000)
              newErrors.customBudget = "Maximum €50.000 per persoon";
          }
        }
        break;

      case 11: // Trip Style
        if (!wizardData.tripStyle) newErrors.tripStyle = "Selecteer een reisstijl";
        break;

      // Handle Surprise Me Flow specifically
      default:
        if (wizardData.tripType === "surprise") {
          switch (currentStep) {
            case 2: // Dates
              if (!wizardData.departureDate) newErrors.departureDate = "Vertrekdatum is verplicht";
              if (!wizardData.returnDate) newErrors.returnDate = "Terugkomstdatum is verplicht";

              // Date validation for surprise me
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const depDate = new Date(wizardData.departureDate);
              const retDate = new Date(wizardData.returnDate);

              if (depDate < today) newErrors.departureDate = "Vertrekdatum kan niet in het verleden liggen";
              if (retDate < today) newErrors.returnDate = "Terugkomstdatum kan niet in het verleden liggen";
              if (retDate <= depDate) newErrors.returnDate = "Terugkomstdatum moet na vertrekdatum liggen";
              break;

            case 3: // Budget & Passengers
              if (!wizardData.email) newErrors.email = "Email is verplicht";
              if (!wizardData.budget && !wizardData.customBudget) newErrors.budget = "Budget is verplicht";
              if (wizardData.adults < 1) newErrors.adults = "Minimaal 1 volwassene";

              // Email validation
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (wizardData.email && !emailRegex.test(wizardData.email)) {
                newErrors.email = "Ongeldig email adres";
              }

              // Budget validation for surprise me
              if (wizardData.budget === "custom") {
                if (!wizardData.customBudget) {
                  newErrors.customBudget = "Aangepast budget is verplicht";
                } else {
                  const budget = parseInt(wizardData.customBudget);
                  if (budget < 100) newErrors.customBudget = "Minimum €100 per persoon";
                  if (budget > 50000) newErrors.customBudget = "Maximum €50.000 per persoon";
                }
              }
              break;

            case 4: // Accommodation Level
              if (!wizardData.accommodationLevel) {
                newErrors.accommodationLevel = "Selecteer accommodatieniveau";
              }
              break;
          }
        }
        break;

      // Additional validation for steps 4-5 based on trip type...
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    try {
      // Map tripType to travelType for API compatibility
      const submissionData = {
        ...wizardData,
        travelType: wizardData.tripType,
      };

      const response = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        const result = await response.json();
        router.push(`/results?id=${result.id || "demo"}`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error:", errorData);
        throw new Error(
          `Submission failed: ${errorData.error || response.status}`
        );
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert(
        `Er ging iets mis: ${
          error instanceof Error ? error.message : "Onbekende fout"
        }. Probeer het opnieuw.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between text-sm text-cyan-300 mb-2">
        <span>
          Stap {currentStep} van {totalSteps}
        </span>
        <span>{Math.round((currentStep / totalSteps) * 100)}% voltooid</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-3">
        <div
          className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="text-center space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
          Wat voor reis zoek je?
        </h2>
        <p className="text-white drop-shadow-sm">
          Kies het type reis dat het best bij je past
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {[
          {
            type: "flight" as const,
            icon: FaPlane,
            title: "Flight + Stay",
            subtitle: "Vluchten + accommodatie",
            description: "Perfect voor vrijheid en flexibiliteit",
          },
          {
            type: "cruise" as const,
            icon: FaShip,
            title: "Cruise",
            subtitle: "All-inclusive cruise ervaring",
            description: "Ontspannen reizen met alles inbegrepen",
            comingSoon: true,
          },
          {
            type: "surprise" as const,
            icon: FaGift,
            title: "Surprise me",
            subtitle: "Laat ons kiezen",
            description: "Avontuurlijke reis op basis van je budget",
          },
        ].map((option) => (
          <button
            key={option.type}
            onClick={() => !option.comingSoon && updateData({ tripType: option.type })}
            disabled={option.comingSoon}
            className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 text-left backdrop-blur-sm ${
              option.comingSoon
                ? "border-red-300/50 bg-red-500/10 opacity-75 cursor-not-allowed"
                : wizardData.tripType === option.type
                ? "border-yellow-400 bg-yellow-400/20 transform scale-105 shadow-2xl"
                : "border-white/30 bg-white/10 hover:border-yellow-400/50 hover:bg-white/20 hover:scale-102"
            }`}
          >
            {option.comingSoon && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-lg transform rotate-12">
                Coming Soon
              </div>
            )}
            <div className="flex justify-center mb-6">
              <div
                className={`p-4 rounded-2xl ${
                  option.comingSoon
                    ? "bg-red-400/20"
                    : wizardData.tripType === option.type
                    ? "bg-yellow-400/30"
                    : "bg-white"
                } ${!option.comingSoon ? "group-hover:scale-110" : ""} transition-all duration-300`}
              >
                <option.icon className={`text-3xl ${option.comingSoon ? "text-red-400" : "text-yellow-400"}`} />
              </div>
            </div>
            <h3 className={`text-xl font-bold mb-2 ${option.comingSoon ? "text-white/70" : "text-white"}`}>
              {option.title}
            </h3>
            <p className={`text-sm mb-3 font-medium ${option.comingSoon ? "text-red-400/70" : "text-yellow-400/90"}`}>
              {option.subtitle}
            </p>
            <p className={`text-sm leading-relaxed ${option.comingSoon ? "text-white/50" : "text-white"}`}>
              {option.description}
            </p>
          </button>
        ))}
      </div>

      {errors.tripType && (
        <p className="text-red-400 text-sm flex items-center justify-center gap-2">
          <FaCheckCircle />
          {errors.tripType}
        </p>
      )}
    </div>
  );

  const renderTravelerTypeStep = () => (
    <div className="text-center space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
          Wat voor reiziger ben je?
        </h2>
        <p className="text-white drop-shadow-sm">
          Kies het type dat het best bij je past
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {[
          {
            type: "jongeren" as const,
            icon: FaUsers,
            title: "Jongeren",
            description: "Avontuurlijke groepsreizen",
          },
          {
            type: "couples" as const,
            icon: FaHeart,
            title: "Koppels",
            description: "Romantische reizen voor twee",
          },
          {
            type: "honeymoon" as const,
            icon: FaStar,
            title: "Honeymoon",
            description: "Speciale huwelijksreis",
          },
          {
            type: "familievakantie" as const,
            icon: FaBaby,
            title: "Familievakantie",
            description: "Perfecte gezinsvakanties",
          },
        ].map((option) => (
          <button
            key={option.type}
            onClick={() => updateData({ travelerType: option.type })}
            className={`group p-8 rounded-2xl border-2 transition-all duration-300 text-left backdrop-blur-sm ${
              wizardData.travelerType === option.type
                ? "border-yellow-400 bg-yellow-400/20 transform scale-105 shadow-2xl"
                : "border-white/30 bg-white/10 hover:border-yellow-400/50 hover:bg-white/20 hover:scale-102"
            }`}
          >
            <div className="flex justify-center mb-6">
              <div
                className={`p-4 rounded-2xl ${
                  wizardData.travelerType === option.type
                    ? "bg-yellow-400/30"
                    : "bg-white"
                } group-hover:scale-110 transition-all duration-300`}
              >
                <option.icon className="text-3xl text-yellow-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">
              {option.title}
            </h3>
            <p className="text-sm leading-relaxed text-white">
              {option.description}
            </p>
          </button>
        ))}
      </div>

      {errors.travelerType && (
        <p className="text-red-400 text-sm flex items-center justify-center gap-2">
          <FaCheckCircle />
          {errors.travelerType}
        </p>
      )}
    </div>
  );

  const renderDestinationStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
          Waar wil je naartoe?
        </h2>
        <p className="text-white drop-shadow-sm">
          Kies je droombestemming
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
            <FaStar className="text-yellow-400" />
            Populaire bestemmingen
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "Aruba",
              "Griekenland",
              "Spanje",
              "Italië",
              "Gran Canaria"
            ].map((dest) => (
              <button
                key={dest}
                onClick={() => updateData({ destination: dest, destinationType: "popular" })}
                className={`p-4 rounded-xl text-left transition-all ${
                  wizardData.destination === dest
                    ? "bg-yellow-400/20 border-2 border-yellow-400 text-white"
                    : "bg-white/10 border border-white/20 text-white/80 hover:bg-white/20"
                }`}
              >
                {dest}
              </button>
            ))}
          </div>
        </div>

        <div className="text-center">
          <div className="text-white/60 text-sm mb-3">of</div>
          <button
            onClick={() => updateData({ destination: "worldwide", destinationType: "worldwide" })}
            className={`w-full p-4 rounded-xl transition-all flex items-center justify-center gap-3 ${
              wizardData.destinationType === "worldwide"
                ? "bg-yellow-400/20 border-2 border-yellow-400 text-white"
                : "bg-white/10 border border-white/20 text-white/80 hover:bg-white/20"
            }`}
          >
            <FaGlobe className="text-yellow-400" />
            Overal ter wereld - laat mij kiezen
          </button>
        </div>

        {errors.destination && (
          <p className="text-red-400 text-sm mt-1">{errors.destination}</p>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
          Vertel ons over jezelf
        </h2>
        <p className="text-white drop-shadow-sm">
          Basis informatie voor de perfecte reis
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Email */}
        <div>
          <label className="flex items-center gap-3 text-white font-medium mb-3">
            <FaEnvelope className="text-yellow-400" />
            Email adres <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            value={wizardData.email}
            onChange={(e) => updateData({ email: e.target.value })}
            className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
            placeholder="jouw@email.com"
          />
          {errors.email && (
            <p className="text-red-400 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* People */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-3 text-white font-medium mb-3">
              <FaUsers className="text-yellow-400" />
              Aantal volwassenen <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={wizardData.adults}
              onChange={(e) =>
                updateData({ adults: parseInt(e.target.value) || 1 })
              }
              className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
            />
          </div>
          <div>
            <label className="flex items-center gap-3 text-white font-medium mb-3">
              <FaChild className="text-yellow-400" />
              Aantal kinderen
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={wizardData.children}
              onChange={(e) => {
                const childCount = parseInt(e.target.value) || 0;
                updateData({
                  children: childCount,
                  childrenAges: Array(childCount).fill(0),
                });
              }}
              className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
            />
          </div>
        </div>

        {/* Children ages */}
        {wizardData.children > 0 && (
          <div>
            <label className="flex items-center gap-3 text-white font-medium mb-3">
              <FaClock className="text-yellow-400" />
              Leeftijden kinderen
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: wizardData.children }, (_, index) => (
                <input
                  key={index}
                  type="number"
                  min="0"
                  max="17"
                  placeholder={`Kind ${index + 1}`}
                  value={wizardData.childrenAges[index] || ""}
                  onChange={(e) => {
                    const newAges = [...wizardData.childrenAges];
                    newAges[index] = parseInt(e.target.value) || 0;
                    updateData({ childrenAges: newAges });
                  }}
                  className="px-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                />
              ))}
            </div>
          </div>
        )}

        {/* Budget */}
        <div>
          <label className="flex items-center gap-3 text-white font-medium mb-3">
            <FaEuroSign className="text-yellow-400" />
            Budget per persoon <span className="text-red-400">*</span>
          </label>
          <div className="space-y-3">
            {[
              { value: "250", label: "€250 - €500 (Budget)" },
              { value: "500", label: "€500 - €750 (Gemiddeld)" },
              { value: "750", label: "€750 - €1000 (Comfortabel)" },
              { value: "1000", label: "€1000+ (Premium)" },
              { value: "custom", label: "Ander bedrag..." },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateData({ budget: option.value })}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  wizardData.budget === option.value
                    ? "bg-yellow-400/20 border-2 border-yellow-400 text-white"
                    : "bg-white/5 border border-white/20 text-white/80 hover:bg-white/10"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {wizardData.budget === "custom" && (
            <div className="mt-4">
              <input
                type="number"
                min="100"
                placeholder="Minimaal €100"
                value={wizardData.customBudget}
                onChange={(e) => updateData({ customBudget: e.target.value })}
                className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
              />
            </div>
          )}

          {errors.budget && (
            <p className="text-red-400 text-sm mt-1">{errors.budget}</p>
          )}
          {errors.customBudget && (
            <p className="text-red-400 text-sm mt-1">{errors.customBudget}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
          Wanneer wil je gaan?
        </h2>
        <p className="text-white/80 drop-shadow-sm">
          Kies je datums en flexibiliteit
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-3 text-white font-medium mb-3">
              <FaCalendarAlt className="text-yellow-400" />
              Vertrekdatum <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={wizardData.departureDate}
              onChange={(e) => updateData({ departureDate: e.target.value })}
              className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
            />
            {errors.departureDate && (
              <p className="text-red-400 text-sm mt-1">
                {errors.departureDate}
              </p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-3 text-white font-medium mb-3">
              <FaCalendarAlt className="text-yellow-400" />
              Terugkomstdatum <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              min={
                wizardData.departureDate ||
                new Date().toISOString().split("T")[0]
              }
              value={wizardData.returnDate}
              onChange={(e) => updateData({ returnDate: e.target.value })}
              className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
            />
            {errors.returnDate && (
              <p className="text-red-400 text-sm mt-1">{errors.returnDate}</p>
            )}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-3 text-white font-medium mb-3">
            <FaClock className="text-yellow-400" />
            Hoe flexibel ben je? <span className="text-red-400">*</span>
          </label>
          <div className="space-y-3">
            {[
              { value: "exact", label: "Exacte datums", icon: FaMapMarkerAlt },
              {
                value: "2days",
                label: "±2 dagen flexibel",
                icon: FaCalendarAlt,
              },
              {
                value: "3days",
                label: "±3 dagen flexibel",
                icon: FaCalendarAlt,
              },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateData({ flexibility: option.value as "exact" | "2days" | "3days" })}
                className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-4 backdrop-blur-sm ${
                  wizardData.flexibility === option.value
                    ? "bg-yellow-400/20 border-2 border-yellow-400 text-white"
                    : "bg-white/10 border border-white/20 text-white/80 hover:bg-white/20"
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    wizardData.flexibility === option.value
                      ? "bg-yellow-400/30"
                      : "bg-white/20"
                  }`}
                >
                  <option.icon className="text-lg text-yellow-400" />
                </div>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
          {errors.flexibility && (
            <p className="text-red-400 text-sm mt-1">{errors.flexibility}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderDepartureAirportStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
          Vanaf welke luchthaven?
        </h2>
        <p className="text-white/80 drop-shadow-sm">
          Kies je vertrekreirport
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { code: "AMS", name: "Amsterdam (Schiphol)", city: "Amsterdam" },
            { code: "RTM", name: "Rotterdam (The Hague)", city: "Rotterdam" },
            { code: "EIN", name: "Eindhoven", city: "Eindhoven" },
            { code: "DUS", name: "Düsseldorf", city: "Düsseldorf" },
            { code: "BRU", name: "Brussel", city: "Brussel" },
          ].map((airport) => (
            <button
              key={airport.code}
              onClick={() => updateData({ departureAirport: airport.code as "AMS" | "RTM" | "EIN" | "DUS" | "BRU" })}
              className={`p-4 rounded-xl text-left transition-all flex items-center gap-4 ${
                wizardData.departureAirport === airport.code
                  ? "bg-yellow-400/20 border-2 border-yellow-400 text-white"
                  : "bg-white/10 border border-white/20 text-white/80 hover:bg-white/20"
              }`}
            >
              <div className={`p-3 rounded-lg ${
                wizardData.departureAirport === airport.code ? "bg-yellow-400/30" : "bg-white/20"
              }`}>
                <FaPlane className="text-yellow-400" />
              </div>
              <div>
                <div className="font-bold text-lg">{airport.code}</div>
                <div className="text-sm opacity-80">{airport.name}</div>
              </div>
            </button>
          ))}
        </div>

        {errors.departureAirport && (
          <p className="text-red-400 text-sm mt-4">{errors.departureAirport}</p>
        )}
      </div>
    </div>
  );

  const renderPassengersStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
          Hoeveel reizigers?
        </h2>
        <p className="text-white/80 drop-shadow-sm">
          Vertel ons over je reisgezelschap
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-3 text-white font-medium mb-3">
              <FaUsers className="text-yellow-400" />
              Aantal volwassenen <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={wizardData.adults}
              onChange={(e) =>
                updateData({ adults: parseInt(e.target.value) || 1 })
              }
              className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
            />
            {errors.adults && (
              <p className="text-red-400 text-sm mt-1">{errors.adults}</p>
            )}
          </div>
          <div>
            <label className="flex items-center gap-3 text-white font-medium mb-3">
              <FaChild className="text-yellow-400" />
              Aantal kinderen
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={wizardData.children}
              onChange={(e) => {
                const childCount = parseInt(e.target.value) || 0;
                updateData({
                  children: childCount,
                  childrenAges: Array(childCount).fill(0),
                });
              }}
              className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
            />
          </div>
        </div>

        {wizardData.children > 0 && (
          <div>
            <label className="flex items-center gap-3 text-white font-medium mb-3">
              <FaClock className="text-yellow-400" />
              Leeftijden kinderen <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: wizardData.children }, (_, index) => (
                <input
                  key={index}
                  type="number"
                  min="0"
                  max="17"
                  placeholder={`Kind ${index + 1}`}
                  value={wizardData.childrenAges[index] || ""}
                  onChange={(e) => {
                    const newAges = [...wizardData.childrenAges];
                    newAges[index] = parseInt(e.target.value) || 0;
                    updateData({ childrenAges: newAges });
                  }}
                  className="px-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderFlightOptionsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
          Vliegvoorkeuren
        </h2>
        <p className="text-white/80 drop-shadow-sm">
          Kies je vliegopties
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <label className="flex items-center gap-3 text-white font-medium mb-3">
            <FaPlane className="text-yellow-400" />
            Vluchttype <span className="text-red-400">*</span>
          </label>
          <div className="space-y-3">
            {[
              { value: "direct", label: "Direct vlucht", description: "Geen tussenstops" },
              { value: "stopover", label: "Met tussenstop", description: "Goedkoper, langere reistijd" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => updateData({ flightType: option.value as "direct" | "stopover" })}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  wizardData.flightType === option.value
                    ? "bg-yellow-400/20 border-2 border-yellow-400 text-white"
                    : "bg-white/10 border border-white/20 text-white/80 hover:bg-white/20"
                }`}
              >
                <div className="font-medium">{option.label}</div>
                <div className="text-sm opacity-70">{option.description}</div>
              </button>
            ))}
          </div>
          {errors.flightType && (
            <p className="text-red-400 text-sm mt-1">{errors.flightType}</p>
          )}
        </div>

        <div>
          <label className="flex items-center gap-3 text-white font-medium mb-3">
            <FaStar className="text-yellow-400" />
            Klasse <span className="text-red-400">*</span>
          </label>
          <div className="space-y-3">
            {[
              { value: "economy", label: "Economy", description: "Standaard comfort" },
              { value: "premium", label: "Premium Economy", description: "Extra beenruimte" },
              { value: "business", label: "Business", description: "Luxe ervaring" },
              { value: "first", label: "First Class", description: "Ultieme luxe" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => updateData({ flightClass: option.value as "economy" | "premium" | "business" | "first" })}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  wizardData.flightClass === option.value
                    ? "bg-yellow-400/20 border-2 border-yellow-400 text-white"
                    : "bg-white/10 border border-white/20 text-white/80 hover:bg-white/20"
                }`}
              >
                <div className="font-medium">{option.label}</div>
                <div className="text-sm opacity-70">{option.description}</div>
              </button>
            ))}
          </div>
          {errors.flightClass && (
            <p className="text-red-400 text-sm mt-1">{errors.flightClass}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderCarRentalStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
          Huurauto nodig?
        </h2>
        <p className="text-white/80 drop-shadow-sm">
          Configureer je huurauto voorkeuren
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <label className="flex items-center gap-3 text-white font-medium mb-3">
            <FaCar className="text-yellow-400" />
            Huurauto
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => updateData({ carRental: true })}
              className={`flex-1 p-4 rounded-xl transition-all ${
                wizardData.carRental
                  ? "bg-yellow-400/20 border-2 border-yellow-400 text-white"
                  : "bg-white/10 border border-white/20 text-white/80 hover:bg-white/20"
              }`}
            >
              Ja
            </button>
            <button
              onClick={() => updateData({ carRental: false, carType: "", carGearbox: "" })}
              className={`flex-1 p-4 rounded-xl transition-all ${
                !wizardData.carRental
                  ? "bg-yellow-400/20 border-2 border-yellow-400 text-white"
                  : "bg-white/10 border border-white/20 text-white/80 hover:bg-white/20"
              }`}
            >
              Nee
            </button>
          </div>
        </div>

        {wizardData.carRental && (
          <>
            <div>
              <label className="flex items-center gap-3 text-white font-medium mb-3">
                <FaCog className="text-yellow-400" />
                Type auto
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  "hatchback",
                  "sedan",
                  "mpv",
                  "suv",
                  "4x4"
                ].map((type) => (
                  <button
                    key={type}
                    onClick={() => updateData({ carType: type as "hatchback" | "sedan" | "mpv" | "suv" | "4x4" })}
                    className={`p-3 rounded-xl text-center transition-all capitalize ${
                      wizardData.carType === type
                        ? "bg-yellow-400/20 border-2 border-yellow-400 text-white"
                        : "bg-white/10 border border-white/20 text-white/80 hover:bg-white/20"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3 text-white font-medium mb-3">
                <FaCog className="text-yellow-400" />
                Versnelling
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => updateData({ carGearbox: "manual" })}
                  className={`flex-1 p-4 rounded-xl transition-all ${
                    wizardData.carGearbox === "manual"
                      ? "bg-yellow-400/20 border-2 border-yellow-400 text-white"
                      : "bg-white/10 border border-white/20 text-white/80 hover:bg-white/20"
                  }`}
                >
                  Handgeschakeld
                </button>
                <button
                  onClick={() => updateData({ carGearbox: "automatic" })}
                  className={`flex-1 p-4 rounded-xl transition-all ${
                    wizardData.carGearbox === "automatic"
                      ? "bg-yellow-400/20 border-2 border-yellow-400 text-white"
                      : "bg-white/10 border border-white/20 text-white/80 hover:bg-white/20"
                  }`}
                >
                  Automaat
                </button>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3 text-white font-medium mb-3">
                <FaClock className="text-yellow-400" />
                Leeftijd hoofdbestuurder
              </label>
              <input
                type="number"
                min="18"
                max="99"
                value={wizardData.driverAge}
                onChange={(e) => updateData({ driverAge: parseInt(e.target.value) || 25 })}
                className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderAccommodationStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
          Waar wil je verblijven?
        </h2>
        <p className="text-white/80 drop-shadow-sm">
          Kies je accommodatietype
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="space-y-3">
          {[
            { value: "hotel", label: "Hotel", icon: FaHotel, description: "Service en comfort" },
            { value: "apartment", label: "Appartement", icon: FaHome, description: "Zelfstandig verblijf" },
            { value: "house", label: "Vakantiehuis", icon: FaHome, description: "Veel ruimte en privacy" },
            { value: "hostel", label: "Hostel", icon: FaUsers, description: "Budget-vriendelijk" },
            { value: "all-inclusive", label: "All-Inclusive Resort", icon: FaStar, description: "Alles inbegrepen" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => updateData({ accommodation: option.value as "hotel" | "apartment" | "house" | "hostel" | "all-inclusive" })}
              className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-4 ${
                wizardData.accommodation === option.value
                  ? "bg-yellow-400/20 border-2 border-yellow-400 text-white"
                  : "bg-white/10 border border-white/20 text-white/80 hover:bg-white/20"
              }`}
            >
              <div className={`p-3 rounded-lg ${
                wizardData.accommodation === option.value ? "bg-yellow-400/30" : "bg-white/20"
              }`}>
                <option.icon className="text-yellow-400" />
              </div>
              <div>
                <div className="font-medium">{option.label}</div>
                <div className="text-sm opacity-70">{option.description}</div>
              </div>
            </button>
          ))}
        </div>

        {errors.accommodation && (
          <p className="text-red-400 text-sm mt-4">{errors.accommodation}</p>
        )}
      </div>
    </div>
  );

  const renderBudgetStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
          Wat is je budget?
        </h2>
        <p className="text-white/80 drop-shadow-sm">
          Budget per persoon voor de hele reis
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <label className="flex items-center gap-3 text-white font-medium mb-3">
            <FaEuroSign className="text-yellow-400" />
            Budget per persoon <span className="text-red-400">*</span>
          </label>
          <div className="space-y-3">
            {[
              { value: "250", label: "€250", description: "Budget reis" },
              { value: "500", label: "€500", description: "Comfortabele reis" },
              { value: "750", label: "€750", description: "Luxere ervaring" },
              { value: "1000", label: "€1000", description: "Premium reis" },
              { value: "custom", label: "Ander bedrag...", description: "Aangepast budget" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateData({ budget: option.value })}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  wizardData.budget === option.value
                    ? "bg-yellow-400/20 border-2 border-yellow-400 text-white"
                    : "bg-white/5 border border-white/20 text-white/80 hover:bg-white/10"
                }`}
              >
                <div className="font-medium">{option.label}</div>
                <div className="text-sm opacity-70">{option.description}</div>
              </button>
            ))}
          </div>

          {wizardData.budget === "custom" && (
            <div className="mt-4">
              <input
                type="number"
                min="100"
                placeholder="Minimaal €100"
                value={wizardData.customBudget}
                onChange={(e) => updateData({ customBudget: e.target.value })}
                className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
              />
            </div>
          )}

          {errors.budget && (
            <p className="text-red-400 text-sm mt-1">{errors.budget}</p>
          )}
          {errors.customBudget && (
            <p className="text-red-400 text-sm mt-1">{errors.customBudget}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderTripStyleStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
          Wat voor type reis?
        </h2>
        <p className="text-white/80 drop-shadow-sm">
          Kies de stijl van je droomreis
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: "beach", label: "Beach", icon: FaUmbrellaBeach, description: "Zon, zee en strand" },
            { value: "adventure", label: "Adventure", icon: FaMountain, description: "Actie en avontuur" },
            { value: "luxury", label: "Luxury", icon: FaStar, description: "Ultieme luxe ervaring" },
            { value: "city-trip", label: "City Trip", icon: FaCity, description: "Stedelijke verkenning" },
            { value: "family", label: "Family", icon: FaBaby, description: "Gezinsvriendelijk" },
            { value: "wellness", label: "Wellness", icon: FaSpa, description: "Ontspanning en wellness" },
            { value: "nature", label: "Nature", icon: FaLeaf, description: "Natuur en wildlife" },
            { value: "surprise-me", label: "Surprise Me", icon: FaGift, description: "Laat ons kiezen" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => updateData({ tripStyle: option.value as "beach" | "adventure" | "luxury" | "city-trip" | "family" | "wellness" | "nature" | "surprise-me" })}
              className={`p-6 rounded-2xl text-center transition-all ${
                wizardData.tripStyle === option.value
                  ? "bg-yellow-400/20 border-2 border-yellow-400 text-white transform scale-105"
                  : "bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 hover:scale-102"
              }`}
            >
              <div className="flex justify-center mb-3">
                <div className={`p-3 rounded-xl ${
                  wizardData.tripStyle === option.value ? "bg-yellow-400/30" : "bg-white/20"
                }`}>
                  <option.icon className="text-2xl text-yellow-400" />
                </div>
              </div>
              <div className="font-medium text-sm">{option.label}</div>
              <div className="text-xs opacity-70 mt-1">{option.description}</div>
            </button>
          ))}
        </div>

        {errors.tripStyle && (
          <p className="text-red-400 text-sm mt-4 text-center">{errors.tripStyle}</p>
        )}
      </div>
    </div>
  );

  // Surprise Me Flow Steps
  const renderSurpriseDatesStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
          Wanneer wil je gaan?
        </h2>
        <p className="text-white/80 drop-shadow-sm">
          Kies je reisperiode
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-3 text-white font-medium mb-3">
              <FaCalendarAlt className="text-yellow-400" />
              Vertrekdatum <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={wizardData.departureDate}
              onChange={(e) => updateData({ departureDate: e.target.value })}
              className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
            />
            {errors.departureDate && (
              <p className="text-red-400 text-sm mt-1">{errors.departureDate}</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-3 text-white font-medium mb-3">
              <FaCalendarAlt className="text-yellow-400" />
              Terugkomstdatum <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              min={wizardData.departureDate || new Date().toISOString().split("T")[0]}
              value={wizardData.returnDate}
              onChange={(e) => updateData({ returnDate: e.target.value })}
              className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
            />
            {errors.returnDate && (
              <p className="text-red-400 text-sm mt-1">{errors.returnDate}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSurpriseInfoStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
          Vertel ons over jezelf
        </h2>
        <p className="text-white drop-shadow-sm">
          Basis informatie voor je surprise reis
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <label className="flex items-center gap-3 text-white font-medium mb-3">
            <FaEnvelope className="text-yellow-400" />
            Email adres <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            value={wizardData.email}
            onChange={(e) => updateData({ email: e.target.value })}
            className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
            placeholder="jouw@email.com"
          />
          {errors.email && (
            <p className="text-red-400 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="flex items-center gap-3 text-white font-medium mb-3">
            <FaEuroSign className="text-yellow-400" />
            Budget per persoon <span className="text-red-400">*</span>
          </label>
          <div className="space-y-3">
            {[
              { value: "250", label: "€250", description: "Budget reis" },
              { value: "500", label: "€500", description: "Comfortabele reis" },
              { value: "750", label: "€750", description: "Luxere ervaring" },
              { value: "1000", label: "€1000", description: "Premium reis" },
              { value: "custom", label: "Ander bedrag...", description: "Aangepast budget" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateData({ budget: option.value })}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  wizardData.budget === option.value
                    ? "bg-yellow-400/20 border-2 border-yellow-400 text-white"
                    : "bg-white/5 border border-white/20 text-white/80 hover:bg-white/10"
                }`}
              >
                <div className="font-medium">{option.label}</div>
                <div className="text-sm opacity-70">{option.description}</div>
              </button>
            ))}
          </div>

          {wizardData.budget === "custom" && (
            <div className="mt-4">
              <input
                type="number"
                min="100"
                placeholder="Minimaal €100"
                value={wizardData.customBudget}
                onChange={(e) => updateData({ customBudget: e.target.value })}
                className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
              />
            </div>
          )}

          {errors.budget && (
            <p className="text-red-400 text-sm mt-1">{errors.budget}</p>
          )}
          {errors.customBudget && (
            <p className="text-red-400 text-sm mt-1">{errors.customBudget}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-3 text-white font-medium mb-3">
              <FaUsers className="text-yellow-400" />
              Aantal volwassenen <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={wizardData.adults}
              onChange={(e) => updateData({ adults: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
            />
            {errors.adults && (
              <p className="text-red-400 text-sm mt-1">{errors.adults}</p>
            )}
          </div>
          <div>
            <label className="flex items-center gap-3 text-white font-medium mb-3">
              <FaChild className="text-yellow-400" />
              Aantal kinderen
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={wizardData.children}
              onChange={(e) => {
                const childCount = parseInt(e.target.value) || 0;
                updateData({
                  children: childCount,
                  childrenAges: Array(childCount).fill(0),
                });
              }}
              className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
            />
          </div>
        </div>

        {wizardData.children > 0 && (
          <div>
            <label className="flex items-center gap-3 text-white font-medium mb-3">
              <FaClock className="text-yellow-400" />
              Leeftijden kinderen
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: wizardData.children }, (_, index) => (
                <input
                  key={index}
                  type="number"
                  min="0"
                  max="17"
                  placeholder={`Kind ${index + 1}`}
                  value={wizardData.childrenAges[index] || ""}
                  onChange={(e) => {
                    const newAges = [...wizardData.childrenAges];
                    newAges[index] = parseInt(e.target.value) || 0;
                    updateData({ childrenAges: newAges });
                  }}
                  className="px-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderSurpriseAccommodationStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
          Accommodatie niveau
        </h2>
        <p className="text-white/80 drop-shadow-sm">
          Kies je gewenste comfort niveau
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="space-y-4">
          {[
            {
              value: "budget",
              label: "Budget",
              icon: FaHome,
              description: "Eenvoudige, schone accommodaties",
              details: "Hostels, budget hotels, eenvoudige appartementen"
            },
            {
              value: "mid-range",
              label: "Mid-range",
              icon: FaHotel,
              description: "Comfortabele accommodaties met goede service",
              details: "3-4 sterren hotels, gezellige appartementen"
            },
            {
              value: "luxury",
              label: "Luxury",
              icon: FaStar,
              description: "Luxe verblijf met premium voorzieningen",
              details: "5 sterren hotels, resorts, luxe villa's"
            },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => updateData({ accommodationLevel: option.value as "budget" | "mid-range" | "luxury" })}
              className={`w-full p-6 rounded-xl text-left transition-all flex items-start gap-4 ${
                wizardData.accommodationLevel === option.value
                  ? "bg-yellow-400/20 border-2 border-yellow-400 text-white"
                  : "bg-white/10 border border-white/20 text-white/80 hover:bg-white/20"
              }`}
            >
              <div className={`p-3 rounded-lg ${
                wizardData.accommodationLevel === option.value ? "bg-yellow-400/30" : "bg-white/20"
              }`}>
                <option.icon className="text-yellow-400 text-xl" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg mb-1">{option.label}</div>
                <div className="text-sm mb-2">{option.description}</div>
                <div className="text-xs opacity-70">{option.details}</div>
              </div>
            </button>
          ))}
        </div>

        {errors.accommodationLevel && (
          <p className="text-red-400 text-sm mt-4">{errors.accommodationLevel}</p>
        )}
      </div>
    </div>
  );

  const renderSurpriseButton = () => (
    <div className="text-center mt-8">
      <button
        onClick={() => updateData({ tripType: "surprise" })}
        className="mb-3 inline-flex items-center gap-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
      >
        <FaGift className="text-lg" />
        Surprise me
      </button>
    </div>
  );

  const renderNavigationButtons = () => (
    <div className="flex justify-between items-center mt-8">
      <button
        onClick={prevStep}
        disabled={currentStep === 1}
        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
          currentStep === 1
            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
            : "bg-white/10 hover:bg-white/20 text-white"
        }`}
      >
        <FaArrowLeft /> Vorige
      </button>

      {currentStep === totalSteps ? (
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-black font-bold px-8 py-3 rounded-xl transition-all duration-300 disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent" />
              Bezig...
            </>
          ) : (
            <>
              Verstuur intake
              <FaArrowRight />
            </>
          )}
        </button>
      ) : (
        <button
          onClick={nextStep}
          className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-black font-bold px-6 py-3 rounded-xl transition-all duration-300"
        >
          Volgende <FaArrowRight />
        </button>
      )}
    </div>
  );

  return (
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8" style={{ marginTop: "120px" }}>
            <h1 className="font-black leading-none tracking-tight mb-4">
              <div className="text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] [text-shadow:_2px_2px_4px_rgba(0,0,0,0.9)]">
                <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter">
                  PLAN JE
                </span>
                <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter mt-1 text-yellow-400">
                  DROOMREIS
                </span>
              </div>
            </h1>
            <p className="text-white/90 text-lg drop-shadow-lg font-medium">
              In een paar simpele stappen naar jouw perfecte vakantie
            </p>
          </div>

          {/* Progress bar */}
          {renderProgressBar()}

          {/* Surprise me button - always visible at top */}
          <div
            key="surprise-button"
            className={
              currentStep > 1 && wizardData.tripType !== "surprise"
                ? "block"
                : "hidden"
            }
          >
            {renderSurpriseButton()}
          </div>

          {/* Main content */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
            <div key={`step-${currentStep}`}>
              {currentStep === 1 && renderStep1()}

              {/* Flight Intake Flow */}
              {wizardData.tripType === "flight" && (
                <>
                  {currentStep === 2 && renderTravelerTypeStep()}
                  {currentStep === 3 && renderDestinationStep()}
                  {currentStep === 4 && renderStep3()}
                  {currentStep === 5 && renderDepartureAirportStep()}
                  {currentStep === 6 && renderPassengersStep()}
                  {currentStep === 7 && renderFlightOptionsStep()}
                  {currentStep === 8 && renderCarRentalStep()}
                  {currentStep === 9 && renderAccommodationStep()}
                  {currentStep === 10 && renderBudgetStep()}
                  {currentStep === 11 && renderTripStyleStep()}
                </>
              )}

              {/* Surprise Me Flow */}
              {wizardData.tripType === "surprise" && (
                <>
                  {currentStep === 2 && renderSurpriseDatesStep()}
                  {currentStep === 3 && renderSurpriseInfoStep()}
                  {currentStep === 4 && renderSurpriseAccommodationStep()}
                </>
              )}

              {/* Legacy flow for other trip types */}
              {wizardData.tripType === "cruise" && (
                <>
                  {currentStep === 2 && renderStep2()}
                  {currentStep === 3 && renderStep3()}
                </>
              )}
            </div>

            {/* Navigation */}
            <div key="navigation">{renderNavigationButtons()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
