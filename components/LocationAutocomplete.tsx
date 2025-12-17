import React, { useState, useRef, useEffect } from 'react';
import { MEXICO_LOCATIONS } from '../data/mexicoLocations';
import { Check, ChevronDown, MapPin, Plus } from 'lucide-react';

interface LocationAutocompleteProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  iconColorClass: string;
  placeholder: string;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  label,
  value,
  onChange,
  iconColorClass,
  placeholder
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Update query when value prop changes externally (e.g. clear form)
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // Normalize text: remove accents, lowercase, remove punctuation for flexible matching
  const normalizeText = (text: string) => {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ""); // Keep spaces/numbers, remove other chars like commas
  };

  const filterLocations = (userInput: string) => {
    if (!userInput) return [];
    
    const normalizedInput = normalizeText(userInput);
    
    // Split input by comma to handle abbreviations like "Monterrey, NL"
    const commaParts = userInput.split(',');
    const partBeforeComma = commaParts.length > 1 ? normalizeText(commaParts[0]) : null;

    return MEXICO_LOCATIONS.filter(loc => {
        const normalizedLoc = normalizeText(loc);
        
        // 1. Direct match
        if (normalizedLoc.includes(normalizedInput)) return true;

        // 2. Match part before comma (e.g. "Monterrey" from "Monterrey, NL")
        if (partBeforeComma && partBeforeComma.length > 2 && normalizedLoc.includes(partBeforeComma)) {
            return true;
        }

        return false;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const userInput = e.target.value;
    setQuery(userInput);
    onChange(userInput);

    if (userInput.length > 0) {
      const filtered = filterLocations(userInput);
      setFilteredLocations(filtered.slice(0, 100));
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleSelect = (location: string) => {
    setQuery(location);
    onChange(location);
    setIsOpen(false);
  };

  const handleFocus = () => {
    if (query.length === 0) {
        setFilteredLocations(MEXICO_LOCATIONS.slice(0, 20)); 
        setIsOpen(true);
    } else {
        const filtered = filterLocations(query);
        setFilteredLocations(filtered.slice(0, 100));
        setIsOpen(true);
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-sm font-bold text-slate-700 mb-1">{label}</label>
      <div className="relative">
        <MapPin className={`absolute left-3 top-3 w-5 h-5 ${iconColorClass} z-10 pointer-events-none`} />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-slate-900 font-medium placeholder-slate-400"
          autoComplete="off"
        />
        <ChevronDown 
            className={`absolute right-3 top-3 w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''} cursor-pointer`} 
            onClick={() => {
                if(!isOpen) handleFocus();
                else setIsOpen(false);
            }}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {filteredLocations.length > 0 ? (
            filteredLocations.map((loc, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelect(loc)}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm text-slate-700 flex items-center justify-between group transition-colors border-b border-slate-50 last:border-0"
              >
                <span>{loc}</span>
                {value === loc && <Check className="w-4 h-4 text-blue-600" />}
              </button>
            ))
          ) : query.length > 0 ? (
            <div className="p-1">
                <button
                    type="button"
                    onClick={() => handleSelect(query)}
                    className="w-full text-left px-4 py-3 bg-red-50 hover:bg-red-100 text-sm font-bold text-red-700 rounded-md flex items-center gap-3 transition-colors"
                >
                    <div className="p-1.5 bg-red-200 rounded-full">
                        <Plus className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                        <span>No se encontró "{query}"</span>
                        <span className="text-[10px] uppercase tracking-wider opacity-70">Haz clic aquí para usar este origen/destino</span>
                    </div>
                </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};