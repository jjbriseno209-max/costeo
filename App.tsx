
import React, { useState, useEffect } from 'react';
import { UnitType, CalculationResult, CostBreakdown, RouteInfo, SavedCalculation } from './types';
import { getRouteData } from './services/geminiService';
import { InputForm } from './components/InputForm';
import { ResultsCard } from './components/ResultsCard';
import { HistoryModal } from './components/HistoryModal';
import { SaveModal } from './components/SaveModal';
import { UNIT_EFFICIENCY, ADMIN_PERCENTAGE, BONUS_FACTOR } from './constants';
import { Map, AlertCircle, History } from 'lucide-react';

const STORAGE_KEY = 'costeador_last_result';
const HISTORY_KEY = 'costeador_history';

const App: React.FC = () => {
  const [result, setResult] = useState<CalculationResult | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [history, setHistory] = useState<SavedCalculation[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const handleInitiateSave = () => {
      if (!result) return;
      setIsSaveModalOpen(true);
  };

  const handleConfirmSave = (observations: string, user: string) => {
    if (!result) return;
    
    const newSave: SavedCalculation = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        name: `${result.inputs.origin}${result.inputs.hasIntermediatePoint ? ' (via ' + result.inputs.intermediatePoint + ')' : ''} - ${result.inputs.destination}`,
        result: result,
        observations: observations.trim() || undefined,
        user: user.trim() || undefined
    };

    setHistory(prev => [newSave, ...prev]);
    setIsSaveModalOpen(false);
  };

  const handleDeleteHistoryItem = (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta cotización?")) {
        setHistory(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleLoadHistoryItem = (item: SavedCalculation) => {
    setResult(item.result);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(item.result));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const calculateCosts = async (data: {
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
  }) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let routeInfo: RouteInfo = {
        distanceKm: 0,
        duration: "N/A",
        summary: "Cálculo manual",
        mapUrl: "",
      };

      if (!data.manualDistance) {
        try {
            const fetchedRoute = await getRouteData(
                data.origin, 
                data.destination, 
                data.hasIntermediatePoint ? data.intermediatePoint : undefined
            );
            routeInfo = { ...fetchedRoute };
        } catch (e) {
            console.warn("Could not fetch automatic route, asking user for manual input.");
            throw new Error("No se pudo obtener la ruta automática. Por favor ingrese los KM manualmente.");
        }
      } else {
        routeInfo.distanceKm = data.manualDistance;
        routeInfo.summary = `Distancia manual: ${data.manualDistance} km`;
      }

      const baseKm = routeInfo.distanceKm;
      const effectiveKm = data.isRoundTrip ? baseKm * 2 : baseKm;
      
      if (effectiveKm <= 0) {
        throw new Error("La distancia es 0. Por favor verifica el origen/destino o ingresa KM manuales.");
      }

      const effectiveTolls = data.isRoundTrip ? data.tolls * 2 : data.tolls;
      const efficiency = data.fuelEfficiency || (data.unitType === UnitType.TRAILER ? UNIT_EFFICIENCY.TRAILER : UNIT_EFFICIENCY.TORTON);
      
      const litersConsumed = effectiveKm / efficiency;
      const dieselCost = litersConsumed * data.dieselPrice;
      
      const salaryBase = Math.max(0, data.freightPrice - dieselCost);
      const operatorSalary = salaryBase * 0.20;
      const operatorBonus = BONUS_FACTOR * effectiveKm;
      const adminCost = data.freightPrice * ADMIN_PERCENTAGE;
      const totalExpenses = adminCost + operatorBonus + operatorSalary + effectiveTolls + dieselCost;
      
      const profit = data.freightPrice - totalExpenses;
      const profitPerKm = effectiveKm > 0 ? profit / effectiveKm : 0;

      const breakdown: CostBreakdown = {
        dieselCost,
        tollsCost: effectiveTolls,
        operatorSalary,
        operatorBonus,
        adminCost,
        totalExpenses,
        profit,
        profitPerKm,
        litersConsumed
      };

      const finalResult: CalculationResult = {
        route: {
            ...routeInfo,
            distanceKm: effectiveKm
        },
        costs: breakdown,
        inputs: data
      };

      setResult(finalResult);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalResult));

    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado al calcular.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto w-full">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
               <div className="flex flex-col leading-none font-black text-center tracking-tighter">
                  <span className="text-[10px] text-red-600 uppercase">Grupo</span>
                  <span className="text-xl text-slate-900 uppercase">Castores</span>
               </div>
            </div>
            <div className="h-10 w-[2px] bg-slate-200 hidden md:block"></div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                COSTEOS
                <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">*</span>
              </h1>
              <p className="text-slate-500 font-medium text-sm">DIRECCION COMERCIAL COMPLETOS</p>
            </div>
          </div>
          
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 px-6 rounded-xl border border-slate-200 shadow-sm transition-all active:scale-95"
          >
            <History className="w-5 h-5 text-red-600" />
            Historial
          </button>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <InputForm onCalculate={calculateCosts} isLoading={loading} initialValues={result?.inputs} />
          </div>

          <div className="lg:col-span-8 space-y-6">
            {loading ? (
              <div className="bg-white rounded-3xl shadow-xl p-12 flex flex-col items-center justify-center border border-slate-100">
                <div className="w-16 h-16 border-4 border-red-100 border-t-red-600 rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-bold text-slate-800">Analizando ruta Castores...</h3>
                <p className="text-slate-500 mt-2">Calculando distancia y rendimiento de combustible.</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-2xl flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <h3 className="text-red-800 font-bold">Error en el cálculo</h3>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
              </div>
            ) : result ? (
              <ResultsCard result={result} onSave={handleInitiateSave} />
            ) : (
              <div className="bg-white rounded-3xl shadow-sm border-2 border-dashed border-slate-200 p-12 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <Map className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest">Nueva Cotización</h3>
                <p className="text-slate-400 max-w-xs mt-2 font-medium">Capture los datos de origen y destino para iniciar el desglose operativo.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      <HistoryModal 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        history={history}
        onLoad={handleLoadHistoryItem}
        onDelete={handleDeleteHistoryItem}
      />

      <SaveModal 
        isOpen={isSaveModalOpen} 
        onClose={() => setIsSaveModalOpen(false)} 
        onConfirm={handleConfirmSave}
      />
    </div>
  );
};

export default App;
