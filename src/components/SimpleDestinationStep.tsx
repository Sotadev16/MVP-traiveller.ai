import { useState } from 'react';
import { FaMapMarkerAlt, FaChevronDown } from 'react-icons/fa';
import { useDebounce } from '@/hooks/useDebounce';
import { filterCountries, ALL_COUNTRIES, type Country } from '@/utils/countries';
import { filterCities, type City } from '@/utils/cities';

interface SimpleDestinationStepProps {
  destination: string;
  destinationType: "popular" | "worldwide" | "custom" | "ai-anywhere" | "ai-decide" | "country" | "city" | "manual" | "";
  onUpdate: (updates: {
    destination?: string;
    destinationType?: "popular" | "worldwide" | "custom" | "ai-anywhere" | "ai-decide" | "country" | "city" | "manual" | "";
  }) => void;
  errors?: { destination?: string };
}

export default function SimpleDestinationStep({
  destination,
  destinationType,
  onUpdate,
  errors = {}
}: SimpleDestinationStepProps) {
  const [countryInput, setCountryInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // 300ms debounce as specified
  const debouncedCountryInput = useDebounce(countryInput, 300);
  const debouncedCityInput = useDebounce(cityInput, 300);

  const filteredCountries = debouncedCountryInput ? filterCountries(debouncedCountryInput) : ALL_COUNTRIES.slice(0, 10);
  const filteredCities = debouncedCityInput ? filterCities(debouncedCityInput) : [];

  const handleCountrySelect = (country: Country) => {
    setCountryInput(country.name);
    onUpdate({
      destination: country.name,
      destinationType: 'country'
    });
    setShowCountryDropdown(false);
  };

  const handleCitySelect = (city: City) => {
    const countryName = ALL_COUNTRIES.find(c => c.code === city.countryCode)?.name || city.countryCode;
    const fullDestination = `${city.city}, ${countryName}`;
    setCityInput(fullDestination);
    onUpdate({
      destination: fullDestination,
      destinationType: 'city'
    });
    setShowCityDropdown(false);
  };

  const handleManualEntry = (input: string) => {
    if (input.trim()) {
      onUpdate({
        destination: input.trim(),
        destinationType: 'manual'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
          Waar wil je naartoe?
        </h2>
        <p className="text-white drop-shadow-sm">
          Zoek een land of stad
        </p>
      </div>

      <div className="max-w-lg mx-auto space-y-4">
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
          <label className="block text-white font-medium mb-2">
            Land
          </label>
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
                  <div className="text-gray-300 text-sm mb-2">Geen landen gevonden</div>
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

        {/* City Dropdown */}
        <div className="relative">
          <label className="block text-white font-medium mb-2">
            Stad
          </label>
          <div className="relative">
            <input
              type="text"
              value={cityInput}
              onChange={(e) => {
                setCityInput(e.target.value);
                setShowCityDropdown(true);
              }}
              onFocus={() => setShowCityDropdown(true)}
              placeholder="Typ een stad (minimaal 2 karakters...)"
              className="w-full px-4 py-3 pr-10 bg-yellow-400/20 border-2 border-yellow-400 rounded-xl text-white placeholder:text-white/70 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30"
            />
            <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50" />
          </div>

          {/* City Dropdown Results */}
          {showCityDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-gray-900 border-2 border-gray-700 shadow-2xl rounded-xl max-h-48 overflow-y-auto">
              {filteredCities.length > 0 ? (
                filteredCities.map((city, index) => {
                  const countryName = ALL_COUNTRIES.find(c => c.code === city.countryCode)?.name || city.countryCode;
                  return (
                    <button
                      key={`${city.city}-${city.countryCode}-${index}`}
                      onClick={() => handleCitySelect(city)}
                      className="w-full px-4 py-2 text-left text-white hover:bg-gray-800 first:rounded-t-xl last:rounded-b-xl transition-colors"
                    >
                      <div className="font-medium">{city.city}</div>
                      <div className="text-xs text-gray-300">{countryName}</div>
                    </button>
                  );
                })
              ) : debouncedCityInput && debouncedCityInput.length >= 2 ? (
                <div className="px-4 py-3">
                  <div className="text-gray-300 text-sm mb-2">Geen steden gevonden</div>
                  <button
                    onClick={() => {
                      handleManualEntry(debouncedCityInput);
                      setShowCityDropdown(false);
                    }}
                    className="w-full px-3 py-2 bg-yellow-600 border-2 border-yellow-500 rounded-lg text-white hover:bg-yellow-500 transition-colors text-sm font-medium"
                  >
                    Gebruik {debouncedCityInput} als bestemming
                  </button>
                </div>
              ) : debouncedCityInput && debouncedCityInput.length < 2 ? (
                <div className="px-4 py-2 text-gray-300 text-sm">
                  Typ minimaal 2 karakters
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Special AI Options */}
        <div className="space-y-3 pt-4 border-t border-white/20">
          <div className="text-center text-white/60 text-sm mb-3">of laat AI je bestemming kiezen</div>

          <button
            onClick={() => onUpdate({ destination: 'anywhere-world', destinationType: 'ai-anywhere' })}
            className={`w-full p-4 rounded-xl transition-all flex items-center justify-center gap-3 ${
              destinationType === 'ai-anywhere'
                ? 'bg-yellow-400/20 border-2 border-yellow-400 text-white'
                : 'bg-yellow-400/20 border-2 border-yellow-400 text-white hover:bg-yellow-400/30'
            }`}
          >
            <span className="text-xl">🌍</span>
            Anywhere in the world – let me decide
          </button>

          <button
            onClick={() => onUpdate({ destination: 'ai-decide', destinationType: 'ai-decide' })}
            className={`w-full p-4 rounded-xl transition-all flex items-center justify-center gap-3 ${
              destinationType === 'ai-decide'
                ? 'bg-yellow-400/20 border-2 border-yellow-400 text-white'
                : 'bg-yellow-400/20 border-2 border-yellow-400 text-white hover:bg-yellow-400/30'
            }`}
          >
            <span className="text-xl">🤖</span>
            A.I decide
          </button>
        </div>

        {errors.destination && (
          <p className="text-red-400 text-sm mt-2">{errors.destination}</p>
        )}
      </div>

      {/* Click outside to close dropdowns */}
      {(showCountryDropdown || showCityDropdown) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowCountryDropdown(false);
            setShowCityDropdown(false);
          }}
        />
      )}
    </div>
  );
}