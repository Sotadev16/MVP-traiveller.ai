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
  FaGraduationCap,
} from "react-icons/fa";

interface WizardData {
  // Step 1: Trip Type
  tripType: "flight" | "cruise" | "surprise" | "";

  // Step 2: Basic Info
  email: string;
  adults: number;
  children: number;
  childrenAges: number[];
  budget: string;
  customBudget: string;

  // Step 3: Dates & Flexibility
  departureDate: string;
  returnDate: string;
  flexibility: string;

  // Flight/Hotel specific (Steps 4-5)
  destination: string;
  departureAirport: string;
  flightType: string;
  flightClass: string;
  carRental: boolean;
  carType: string;
  accommodation: string;
  tripStyle: string;

  // Cruise specific (Steps 4-5)
  cruiseRegion: string;
  cruiseDuration: string;
  cabinType: string;
  departurePort: string;

  // Security
  timestamp: number;
}

const INITIAL_DATA: WizardData = {
  tripType: "",
  email: "",
  adults: 1,
  children: 0,
  childrenAges: [],
  budget: "",
  customBudget: "",
  departureDate: "",
  returnDate: "",
  flexibility: "",
  destination: "",
  departureAirport: "AMS",
  flightType: "",
  flightClass: "",
  carRental: false,
  carType: "",
  accommodation: "",
  tripStyle: "",
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

  const totalSteps = wizardData.tripType === "surprise" ? 3 : 5;

  useEffect(() => {
    setWizardData((prev) => ({ ...prev, timestamp: Date.now() }));
  }, []);

  const updateData = (updates: Partial<WizardData>) => {
    setWizardData((prev) => ({ ...prev, ...updates }));
    setErrors({});
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 1: // Trip Type
        if (!wizardData.tripType) {
          newErrors.tripType = "Selecteer een type reis";
        }
        break;

      case 2: // Basic Info
        if (!wizardData.email) newErrors.email = "Email is verplicht";
        if (!wizardData.budget && !wizardData.customBudget)
          newErrors.budget = "Budget is verplicht";
        if (wizardData.adults < 1) newErrors.adults = "Minimaal 1 volwassene";

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (wizardData.email && !emailRegex.test(wizardData.email)) {
          newErrors.email = "Ongeldig email adres";
        }

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

      case 3: // Dates & Flexibility
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
                value: "3days",
                label: "±3 dagen flexibel",
                icon: FaCalendarAlt,
              },
              {
                value: "7days",
                label: "±7 dagen flexibel",
                icon: FaCalendarAlt,
              },
              {
                value: "school",
                label: "Alleen schoolvakanties",
                icon: FaGraduationCap,
              },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateData({ flexibility: option.value })}
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
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </div>

            {/* Navigation */}
            <div key="navigation">{renderNavigationButtons()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
