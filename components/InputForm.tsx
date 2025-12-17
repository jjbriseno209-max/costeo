
import React, { useState, useEffect } from 'react';
import { UnitType } from '../types';
import { DollarSign, Loader2, AlertCircle, RefreshCw, Calendar, Map, CreditCard, Settings2, Gauge, Tag, PlusCircle, MinusCircle } from 'lucide-react';
import { LocationAutocomplete } from './LocationAutocomplete';
import { DIESEL_PRICE as DEFAULT_DIESEL_PRICE, UNIT_EFFICIENCY } from '../constants';

interface InputFormProps {
  onCalculate: (data: {
    origin: string;
    destination: string;
    hasIntermediatePoint: boolean;
    intermediatePoint: string;
    unitType: UnitType;
    freightPrice: number;
    manualDistance: number;
    isRoundTrip: boolean;
    tolls: number;
    tripDays: number;
    dieselPrice: number;
    fuelEfficiency: number;
    generalRate: number;
  }) => void;
  isLoading: boolean;
  initialValues?: {
    origin: string;
    destination: string;
    hasIntermediatePoint?: boolean;
    intermediatePoint?: string;
    unitType: UnitType;
    freightPrice: number;
    manualDistance: number;
    isRoundTrip: boolean;
    tolls: number;
    tripDays: number;
    dieselPrice: number;
    fuelEfficiency: number;
    generalRate: number;
  };
}

export const InputForm: React.FC<InputFormProps> = ({ onCalculate, isLoading, initialValues }) => {
  const [origin, setOrigin] = useState(initialValues?.origin || '');
  const [destination, setDestination] = useState(initialValues?.destination || '');
  const [hasIntermediatePoint, setHasIntermediatePoint] = useState(initialValues?.hasIntermediatePoint || false);
  const [intermediatePoint, setIntermediatePoint] = useState(initialValues?.intermediatePoint || '');
  const [unitType, setUnitType] = useState<UnitType>(initialValues?.unitType || UnitType.TRAILER);
  
  const [freightPrice, setFreightPrice] = useState<string>(initialValues?.freightPrice ? String(initialValues.freightPrice) : '');
  const [manualDistance, setManualDistance] = useState<string>(initialValues?.manualDistance ? String(initialValues.manualDistance) : '');
  const [isRoundTrip, setIsRoundTrip] = useState<boolean>(initialValues?.isRoundTrip || false);
  const [tolls, setTolls] = useState<string>(initialValues?.tolls ? String(initialValues.tolls) : '');
  const [tripDays, setTripDays] = useState<string>(initialValues?.tripDays ? String(initialValues.tripDays) : '1');
  const [dieselPrice, setDieselPrice] = useState<string>(initialValues?.dieselPrice ? String(initialValues.dieselPrice) : String(DEFAULT_DIESEL_PRICE));
  const [generalRate, setGeneralRate] = useState<string>(initialValues?.generalRate ? String(initialValues.generalRate) : '');
  const [fuelEfficiency, setFuelEfficiency] = useState<string>(
    initialValues?.fuelEfficiency 
        ? String(initialValues.fuelEfficiency) 
        : String(UNIT_EFFICIENCY.TRAILER)
  );

  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (initialValues) {
        setOrigin(initialValues.origin);
        setDestination(initialValues.destination);
        setHasIntermediatePoint(!!initialValues.hasIntermediatePoint);
        setIntermediatePoint(initialValues.intermediatePoint || '');
        setUnitType(initialValues.unitType);
        setFreightPrice(String(initialValues.freightPrice));
        setManualDistance(initialValues.manualDistance ? String(initialValues.manualDistance) : '');
        setIsRoundTrip(initialValues.isRoundTrip);
        setTolls(initialValues.tolls ? String(initialValues.tolls) : '');
        setTripDays(initialValues.tripDays ? String(initialValues.tripDays) : '1');
        setDieselPrice(initialValues.dieselPrice ? String(initialValues.dieselPrice) : String(DEFAULT_DIESEL_PRICE));
        setFuelEfficiency(String(initialValues.fuelEfficiency));
        setGeneralRate(initialValues.generalRate ? String(initialValues.generalRate) : '');
    }
  }, [initialValues]);

  const handleDecimalInput = (value: string, setter: (val: string) => void) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setter(value);
      if (validationError) setValidationError(null);
    }
  };

  const handleUnitChange = (type: UnitType) => {
      setUnitType(type);
      if (type === UnitType.TRAILER) {
          setFuelEfficiency(String(UNIT_EFFICIENCY.TRAILER));
      } else {
          setFuelEfficiency(String(UNIT_EFFICIENCY.TORTON));
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!origin.trim()) {
        setValidationError("Por favor ingresa el origen.");
        return;
    }
    if (hasIntermediatePoint && !intermediatePoint.trim()) {
        setValidationError("Por favor ingresa el punto intermedio.");
        return;
    }
    if (!destination.trim()) {
        setValidationError("Por favor ingresa el destino.");
        return;
    }
    const fPrice = parseFloat(freightPrice);
    if (!freightPrice || isNaN(fPrice) || fPrice <= 0) {
        setValidationError("Por favor ingresa un costo de flete válido.");
        return;
    }
    const eff = parseFloat(fuelEfficiency);
    if (!fuelEfficiency || isNaN(eff) || eff <= 0) {
        setValidationError("Por favor ingresa un rendimiento válido.");
        return;
    }

    onCalculate({
        origin,
        destination,
        hasIntermediatePoint,
        intermediatePoint: hasIntermediatePoint ? intermediatePoint : '',
        unitType,
        freightPrice: fPrice,
        manualDistance: manualDistance ? parseFloat(manualDistance) : 0,
        isRoundTrip,
        tolls: tolls ? parseFloat(tolls) : 0,
        tripDays: tripDays ? parseFloat(tripDays) : 1,
        dieselPrice: dieselPrice ? parseFloat(dieselPrice) : DEFAULT_DIESEL_PRICE,
        fuelEfficiency: eff,
        generalRate: generalRate ? parseFloat(generalRate) : 0
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-5 border border-slate-100 relative z-10">
      <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-2 border-b pb-3">
        <Settings2 className="w-5 h-5 text-blue-600" />
        Configuración del Viaje
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {validationError && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {validationError}
            </div>
        )}

        <div className="space-y-3 relative z-30">
            <LocationAutocomplete
                label="Origen"
                value={origin}
                onChange={(val) => { setOrigin(val); if(validationError) setValidationError(null); }}
                iconColorClass="text-slate-400"
                placeholder="Ej. Monterrey, NL"
            />
            
            <div className="flex items-center px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                        type="checkbox" 
                        checked={hasIntermediatePoint}
                        onChange={(e) => setHasIntermediatePoint(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span className="text-xs font-bold text-slate-600 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                        {hasIntermediatePoint ? 'Quitar punto intermedio' : 'Agregar punto intermedio'}
                    </span>
                </label>
            </div>

            {hasIntermediatePoint && (
                <div className="animate-in slide-in-from-top-2 duration-200">
                    <LocationAutocomplete
                        label="Punto Intermedio"
                        value={intermediatePoint}
                        onChange={(val) => { setIntermediatePoint(val); if(validationError) setValidationError(null); }}
                        iconColorClass="text-amber-500"
                        placeholder="Ej. San Luis Potosí, SLP"
                    />
                </div>
            )}

            <LocationAutocomplete
                label="Destino"
                value={destination}
                onChange={(val) => { setDestination(val); if(validationError) setValidationError(null); }}
                iconColorClass="text-red-400"
                placeholder="Ej. CDMX"
            />
        </div>

        <div className="grid grid-cols-2 gap-4 relative z-0">
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Unidad</label>
                <div className="flex rounded-md shadow-sm" role="group">
                    <button
                        type="button"
                        onClick={() => handleUnitChange(UnitType.TRAILER)}
                        className={`px-3 py-2 text-sm font-medium border rounded-l-lg flex-1 ${
                            unitType === UnitType.TRAILER 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                        Trailer
                    </button>
                    <button
                        type="button"
                        onClick={() => handleUnitChange(UnitType.TORTON)}
                        className={`px-3 py-2 text-sm font-medium border rounded-r-lg flex-1 ${
                            unitType === UnitType.TORTON 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                        Torton
                    </button>
                </div>
            </div>
            
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Formato</label>
                <button
                    type="button"
                    onClick={() => setIsRoundTrip(!isRoundTrip)}
                    className={`w-full px-3 py-2 text-sm font-medium border rounded-lg flex items-center justify-center gap-2 transition-colors ${
                        isRoundTrip 
                        ? 'bg-indigo-600 text-white border-indigo-600' 
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                >
                    <RefreshCw className={`w-4 h-4 ${isRoundTrip ? 'rotate-180' : ''} transition-transform`} />
                    {isRoundTrip ? 'Redondo' : 'Sencillo'}
                </button>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-3 relative z-0">
             <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Rendimiento</label>
                <div className="relative group">
                    <div className="absolute left-2.5 top-2.5 z-10">
                        <Gauge className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        inputMode="decimal"
                        value={fuelEfficiency}
                        onChange={(e) => handleDecimalInput(e.target.value, setFuelEfficiency)}
                        className="w-full pl-8 pr-2 py-2 text-sm text-slate-900 font-medium border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none relative z-0 bg-transparent"
                    />
                     <div className="absolute right-2 top-2.5 text-[10px] text-slate-400 font-bold pointer-events-none">KM/L</div>
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">KM (Manual)</label>
                <div className="relative group">
                    <div className="absolute left-2.5 top-2.5 z-10">
                        <Map className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        inputMode="decimal"
                        value={manualDistance}
                        onChange={(e) => handleDecimalInput(e.target.value, setManualDistance)}
                        placeholder="Auto"
                        className="w-full pl-8 pr-2 py-2 text-sm text-slate-900 font-medium border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none relative z-0 bg-transparent"
                    />
                </div>
            </div>
            
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Días Viaje</label>
                <div className="relative group">
                    <div className="absolute left-2.5 top-2.5 z-10">
                        <Calendar className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        inputMode="numeric"
                        value={tripDays}
                        onChange={(e) => handleDecimalInput(e.target.value, setTripDays)}
                        className="w-full pl-8 pr-2 py-2 text-sm text-slate-900 font-medium border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none relative z-0 bg-transparent"
                    />
                </div>
            </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg space-y-3 border border-slate-200 relative z-0">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Costos Operativos</h3>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs text-slate-600 mb-1">Flete ($)</label>
                    <div className="relative">
                         <div className="absolute left-3 top-2 z-10 pointer-events-none">
                            <DollarSign className="w-4 h-4 text-green-600" />
                        </div>
                        <input
                            type="text"
                            inputMode="decimal"
                            value={freightPrice}
                            onChange={(e) => handleDecimalInput(e.target.value, setFreightPrice)}
                            className="w-full pl-8 pr-3 py-1.5 text-sm text-slate-900 font-medium border border-slate-300 rounded bg-white focus:ring-1 focus:ring-green-500 outline-none"
                            placeholder="0.00"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs text-slate-600 mb-1">Casetas ($)</label>
                    <div className="relative">
                        <div className="absolute left-3 top-2 z-10 pointer-events-none">
                            <CreditCard className="w-4 h-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            inputMode="decimal"
                            value={tolls}
                            onChange={(e) => handleDecimalInput(e.target.value, setTolls)}
                            className="w-full pl-8 pr-3 py-1.5 text-sm text-slate-900 font-medium border border-slate-300 rounded bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                            placeholder="0.00"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">$$ Diesel x Litro</label>
                    <input
                        type="text"
                        inputMode="decimal"
                        value={dieselPrice}
                        onChange={(e) => handleDecimalInput(e.target.value, setDieselPrice)}
                        className="w-full px-3 py-1.5 text-sm text-slate-900 font-medium border border-slate-300 rounded bg-white focus:ring-1 focus:ring-amber-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tarifa General ($)</label>
                    <div className="relative">
                        <div className="absolute left-3 top-2 z-10 pointer-events-none">
                            <Tag className="w-4 h-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            inputMode="decimal"
                            value={generalRate}
                            onChange={(e) => handleDecimalInput(e.target.value, setGeneralRate)}
                            className="w-full pl-8 pr-3 py-1.5 text-sm text-slate-900 font-medium border border-slate-300 rounded bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                            placeholder="0.00"
                        />
                    </div>
                </div>
            </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Calculando...
            </>
          ) : (
            'Calcular Costos'
          )}
        </button>
      </form>
    </div>
  );
};
