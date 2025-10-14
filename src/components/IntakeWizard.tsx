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
import SimpleDestinationStep from "@/components/SimpleDestinationStep";

interface WizardData {
  // Step 1: Traveler Type
  travelerType: "jongeren" | "couples" | "honeymoon" | "familievakantie" | "";

  // Step 2: Trip Type
  tripType:
    | "flight"
    | "cruise"
    | "surprise"
    | "accommodation-only"
    | "flight-only"
    | "";

  // Step 3: Destination
  destination: string;
  destinationType:
    | "popular"
    | "worldwide"
    | "custom"
    | "ai-anywhere"
    | "country"
    | "manual"
    | "";
  selectedCountry: string;
  selectedCity: string;

  // Step 4: Dates & Flexibility
  departureDate: string;
  returnDate: string;
  tripDuration: "5" | "7" | "10" | "14" | "";
  useDuration: boolean;
  flexibility: "exact" | "2days" | "3days" | "";

  // Step 5: Departure Airports
  departureAirport: "AMS" | "RTM" | "EIN" | "DUS" | "BRU" | "";
  departureAirports: string[];
  flexibleAirport: boolean;

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
  accommodation:
    | "hotel"
    | "apartment"
    | "house"
    | "hostel"
    | "all-inclusive"
    | "included"
    | "not-included"
    | "";
  accommodationWanted: boolean;
  accommodationChoiceMade: boolean;

  // Step 10: Budget
  budget: string;
  customBudget: string;

  // Step 11: Trip Type
  tripStyle:
    | "beach"
    | "adventure"
    | "luxury"
    | "city-trip"
    | "family"
    | "wellness"
    | "nature"
    | "surprise-me"
    | "";

  // Contact & Surprise Me Flow
  fullName: string;
  email: string;
  wantsNewsletter: boolean;
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
  selectedCountry: "",
  selectedCity: "",
  departureDate: "",
  returnDate: "",
  tripDuration: "",
  useDuration: false,
  flexibility: "",
  departureAirport: "",
  departureAirports: [],
  flexibleAirport: false,
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
  accommodationWanted: false,
  accommodationChoiceMade: false,
  budget: "",
  customBudget: "",
  tripStyle: "",
  fullName: "",
  email: "",
  wantsNewsletter: false,
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
  const [toast, setToast] = useState<{message: string, type: 'error' | 'success'} | null>(null);
  const router = useRouter();

  const getTotalSteps = () => {
    if (wizardData.tripType === "surprise") return 7; // Travel dates, Budget+Travelers, Accommodation, Car rental, Contact, Final
    if (wizardData.tripType === "flight") return 12;
    if (wizardData.tripType === "accommodation-only") return 9; // Skip flight-related steps
    if (wizardData.tripType === "flight-only") return 9; // Skip accommodation and trip style steps
    if (wizardData.tripType === "cruise") return 5;
    return 12; // Default to flight steps for initial calculation
  };

  const totalSteps = getTotalSteps();

  useEffect(() => {
    setWizardData((prev) => ({ ...prev, timestamp: Date.now() }));
  }, []);

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const updateData = (updates: Partial<WizardData>) => {
    setWizardData((prev) => ({ ...prev, ...updates }));
    setErrors({});

    // No automatic step reset when changing trip type
    // Let user navigate manually with Next/Previous buttons
  };

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 1: // Traveler Type
        if (!wizardData.travelerType) {
          newErrors.travelerType = "Selecteer reizigerstype";
        }
        break;

      case 2: // Trip Type
        if (!wizardData.tripType) {
          newErrors.tripType = "Selecteer een type reis";
        }
        break;

      case 3: // Trip Style (All trip types except surprise, cruise, and flight-only)
        if (
          ["flight", "accommodation-only"].includes(wizardData.tripType) &&
          !wizardData.tripStyle
        ) {
          newErrors.tripStyle = "Selecteer een reisstijl";
        }
        break;

      case 4: // Destination (All trip types except surprise and cruise)
        if (
          ["flight", "accommodation-only"].includes(wizardData.tripType) &&
          !wizardData.destination
        ) {
          newErrors.destination = "Selecteer een bestemming";
        }
        break;

      case 3: // Destination for flight-only (skip trip style step)
        if (wizardData.tripType === "flight-only" && !wizardData.destination) {
          newErrors.destination = "Selecteer een bestemming";
        }
        break;

      case 5: // Departure Airport (Flight types only)
        if (["flight", "flight-only"].includes(wizardData.tripType)) {
          if (
            !wizardData.flexibleAirport &&
            (!wizardData.departureAirports ||
              wizardData.departureAirports.length === 0)
          ) {
            newErrors.departureAirport =
              "Selecteer een vertrekreiport of kies voor flexibel";
          }
        }
        break;

      case 4: // Departure Airport for flight-only (adjusted step number)
        if (wizardData.tripType === "flight-only") {
          if (
            !wizardData.flexibleAirport &&
            (!wizardData.departureAirports ||
              wizardData.departureAirports.length === 0)
          ) {
            newErrors.departureAirport =
              "Selecteer een vertrekreiport of kies voor flexibel";
          }
        }
        break;

      case 6: // Dates & Flexibility (flight and accommodation-only)
        if (["flight", "accommodation-only"].includes(wizardData.tripType)) {
          if (!wizardData.departureDate)
            newErrors.departureDate = "Vertrekdatum is verplicht";

          if (wizardData.useDuration) {
            if (!wizardData.tripDuration)
              newErrors.returnDate = "Reisduur is verplicht";
          } else {
            if (!wizardData.returnDate)
              newErrors.returnDate = "Terugkomstdatum is verplicht";
          }

          if (!wizardData.flexibility)
            newErrors.flexibility = "Flexibiliteit is verplicht";

          // Date validation
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const depDate = new Date(wizardData.departureDate);

          if (depDate < today)
            newErrors.departureDate =
              "Vertrekdatum kan niet in het verleden liggen";

          if (!wizardData.useDuration && wizardData.returnDate) {
            const retDate = new Date(wizardData.returnDate);
            if (retDate < today)
              newErrors.returnDate =
                "Terugkomstdatum kan niet in het verleden liggen";
            if (retDate <= depDate)
              newErrors.returnDate =
                "Terugkomstdatum moet na vertrekdatum liggen";
          }
        }
        break;

      case 5: // Dates & Flexibility for flight-only (adjusted step number)
        if (wizardData.tripType === "flight-only") {
          if (!wizardData.departureDate)
            newErrors.departureDate = "Vertrekdatum is verplicht";

          if (wizardData.useDuration) {
            if (!wizardData.tripDuration)
              newErrors.returnDate = "Reisduur is verplicht";
          } else {
            if (!wizardData.returnDate)
              newErrors.returnDate = "Terugkomstdatum is verplicht";
          }

          if (!wizardData.flexibility)
            newErrors.flexibility = "Flexibiliteit is verplicht";

          // Date validation
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const depDate = new Date(wizardData.departureDate);

          if (depDate < today)
            newErrors.departureDate =
              "Vertrekdatum kan niet in het verleden liggen";

          if (!wizardData.useDuration && wizardData.returnDate) {
            const retDate = new Date(wizardData.returnDate);
            if (retDate < today)
              newErrors.returnDate =
                "Terugkomstdatum kan niet in het verleden liggen";
            if (retDate <= depDate)
              newErrors.returnDate =
                "Terugkomstdatum moet na vertrekdatum liggen";
          }
        }
        break;

      case 7: // Passengers (flight and accommodation-only)
        if (["flight", "accommodation-only"].includes(wizardData.tripType)) {
          if (wizardData.adults < 1) newErrors.adults = "Minimaal 1 volwassene";
        }
        break;

      case 6: // Passengers for flight-only (adjusted step number)
        if (wizardData.tripType === "flight-only") {
          if (wizardData.adults < 1) newErrors.adults = "Minimaal 1 volwassene";
        }
        break;

      case 8: // Flight Options (flight only)
        if (wizardData.tripType === "flight") {
          if (!wizardData.flightType)
            newErrors.flightType = "Selecteer vluchttype";
          if (!wizardData.flightClass)
            newErrors.flightClass = "Selecteer vluchtklasse";
        }
        break;

      case 7: // Flight Options for flight-only (adjusted step number)
        if (wizardData.tripType === "flight-only") {
          if (!wizardData.flightType)
            newErrors.flightType = "Selecteer vluchttype";
          if (!wizardData.flightClass)
            newErrors.flightClass = "Selecteer vluchtklasse";
        }
        break;

      case 9: // Budget (accommodation-only)
        if (wizardData.tripType === "accommodation-only") {
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
        }
        break;

      case 8: // Budget for flight-only (adjusted step number)
        if (wizardData.tripType === "flight-only") {
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
        }
        break;

      case 7: // Accommodation (accommodation-only flow)
        if (
          wizardData.tripType === "accommodation-only" &&
          !wizardData.accommodation
        ) {
          newErrors.accommodation = "Selecteer accommodatie";
        }
        break;

      case 8: // Budget (accommodation-only flow)
        if (wizardData.tripType === "accommodation-only") {
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
        }
        break;

      case 9: // Contact for accommodation-only flow
        if (wizardData.tripType === "accommodation-only") {
          if (!wizardData.fullName) newErrors.fullName = "Naam is verplicht";
          if (!wizardData.email) newErrors.email = "Email is verplicht";
          // Email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (wizardData.email && !emailRegex.test(wizardData.email)) {
            newErrors.email = "Ongeldig email adres";
          }
        }
        break;

      case 9: // Contact for flight-only flow (adjusted step number)
        if (wizardData.tripType === "flight-only") {
          if (!wizardData.fullName) newErrors.fullName = "Naam is verplicht";
          if (!wizardData.email) newErrors.email = "Email is verplicht";
          // Email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (wizardData.email && !emailRegex.test(wizardData.email)) {
            newErrors.email = "Ongeldig email adres";
          }
        }
        break;

      case 10: // Accommodation (flight flow)
        if (wizardData.tripType === "flight" && !wizardData.accommodation) {
          newErrors.accommodation = "Selecteer accommodatie";
        }
        break;

      case 11: // Budget (flight flow)
        if (wizardData.tripType === "flight") {
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
        }
        break;

      case 12: // Contact (flight flow)
        if (wizardData.tripType === "flight") {
          if (!wizardData.fullName) newErrors.fullName = "Naam is verplicht";
          if (!wizardData.email) newErrors.email = "Email is verplicht";
          // Email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (wizardData.email && !emailRegex.test(wizardData.email)) {
            newErrors.email = "Ongeldig email adres";
          }
        }
        break;

      // Handle Surprise Me Flow specifically
      default:
        if (wizardData.tripType === "surprise") {
          switch (currentStep) {
            case 2: // Dates
              if (!wizardData.departureDate)
                newErrors.departureDate = "Vertrekdatum is verplicht";
              if (!wizardData.returnDate)
                newErrors.returnDate = "Terugkomstdatum is verplicht";

              // Date validation for surprise me
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
                newErrors.returnDate =
                  "Terugkomstdatum moet na vertrekdatum liggen";
              break;

            case 3: // Budget & Passengers for surprise trips
              if (!wizardData.budget && !wizardData.customBudget)
                newErrors.budget = "Budget is verplicht";
              if (wizardData.adults < 1)
                newErrors.adults = "Minimaal 1 volwassene";

              // Budget validation for surprise me
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

            case 4: // Accommodation Y/N + type selection
              // Check if user has made a choice at all
              if (!wizardData.accommodationChoiceMade) {
                newErrors.accommodation = "Kies of je accommodatie wilt";
              }
              // If they chose Yes but didn't select a type
              else if (wizardData.accommodationWanted && !wizardData.accommodation) {
                newErrors.accommodation = "Selecteer een accommodatie type";
              }
              break;

            case 5: // Car rental Y/N + details
              // Car rental choice validation is optional, defaults to false
              if (wizardData.carRental && !wizardData.carType) {
                newErrors.carType = "Selecteer auto type";
              }
              if (wizardData.carRental && !wizardData.carGearbox) {
                newErrors.carGearbox = "Selecteer transmissie";
              }
              break;

            case 6: // Contact details for Surprise Me
              if (!wizardData.fullName)
                newErrors.fullName = "Naam is verplicht";
              if (!wizardData.email) newErrors.email = "Email is verplicht";
              // Email validation
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (wizardData.email && !emailRegex.test(wizardData.email)) {
                newErrors.email = "Ongeldig email adres";
              }
              break;

            case 7: // Final step for Surprise Me
              // No validation needed for final step
              break;
          }
        }
        break;

      // Additional validation for steps 4-5 based on trip type...
    }

    setErrors(newErrors);

    // Show toast with specific missing field message
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      showToast(firstError, 'error');
    }

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

  const validateAllSteps = (): boolean => {
    const allErrors: Record<string, string> = {};

    if (wizardData.tripType === "surprise") {
      // Step 2: Dates
      if (!wizardData.departureDate) allErrors.departureDate = "Vertrekdatum is verplicht";
      if (!wizardData.returnDate) allErrors.returnDate = "Terugkomstdatum is verplicht";

      // Step 3: Budget & Travelers
      if (!wizardData.budget && !wizardData.customBudget) allErrors.budget = "Budget is verplicht";
      if (wizardData.adults < 1) allErrors.adults = "Minimaal 1 volwassene";

      // Step 4: Accommodation choice
      if (!wizardData.accommodationChoiceMade) {
        allErrors.accommodation = "Kies of je accommodatie wilt";
      } else if (wizardData.accommodationWanted && !wizardData.accommodation) {
        allErrors.accommodation = "Selecteer een accommodatie type";
      }

      // Step 6: Contact details
      if (!wizardData.fullName) allErrors.fullName = "Naam is verplicht";
      if (!wizardData.email) allErrors.email = "Email is verplicht";
    }

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      const firstError = Object.values(allErrors)[0];
      showToast(firstError, 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    console.log('HandleSubmit called, current step:', currentStep);
    console.log('Current wizard data:', wizardData);

    if (!validateAllSteps()) {
      console.log('Full validation failed, not submitting');
      return;
    }

    console.log('Full validation passed, submitting...');

    setIsSubmitting(true);
    try {
      // Calculate return date if using duration
      let calculatedReturnDate = wizardData.returnDate;
      if (wizardData.useDuration && wizardData.tripDuration && wizardData.departureDate) {
        const depDate = new Date(wizardData.departureDate);
        const durationDays = parseInt(wizardData.tripDuration);
        const returnDate = new Date(depDate);
        returnDate.setDate(depDate.getDate() + durationDays);
        calculatedReturnDate = returnDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      }

      // Handle budget - if custom budget is used, use customBudget value as budget
      let finalBudget = wizardData.budget;
      if (wizardData.budget === "custom" && wizardData.customBudget) {
        finalBudget = wizardData.customBudget;
      }

      // Map tripType to travelType for API compatibility
      const submissionData = {
        ...wizardData,
        travelType: wizardData.tripType,
        returnDate: calculatedReturnDate,
        budget: finalBudget,
      };

      console.log('Submitting data:', submissionData);

      const response = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        showToast('Formulier succesvol verzonden!', 'success');

        // Use setTimeout to allow toast to show before navigation
        setTimeout(() => {
          router.push(`/results?id=${result.id || "demo"}`);
        }, 1000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error:", errorData);
        console.error("Response status:", response.status);

        // Show specific error message from API or generic message
        const errorMessage = errorData.error || errorData.message || `Server error: ${response.status}`;
        showToast(errorMessage, 'error');

        // Don't throw error, just show toast
        return;
      }
    } catch (error) {
      console.error("Submission error:", error);
      const errorMessage = error instanceof Error ? error.message : "Onbekende fout";
      showToast(`Er ging iets mis: ${errorMessage}. Probeer het opnieuw.`, 'error');
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
            subtitle: "Youth travelers",
            description: "Avontuurlijke groepsreizen",
          },
          {
            type: "couples" as const,
            icon: FaHeart,
            title: "Koppels",
            subtitle: "Couples",
            description: "Romantische reizen voor twee",
          },
          {
            type: "honeymoon" as const,
            icon: FaStar,
            title: "Honeymoon",
            subtitle: "Honeymoon",
            description: "Speciale huwelijksreis",
          },
          {
            type: "familievakantie" as const,
            icon: FaBaby,
            title: "Familie",
            subtitle: "Family",
            description: "Perfecte gezinsvakanties",
          },
        ].map((option) => (
          <button
            key={option.type}
            onClick={() => updateData({ travelerType: option.type })}
            disabled={false}
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
            <p className="text-sm mb-3 font-medium text-yellow-400/90">
              {option.subtitle}
            </p>
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

  const renderTripTypeStep = () => (
    <div className="text-center space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
          Wat voor reis zoek je?
        </h2>
        <p className="text-white drop-shadow-sm">
          Kies het type reis dat het best bij je past
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
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
            type: "accommodation-only" as const,
            icon: FaHotel,
            title: "Accommodation only",
            subtitle: "Alleen accommodatie",
            description: "Boek alleen je verblijf",
          },
          {
            type: "flight-only" as const,
            icon: FaPlane,
            title: "Flight only",
            subtitle: "Alleen vluchten",
            description: "Boek alleen je vlucht",
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
            onClick={() =>
              !option.comingSoon && updateData({ tripType: option.type })
            }
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
                } ${
                  !option.comingSoon ? "group-hover:scale-110" : ""
                } transition-all duration-300`}
              >
                <option.icon
                  className={`text-3xl ${
                    option.comingSoon ? "text-red-400" : "text-yellow-400"
                  }`}
                />
              </div>
            </div>
            <h3
              className={`text-xl font-bold mb-2 ${
                option.comingSoon ? "text-white/70" : "text-white"
              }`}
            >
              {option.title}
            </h3>
            <p
              className={`text-sm mb-3 font-medium ${
                option.comingSoon ? "text-red-400/70" : "text-yellow-400/90"
              }`}
            >
              {option.subtitle}
            </p>
            <p
              className={`text-sm leading-relaxed ${
                option.comingSoon ? "text-white/50" : "text-white"
              }`}
            >
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
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-3 text-white font-medium">
                <FaCalendarAlt className="text-yellow-400" />
                {wizardData.useDuration ? "Reisduur" : "Terugkomstdatum"}{" "}
                <span className="text-red-400">*</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  updateData({
                    useDuration: !wizardData.useDuration,
                    returnDate: "",
                    tripDuration: "",
                  })
                }
                className="text-yellow-400 text-sm hover:text-yellow-300 transition-colors"
              >
                {wizardData.useDuration
                  ? "Gebruik einddatum"
                  : "Gebruik reisduur"}
              </button>
            </div>

            {wizardData.useDuration ? (
              <div className="space-y-3">
                {[
                  { value: "5", label: "5 dagen" },
                  { value: "7", label: "7 dagen" },
                  { value: "10", label: "10 dagen" },
                  { value: "14", label: "14 dagen" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      updateData({
                        tripDuration: option.value as "5" | "7" | "10" | "14",
                      })
                    }
                    className={`w-full p-3 rounded-xl text-left transition-all ${
                      wizardData.tripDuration === option.value
                        ? "bg-yellow-400/20 border-2 border-yellow-400 text-white"
                        : "bg-white/10 border border-white/20 text-white/80 hover:bg-white/20"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : (
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
            )}
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
                onClick={() =>
                  updateData({
                    flexibility: option.value as "exact" | "2days" | "3days",
                  })
                }
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

  const renderDepartureAirportStep = () => {
    const allAirportCodes = ["AMS", "RTM", "EIN", "DUS", "BRU"];

    const handleAirportToggle = (airportCode: string) => {
      // If flexible is enabled, disable it first and then toggle the specific airport
      if (wizardData.flexibleAirport) {
        updateData({
          flexibleAirport: false,
          departureAirports: [airportCode],
          departureAirport: airportCode as "AMS" | "RTM" | "EIN" | "DUS" | "BRU" | "",
        });
        return;
      }

      const currentAirports = wizardData.departureAirports || [];
      const isSelected = currentAirports.includes(airportCode);

      let newAirports;
      if (isSelected) {
        newAirports = currentAirports.filter((code) => code !== airportCode);
      } else {
        newAirports = [...currentAirports, airportCode];
      }

      updateData({
        departureAirports: newAirports,
        departureAirport:
          newAirports.length > 0
            ? (newAirports[0] as "AMS" | "RTM" | "EIN" | "DUS" | "BRU" | "")
            : "",
      });
    };

    const handleFlexibleToggle = () => {
      const newFlexible = !wizardData.flexibleAirport;
      updateData({
        flexibleAirport: newFlexible,
        departureAirports: newFlexible ? allAirportCodes : [],
        departureAirport: newFlexible ? "AMS" : "",
      });
    };

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
            Vanaf welke luchthaven?
          </h2>
          <p className="text-white/80 drop-shadow-sm">
            Kies één of meerdere vertrekreirports (multi-select mogelijk)
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Flexible Option */}
          <div>
            <button
              onClick={handleFlexibleToggle}
              className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-4 ${
                wizardData.flexibleAirport
                  ? "bg-yellow-400/20 border-2 border-yellow-400 text-white"
                  : "bg-white/10 border border-white/20 text-white/80 hover:bg-white/20"
              }`}
            >
              <div
                className={`p-3 rounded-lg ${
                  wizardData.flexibleAirport
                    ? "bg-yellow-400/30"
                    : "bg-white/20"
                }`}
              >
                <FaGlobe className="text-yellow-400" />
              </div>
              <div>
                <div className="font-bold text-lg">Ik ben flexibel</div>
                <div className="text-sm opacity-80">
                  Alle luchthavens zijn goed
                </div>
              </div>
            </button>
          </div>

          {/* Airport Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { code: "AMS", name: "Amsterdam (Schiphol)", city: "Amsterdam" },
              { code: "RTM", name: "Rotterdam (The Hague)", city: "Rotterdam" },
              { code: "EIN", name: "Eindhoven", city: "Eindhoven" },
              { code: "DUS", name: "Düsseldorf", city: "Düsseldorf" },
              { code: "BRU", name: "Brussel", city: "Brussel" },
            ].map((airport) => {
              const isSelected =
                wizardData.flexibleAirport ||
                (wizardData.departureAirports?.includes(airport.code) || false);
              return (
                <button
                  key={airport.code}
                  onClick={() => handleAirportToggle(airport.code)}
                  className={`p-4 rounded-xl text-left transition-all flex items-center gap-4 ${
                    isSelected
                      ? "bg-yellow-400/20 border-2 border-yellow-400 text-white"
                      : "bg-white/10 border border-white/20 text-white/80 hover:bg-white/20"
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg ${
                      isSelected ? "bg-yellow-400/30" : "bg-white/20"
                    }`}
                  >
                    <FaPlane className="text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-lg">{airport.code}</div>
                    <div className="text-sm opacity-80">{airport.name}</div>
                  </div>
                  {isSelected && (
                    <FaCheckCircle className="text-yellow-400 text-xl" />
                  )}
                </button>
              );
            })}
          </div>

          {errors.departureAirport && (
            <p className="text-red-400 text-sm mt-4">
              {errors.departureAirport}
            </p>
          )}
        </div>
      </div>
    );
  };

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
        <p className="text-white/80 drop-shadow-sm">Kies je vliegopties</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <label className="flex items-center gap-3 text-white font-medium mb-3">
            <FaPlane className="text-yellow-400" />
            Vluchttype <span className="text-red-400">*</span>
          </label>
          <div className="space-y-3">
            {[
              {
                value: "direct",
                label: "Direct vlucht",
                description: "Geen tussenstops",
              },
              {
                value: "stopover",
                label: "Met tussenstop",
                description: "Goedkoper, langere reistijd",
              },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() =>
                  updateData({
                    flightType: option.value as "direct" | "stopover",
                  })
                }
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
              {
                value: "economy",
                label: "Economy",
                description: "Standaard comfort",
              },
              {
                value: "premium",
                label: "Premium Economy",
                description: "Extra beenruimte",
              },
              {
                value: "business",
                label: "Business",
                description: "Luxe ervaring",
              },
              {
                value: "first",
                label: "First Class",
                description: "Ultieme luxe",
              },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() =>
                  updateData({
                    flightClass: option.value as
                      | "economy"
                      | "premium"
                      | "business"
                      | "first",
                  })
                }
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
              onClick={() =>
                updateData({ carRental: false, carType: "", carGearbox: "" })
              }
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
                {["hatchback", "sedan", "mpv", "suv", "4x4"].map((type) => (
                  <button
                    key={type}
                    onClick={() =>
                      updateData({
                        carType: type as
                          | "hatchback"
                          | "sedan"
                          | "mpv"
                          | "suv"
                          | "4x4",
                      })
                    }
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
                onChange={(e) =>
                  updateData({ driverAge: parseInt(e.target.value) || 25 })
                }
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
        <p className="text-white/80 drop-shadow-sm">Kies je accommodatietype</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="space-y-3">
          {[
            {
              value: "hotel",
              label: "Hotel",
              icon: FaHotel,
              description: "Service en comfort",
            },
            {
              value: "apartment",
              label: "Appartement",
              icon: FaHome,
              description: "Zelfstandig verblijf",
            },
            {
              value: "house",
              label: "Vakantiehuis",
              icon: FaHome,
              description: "Veel ruimte en privacy",
            },
            {
              value: "hostel",
              label: "Hostel",
              icon: FaUsers,
              description: "Budget-vriendelijk",
            },
            {
              value: "all-inclusive",
              label: "All-Inclusive Resort",
              icon: FaStar,
              description: "Alles inbegrepen",
            },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() =>
                updateData({
                  accommodation: option.value as
                    | "hotel"
                    | "apartment"
                    | "house"
                    | "hostel"
                    | "all-inclusive",
                })
              }
              className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-4 ${
                wizardData.accommodation === option.value
                  ? "bg-yellow-400/20 border-2 border-yellow-400 text-white"
                  : "bg-white/10 border border-white/20 text-white/80 hover:bg-white/20"
              }`}
            >
              <div
                className={`p-3 rounded-lg ${
                  wizardData.accommodation === option.value
                    ? "bg-yellow-400/30"
                    : "bg-white/20"
                }`}
              >
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
              {
                value: "custom",
                label: "Ander bedrag...",
                description: "Aangepast budget",
              },
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
            {
              value: "beach",
              label: "Beach",
              icon: FaUmbrellaBeach,
              description: "Zon, zee en strand",
            },
            {
              value: "adventure",
              label: "Adventure",
              icon: FaMountain,
              description: "Actie en avontuur",
            },
            {
              value: "luxury",
              label: "Luxury",
              icon: FaStar,
              description: "Ultieme luxe ervaring",
            },
            {
              value: "city-trip",
              label: "City Trip",
              icon: FaCity,
              description: "Stedelijke verkenning",
            },
            {
              value: "family",
              label: "Family",
              icon: FaBaby,
              description: "Gezinsvriendelijk",
            },
            {
              value: "wellness",
              label: "Wellness",
              icon: FaSpa,
              description: "Ontspanning en wellness",
            },
            {
              value: "nature",
              label: "Nature",
              icon: FaLeaf,
              description: "Natuur en wildlife",
            },
            {
              value: "surprise-me",
              label: "Surprise Me",
              icon: FaGift,
              description: "Laat ons kiezen",
            },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() =>
                updateData({
                  tripStyle: option.value as
                    | "beach"
                    | "adventure"
                    | "luxury"
                    | "city-trip"
                    | "family"
                    | "wellness"
                    | "nature"
                    | "surprise-me",
                })
              }
              className={`p-6 rounded-2xl text-center transition-all ${
                wizardData.tripStyle === option.value
                  ? "bg-yellow-400/20 border-2 border-yellow-400 text-white transform scale-105"
                  : "bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 hover:scale-102"
              }`}
            >
              <div className="flex justify-center mb-3">
                <div
                  className={`p-3 rounded-xl ${
                    wizardData.tripStyle === option.value
                      ? "bg-yellow-400/30"
                      : "bg-white/20"
                  }`}
                >
                  <option.icon className="text-2xl text-yellow-400" />
                </div>
              </div>
              <div className="font-medium text-sm">{option.label}</div>
              <div className="text-xs opacity-70 mt-1">
                {option.description}
              </div>
            </button>
          ))}
        </div>

        {errors.tripStyle && (
          <p className="text-red-400 text-sm mt-4 text-center">
            {errors.tripStyle}
          </p>
        )}
      </div>
    </div>
  );

  // Surprise Me Flow Steps
  const renderSurpriseDatesStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mt-10 text-3xl font-bold text-white mb-4 drop-shadow-lg">
          Wanneer wil je gaan?
        </h2>
        <p className="text-white/80 drop-shadow-sm">Kies je reisperiode</p>
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
      </div>
    </div>
  );

  const renderSurpriseInfoStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
          Budget en reizigers
        </h2>
        <p className="text-white drop-shadow-sm">
          Vertel ons over je budget en reisgezelschap
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
              {
                value: "custom",
                label: "Ander bedrag...",
                description: "Aangepast budget",
              },
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


  const renderSurpriseAccommodationConfirmStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
          Wil je accommodatie bij je surprise reis?
        </h2>
        <p className="text-white/80 drop-shadow-sm">
          Kies of je accommodatie wilt toevoegen aan je surprise pakket
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="space-y-4 mb-6">
          <button
            type="button"
            onClick={() => {
              console.log('Clicking YES for accommodation');
              updateData({
                accommodationWanted: true,
                accommodationChoiceMade: true,
                accommodation: wizardData.accommodation || "hotel" // Default to hotel if not already selected
              });
            }}
            className={`w-full p-6 rounded-xl text-left transition-all flex items-start gap-4 ${
              wizardData.accommodationChoiceMade && wizardData.accommodationWanted
                ? "bg-yellow-400/20 border-2 border-yellow-400 text-white"
                : "bg-white/10 border border-white/20 text-white/80 hover:bg-white/20"
            }`}
          >
            <div
              className={`p-3 rounded-lg ${
                wizardData.accommodationChoiceMade && wizardData.accommodationWanted
                  ? "bg-yellow-400/30"
                  : "bg-white/20"
              }`}
            >
              <FaHotel className="text-yellow-400 text-xl" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg mb-1">
                Ja
              </div>
              <div className="text-sm opacity-70">
                Ik wil accommodatie bij mijn surprise reis
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              console.log('Clicking NO for accommodation');
              updateData({
                accommodationWanted: false,
                accommodationChoiceMade: true,
                accommodation: ""
              });
            }}
            className={`w-full p-6 rounded-xl text-left transition-all flex items-start gap-4 ${
              wizardData.accommodationChoiceMade && wizardData.accommodationWanted === false
                ? "bg-yellow-400/20 border-2 border-yellow-400 text-white"
                : "bg-white/10 border border-white/20 text-white/80 hover:bg-white/20"
            }`}
          >
            <div
              className={`p-3 rounded-lg ${
                wizardData.accommodationChoiceMade && wizardData.accommodationWanted === false
                  ? "bg-yellow-400/30"
                  : "bg-white/20"
              }`}
            >
              <FaPlane className="text-yellow-400 text-xl" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg mb-1">
                Nee
              </div>
              <div className="text-sm opacity-70">
                Ik regel zelf mijn verblijf ter plaatse
              </div>
            </div>
          </button>
        </div>

        {wizardData.accommodationWanted && (
          <div className="space-y-4">
            <h3 className="text-white font-medium text-lg">Wat voor accommodatie verkies je?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { value: "hotel", label: "Hotel", icon: FaHotel },
                { value: "apartment", label: "Apartment", icon: FaHome },
                { value: "house", label: "House", icon: FaHome },
                { value: "hostel", label: "Hostel", icon: FaUmbrellaBeach },
                { value: "all-inclusive", label: "All-inclusive", icon: FaStar }
              ].map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => updateData({ accommodation: option.value as "hotel" | "apartment" | "house" | "hostel" | "all-inclusive" })}
                  className={`p-4 rounded-xl text-left transition-all flex items-center gap-3 ${
                    wizardData.accommodation === option.value
                      ? "bg-yellow-400/20 border-2 border-yellow-400 text-white"
                      : "bg-white/10 border border-white/20 text-white/80 hover:bg-white/20"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      wizardData.accommodation === option.value
                        ? "bg-yellow-400/30"
                        : "bg-white/20"
                    }`}
                  >
                    <option.icon className="text-yellow-400" />
                  </div>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {errors.accommodation && (
          <p className="text-red-400 text-sm mt-4 text-center">
            {errors.accommodation}
          </p>
        )}
      </div>
    </div>
  );

  const renderSurpriseCarRentalStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
          Wil je een huurauto?
        </h2>
        <p className="text-white/80 drop-shadow-sm">
          Kies of je een auto wilt huren voor je surprise reis
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="space-y-4 mb-6">
          <button
            onClick={() => updateData({ carRental: true })}
            className={`w-full p-6 rounded-xl text-left transition-all flex items-start gap-4 ${
              wizardData.carRental
                ? "bg-yellow-400/20 border-2 border-yellow-400 text-white"
                : "bg-white/10 border border-white/20 text-white/80 hover:bg-white/20"
            }`}
          >
            <div
              className={`p-3 rounded-lg ${
                wizardData.carRental
                  ? "bg-yellow-400/30"
                  : "bg-white/20"
              }`}
            >
              <FaCar className="text-yellow-400 text-xl" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg mb-1">
                Ja, ik wil een huurauto
              </div>
              <div className="text-sm opacity-70">
                Voeg huurauto toe aan je surprise reis
              </div>
            </div>
          </button>

          <button
            onClick={() => updateData({ carRental: false, carType: "", carGearbox: "" })}
            className={`w-full p-6 rounded-xl text-left transition-all flex items-start gap-4 ${
              !wizardData.carRental
                ? "bg-yellow-400/20 border-2 border-yellow-400 text-white"
                : "bg-white/10 border border-white/20 text-white/80 hover:bg-white/20"
            }`}
          >
            <div
              className={`p-3 rounded-lg ${
                !wizardData.carRental
                  ? "bg-yellow-400/30"
                  : "bg-white/20"
              }`}
            >
              <FaPlane className="text-yellow-400 text-xl" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg mb-1">
                Nee, geen huurauto
              </div>
              <div className="text-sm opacity-70">
                Ik regel zelf vervoer ter plaatse
              </div>
            </div>
          </button>
        </div>

        {wizardData.carRental && (
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-3 text-white font-medium mb-3">
                <FaCog className="text-yellow-400" />
                Type auto
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {["hatchback", "sedan", "mpv", "suv", "4x4"].map((type) => (
                  <button
                    key={type}
                    onClick={() => updateData({ carType: type as "hatchback" | "sedan" | "mpv" | "suv" | "4x4" })}
                    className={`p-3 rounded-xl text-center capitalize transition-all ${
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
                Transmissie
              </label>
              <div className="flex gap-3">
                {["automatic", "manual"].map((gear) => (
                  <button
                    key={gear}
                    onClick={() => updateData({ carGearbox: gear as "manual" | "automatic" })}
                    className={`flex-1 p-3 rounded-xl capitalize transition-all ${
                      wizardData.carGearbox === gear
                        ? "bg-yellow-400/20 border-2 border-yellow-400 text-white"
                        : "bg-white/10 border border-white/20 text-white/80 hover:bg-white/20"
                    }`}
                  >
                    {gear}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3 text-white font-medium mb-3">
                <FaUsers className="text-yellow-400" />
                Leeftijd bestuurder
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

            {errors.carType && (
              <p className="text-red-400 text-sm mt-2">{errors.carType}</p>
            )}
            {errors.carGearbox && (
              <p className="text-red-400 text-sm mt-2">{errors.carGearbox}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderEmailStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
          Contactgegevens
        </h2>
        <p className="text-white/80 drop-shadow-sm">
          We hebben je contactgegevens nodig om je de reis aanbiedingen te
          sturen
        </p>
      </div>

      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <label className="flex items-center gap-3 text-white font-medium mb-3">
            <FaUsers className="text-yellow-400" />
            Naam <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={wizardData.fullName}
            onChange={(e) => updateData({ fullName: e.target.value })}
            className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
            placeholder="Jouw volledige naam"
          />
          {errors.fullName && (
            <p className="text-red-400 text-sm mt-1">{errors.fullName}</p>
          )}
        </div>

        <div>
          <label className="flex items-center gap-3 text-white font-medium mb-3">
            <FaEnvelope className="text-yellow-400" />
            Email adres <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            value={wizardData.email}
            onChange={(e) => updateData({ email: e.target.value })}
            className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
            placeholder="jouw@email.com"
          />
          {errors.email && (
            <p className="text-red-400 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="flex items-center gap-3 text-white cursor-pointer">
            <input
              type="checkbox"
              checked={wizardData.wantsNewsletter}
              onChange={(e) =>
                updateData({ wantsNewsletter: e.target.checked })
              }
              className="w-5 h-5 rounded border-2 border-yellow-400/40 bg-white/10 checked:bg-yellow-400 checked:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 text-yellow-400 accent-yellow-400"
            />
            <span className="text-white text-sm">
              Ja, ik wil graag speciale aanbiedingen ontvangen
            </span>
          </label>
        </div>

        <div className="mt-6 p-4 bg-white/10 rounded-xl border border-white/20">
          <p className="text-white/80 text-sm">
            <strong className="text-white">Privacy:</strong> Je gegevens worden
            alleen gebruikt om je reis aanbiedingen te sturen. We delen je
            gegevens niet met derden.
          </p>
        </div>
      </div>
    </div>
  );

  const renderSurpriseButton = () => {
    const handleSurpriseMeClick = () => {
      // Reset to a clean state for surprise me flow
      const cleanState: Partial<WizardData> = {
        tripType: "surprise",
        // Keep user type but reset everything else
        destination: "",
        destinationType: "",
        selectedCountry: "",
        selectedCity: "",
        departureDate: "",
        returnDate: "",
        tripDuration: "",
        useDuration: false,
        flexibility: "",
        departureAirport: "",
        departureAirports: [],
        flexibleAirport: false,
        flightType: "",
        flightClass: "",
        carRental: false,
        carType: "",
        carGearbox: "",
        accommodation: "",
        accommodationWanted: false,
        accommodationChoiceMade: false,
        budget: "",
        customBudget: "",
        tripStyle: "",
        accommodationLevel: "",
        // Reset to step 1 to start surprise flow properly
      };

      setWizardData(prev => ({
        ...prev,
        ...cleanState,
        // Keep user's traveler type
        travelerType: prev.travelerType,
        // Keep contact info if already filled
        fullName: prev.fullName,
        email: prev.email,
        wantsNewsletter: prev.wantsNewsletter,
        timestamp: Date.now()
      }));

      // Reset current step to start the surprise flow
      setCurrentStep(1);
      // Clear any existing errors
      setErrors({});
    };

    return (
      <div className="text-center mt-8">
        <button
          onClick={handleSurpriseMeClick}
          className="mb-3 inline-flex items-center gap-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          <FaGift className="text-lg" />
          Surprise me
        </button>
      </div>
    );
  };

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
        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="text-center text-white/70 text-xs max-w-md mx-auto md:mx-0">
            Door verder te gaan ga je akkoord met onze{" "}
            <a
              href="/privacy"
              target="_blank"
              className="text-yellow-400 hover:text-yellow-300 underline"
            >
              privacybeleid
            </a>
            . We gebruiken je gegevens alleen om reisaanbiedingen te maken.
          </div>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-black font-bold px-8 py-3 rounded-xl transition-all duration-300 disabled:opacity-70 whitespace-nowrap mx-auto md:mx-0"
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
        </div>
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
              {currentStep === 2 && renderTripTypeStep()}

              {/* Flight Intake Flow */}
              {wizardData.tripType === "flight" && (
                <>
                  {currentStep === 3 && renderTripStyleStep()}
                  {currentStep === 4 && (
                    <SimpleDestinationStep
                      destination={wizardData.destination}
                      destinationType={wizardData.destinationType}
                      onUpdate={updateData}
                      errors={errors}
                    />
                  )}
                  {currentStep === 5 && renderDepartureAirportStep()}
                  {currentStep === 6 && renderStep3()}
                  {currentStep === 7 && renderPassengersStep()}
                  {currentStep === 8 && renderFlightOptionsStep()}
                  {currentStep === 9 && renderCarRentalStep()}
                  {currentStep === 10 && renderAccommodationStep()}
                  {currentStep === 11 && renderBudgetStep()}
                  {currentStep === 12 && renderEmailStep()}
                </>
              )}

              {/* Flight Only Flow - Skip trip style step */}
              {wizardData.tripType === "flight-only" && (
                <>
                  {currentStep === 3 && (
                    <SimpleDestinationStep
                      destination={wizardData.destination}
                      destinationType={wizardData.destinationType}
                      onUpdate={updateData}
                      errors={errors}
                    />
                  )}
                  {currentStep === 4 && renderDepartureAirportStep()}
                  {currentStep === 5 && renderStep3()}
                  {currentStep === 6 && renderPassengersStep()}
                  {currentStep === 7 && renderFlightOptionsStep()}
                  {currentStep === 8 && renderBudgetStep()}
                  {currentStep === 9 && renderEmailStep()}
                </>
              )}

              {/* Accommodation Only Flow */}
              {wizardData.tripType === "accommodation-only" && (
                <>
                  {currentStep === 3 && renderTripStyleStep()}
                  {currentStep === 4 && (
                    <SimpleDestinationStep
                      destination={wizardData.destination}
                      destinationType={wizardData.destinationType}
                      onUpdate={updateData}
                      errors={errors}
                    />
                  )}
                  {currentStep === 5 && renderStep3()}
                  {currentStep === 6 && renderPassengersStep()}
                  {currentStep === 7 && renderAccommodationStep()}
                  {currentStep === 8 && renderBudgetStep()}
                  {currentStep === 9 && renderEmailStep()}
                </>
              )}

              {/* Surprise Me Flow - Added accommodation Y/N step + contact step */}
              {wizardData.tripType === "surprise" && (
                <>
                  {currentStep === 2 && renderSurpriseDatesStep()}
                  {currentStep === 3 && renderSurpriseInfoStep()}
                  {currentStep === 4 && renderSurpriseAccommodationConfirmStep()}
                  {currentStep === 5 && renderSurpriseCarRentalStep()}
                  {currentStep === 6 && renderEmailStep()}
                  {currentStep === 7 && (
                    <div className="text-center space-y-6">
                      <h2 className="text-3xl font-bold text-white mb-4">Bedankt!</h2>
                      <p className="text-white">Je surprise reis aanvraag is ontvangen.</p>
                    </div>
                  )}
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

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 transition-all duration-300 ease-in-out">
          <div
            className={`px-6 py-4 rounded-xl shadow-2xl border-2 max-w-md ${
              toast.type === 'error'
                ? 'bg-red-500/90 border-red-400 text-white'
                : 'bg-green-500/90 border-green-400 text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {toast.type === 'error' ? (
                  <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">!</span>
                  </div>
                ) : (
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">✓</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{toast.message}</p>
              </div>
              <button
                onClick={() => setToast(null)}
                className="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
