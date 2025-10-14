import { useState } from "react";
import { FaMapMarkerAlt, FaChevronDown } from "react-icons/fa";
import { useDebounce } from "@/hooks/useDebounce";
import {
  filterCountries,
  ALL_COUNTRIES,
  type Country,
} from "@/utils/countries";

interface SimpleDestinationStepProps {
  destination: string;
  destinationType:
    | "popular"
    | "worldwide"
    | "custom"
    | "ai-anywhere"
    | "country"
    | "manual"
    | "";
  onUpdate: (updates: {
    destination?: string;
    destinationType?:
      | "popular"
      | "worldwide"
      | "custom"
      | "ai-anywhere"
      | "country"
      | "manual"
      | "";
  }) => void;
  errors?: { destination?: string };
}

export default function SimpleDestinationStep({
  destination,
  destinationType,
  onUpdate,
  errors = {},
}: SimpleDestinationStepProps) {
  const [countryInput, setCountryInput] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  // 300ms debounce as specified
  const debouncedCountryInput = useDebounce(countryInput, 300);

  const filteredCountries = debouncedCountryInput
    ? filterCountries(debouncedCountryInput)
    : ALL_COUNTRIES.slice(0, 10);

  const handleCountrySelect = (country: Country) => {
    setCountryInput(country.name);
    onUpdate({
      destination: country.name,
      destinationType: "country",
    });
    setShowCountryDropdown(false);
  };


  const handleManualEntry = (input: string) => {
    if (input.trim()) {
      onUpdate({
        destination: input.trim(),
        destinationType: "manual",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
          Waar wil je naartoe?
        </h2>
        <p className="text-white drop-shadow-sm">Zoek een land of stad</p>
      </div>

      <div className="max-w-lg mx-auto space-y-4">
        {/* Popular Destinations Dropdown */}
        <div className="mb-6">
          <label className="block text-white font-medium mb-2">
            Populaire bestemmingen
          </label>
          <div className="space-y-2">
            {[
              "Aruba",
              "Spanje",
              "Griekenland",
              "Italië",
              "Frankrijk",
              "Turkije",
            ].map((country) => (
              <button
                key={country}
                onClick={() =>
                  onUpdate({ destination: country, destinationType: "popular" })
                }
                className={`w-full p-3 rounded-xl text-left transition-all ${
                  destination === country && destinationType === "popular"
                    ? "bg-yellow-400/20 border-2 border-yellow-400 text-white"
                    : "bg-yellow-400/10 border border-yellow-400/40 text-white hover:bg-yellow-400/20"
                }`}
              >
                {country}
              </button>
            ))}
          </div>
        </div>

        {/* Current selection display */}
        {destination && (
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-yellow-600 border-2 border-yellow-500 text-white px-4 py-2 rounded-xl">
              <FaMapMarkerAlt className="text-yellow-400" />
              <span>{destination}</span>
            </div>
          </div>
        )}

        {/* Country Dropdown */}
        <div className="relative">
          <label className="block text-white font-medium mb-2">Land</label>
          <div className="relative">
            <input
              type="text"
              value={countryInput}
              onChange={(e) => {
                setCountryInput(e.target.value);
                setShowCountryDropdown(true);
              }}
              onFocus={() => setShowCountryDropdown(true)}
              placeholder="Typ een land (bijv. 'Ch' voor China, Chile...)"
              className="w-full px-4 py-3 pr-10 bg-yellow-400/20 border-2 border-yellow-400 rounded-xl text-white placeholder:text-white/70 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30"
            />
            <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50" />
          </div>

          {/* Country Dropdown Results */}
          {showCountryDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-gray-900 border-2 border-gray-700 shadow-2xl rounded-xl max-h-48 overflow-y-auto">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => handleCountrySelect(country)}
                    className="w-full px-4 py-2 text-left text-white hover:bg-gray-800 first:rounded-t-xl last:rounded-b-xl transition-colors"
                  >
                    {country.name}
                  </button>
                ))
              ) : debouncedCountryInput ? (
                <div className="px-4 py-3">
                  <div className="text-gray-300 text-sm mb-2">
                    Geen landen gevonden
                  </div>
                  <button
                    onClick={() => {
                      handleManualEntry(debouncedCountryInput);
                      setShowCountryDropdown(false);
                    }}
                    className="w-full px-3 py-2 bg-yellow-600 border-2 border-yellow-500 rounded-lg text-white hover:bg-yellow-500 transition-colors text-sm font-medium"
                  >
                    Gebruik {debouncedCountryInput} als bestemming
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>


        {/* Worldwide Option */}
        <div className="pt-4 border-t border-white/20">
          <button
            onClick={() =>
              onUpdate({
                destination: "anywhere-world",
                destinationType: "ai-anywhere",
              })
            }
            className={`w-full p-4 rounded-xl transition-all flex items-center justify-center gap-3 ${
              destinationType === "ai-anywhere"
                ? "bg-yellow-400/20 border-2 border-yellow-400 text-white"
                : "bg-yellow-400/20 border-2 border-yellow-400 text-white hover:bg-yellow-400/30"
            }`}
          >
            <span className="text-xl">🌍</span>
            Anywhere in the world – let me decide
          </button>
        </div>

        {errors.destination && (
          <p className="text-red-400 text-sm mt-2">{errors.destination}</p>
        )}
      </div>

      {/* Click outside to close dropdowns */}
      {showCountryDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowCountryDropdown(false);
          }}
        />
      )}
    </div>
  );
}
