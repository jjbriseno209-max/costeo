
import React from 'react';
import { CalculationResult, UnitType } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ExternalLink, Navigation, Fuel, User, Building, Award, CreditCard, Wallet, Calendar, ArrowRightLeft, ArrowRight, TrendingUp, DollarSign, MapPin, Share2, Save, Tag, TrendingDown, Map as MapIcon } from 'lucide-react';

interface ResultsCardProps {
  result: CalculationResult;
  onSave: () => void;
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);
};

const formatPercent = (part: number, total: number) => {
  if (total === 0) return '0%';
  return ((part / total) * 100).toFixed(1) + '%';
};

export const ResultsCard: React.FC<ResultsCardProps> = ({ result, onSave }) => {
  const { costs, route, inputs } = result;

  const chartData = [
    { name: 'Combustible', value: costs.dieselCost, color: '#f59e0b' },
    { name: 'Sueldo Op.', value: costs.operatorSalary, color: '#3b82f6' },
    { name: 'Bono Op.', value: costs.operatorBonus, color: '#06b6d4' },
    { name: 'Administración', value: costs.adminCost, color: '#8b5cf6' },
    { name: 'Casetas', value: costs.tollsCost, color: '#64748b' },
  ];

  const ratePerKm = route.distanceKm > 0 ? inputs.freightPrice / route.distanceKm : 0;
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(inputs.origin)}${inputs.hasIntermediatePoint ? '&waypoints=' + encodeURIComponent(inputs.intermediatePoint || '') : ''}&destination=${encodeURIComponent(inputs.destination)}`;

  const percentDiff = inputs.generalRate > 0 
    ? ((inputs.freightPrice / inputs.generalRate) - 1) * 100 
    : 0;

  const getSemaphore = (val: number) => {
    if (val > 12) {
        return { 
            color: 'text-emerald-600', 
            bg: 'bg-emerald-50', 
            border: 'border-emerald-200',
            label: 'Óptimo',
            dot: 'bg-emerald-500'
        };
    }
    if (val >= 10) {
        return { 
            color: 'text-yellow-600', 
            bg: 'bg-yellow-50', 
            border: 'border-yellow-200',
            label: 'Regular',
            dot: 'bg-yellow-500'
        };
    }
    return { 
        color: 'text-red-600', 
        bg: 'bg-red-50', 
        border: 'border-red-200',
        label: 'Bajo',
        dot: 'bg-red-500'
    };
  };

  const semaphore = getSemaphore(costs.profitPerKm);

  const handleShare = () => {
    const routeText = inputs.hasIntermediatePoint 
      ? `${inputs.origin} ➡️ ${inputs.intermediatePoint} ➡️ ${inputs.destination}`
      : `${inputs.origin} ➡️ ${inputs.destination}`;

    const diffText = inputs.generalRate > 0 
      ? `\n📊 *VS Tarifa Gral:* ${percentDiff > 0 ? '+' : ''}${percentDiff.toFixed(1)}% (${percentDiff > 0 ? 'sobre' : 'bajo'} el mercado)`
      : '';

    const text = `🚛 *Cotización de Flete* \n\n` +
        `📍 *Ruta:* ${routeText}\n` +
        `🚛 *Unidad:* ${inputs.unitType} (${inputs.isRoundTrip ? 'Redondo' : 'Sencillo'})\n\n` +
        `💰 *Flete:* ${formatCurrency(inputs.freightPrice)}\n` +
        (inputs.generalRate > 0 ? `🏷️ *Tarifa General:* ${formatCurrency(inputs.generalRate)}${diffText}\n` : '') +
        `✅ *Utilidad:* ${formatCurrency(costs.profit)} (${((costs.profit / inputs.freightPrice) * 100).toFixed(1)}%)\n` +
        `📊 *Utilidad/Km:* ${formatCurrency(costs.profitPerKm)}\n\n` +
        `⛽ *Gastos Totales:* ${formatCurrency(costs.totalExpenses)}\n` +
        `📏 *Distancia:* ${route.distanceKm.toLocaleString()} km\n` +
        `⛽ *Rendimiento:* ${inputs.fuelEfficiency} km/l\n\n` +
        `_Generado por Costeador de Fletes Pro_`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER CARD */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-l-8 border-slate-800 flex flex-col md:flex-row justify-between gap-4">
        <div>
           <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${inputs.unitType === UnitType.TRAILER ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                    {inputs.unitType}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${inputs.isRoundTrip ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                    {inputs.isRoundTrip ? 'Redondo' : 'Sencillo'}
                </span>
           </div>
           
           <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-slate-900">
                    <span className="font-bold text-lg">{inputs.origin}</span>
                </div>
                {inputs.hasIntermediatePoint && (
                    <div className="flex items-center gap-2 text-slate-500 pl-4 py-1 border-l-2 border-dashed border-slate-200 ml-1.5">
                        <MapIcon className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-semibold italic">vía {inputs.intermediatePoint}</span>
                    </div>
                )}
                <div className="flex items-center gap-2 text-slate-900">
                    {inputs.isRoundTrip ? <ArrowRightLeft className="w-5 h-5 text-slate-400" /> : <ArrowRight className="w-5 h-5 text-slate-400" />}
                    <span className="font-bold text-lg">{inputs.destination}</span>
                </div>
           </div>

           <p className="text-slate-500 text-sm mt-3 mb-4">
              {route.distanceKm.toLocaleString()} km totales • {inputs.tripDays} día(s)
           </p>
           
           <div className="flex flex-wrap gap-3">
             <a 
               href={mapsUrl} 
               target="_blank" 
               rel="noopener noreferrer"
               className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors bg-blue-50 px-3 py-2 rounded-lg"
             >
               <ExternalLink className="w-4 h-4" />
               Ver ruta en Maps
             </a>
             
             <button
               onClick={handleShare}
               className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:text-green-800 bg-green-100 hover:bg-green-200 px-3 py-2 rounded-lg transition-colors"
             >
               <Share2 className="w-4 h-4" />
               Compartir
             </button>

             <button
               onClick={onSave}
               className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors"
             >
               <Save className="w-4 h-4" />
               Guardar
             </button>
           </div>
        </div>
        <div className="text-right mt-4 md:mt-0 flex flex-col items-end gap-2">
             <div className="flex flex-col items-end">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Ingreso (Flete)</div>
                <div className="text-4xl font-black text-green-700 leading-none">{formatCurrency(inputs.freightPrice)}</div>
             </div>

             {inputs.generalRate > 0 && (
                <div className="flex flex-col items-end pt-2 border-t border-slate-100 w-full max-w-[140px]">
                    <div className="flex items-center gap-1 text-slate-500">
                        <span className="text-[9px] font-bold uppercase tracking-tight">Tarifa General</span>
                        <span className="text-xs font-bold text-slate-700">{formatCurrency(inputs.generalRate)}</span>
                    </div>
                    <div className={`text-[9px] font-bold px-1.5 rounded-full flex items-center gap-0.5 mt-0.5 ${percentDiff >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                        {percentDiff >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                        {Math.abs(percentDiff).toFixed(1)}%
                    </div>
                </div>
             )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* EXPENSE LIST */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100">
          <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-slate-500" />
                Desglose de Gastos
            </h3>
          </div>
          
          <div className="divide-y divide-slate-100">
            <div className="flex justify-between items-center px-6 py-3 hover:bg-amber-50/30 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-amber-100 rounded text-amber-600"><Fuel className="w-4 h-4"/></div>
                    <div>
                        <div className="text-sm font-semibold text-slate-700">Combustible</div>
                        <div className="text-xs text-slate-500">
                            {costs.litersConsumed.toFixed(0)} Lts ({inputs.fuelEfficiency} km/l) x {formatCurrency(inputs.dieselPrice)}
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="font-bold text-slate-700">{formatCurrency(costs.dieselCost)}</div>
                    <div className="text-xs text-slate-400">{formatPercent(costs.dieselCost, inputs.freightPrice)}</div>
                </div>
            </div>

            <div className="flex justify-between items-center px-6 py-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-slate-200 rounded text-slate-600"><CreditCard className="w-4 h-4"/></div>
                    <div>
                        <div className="text-sm font-semibold text-slate-700">Casetas</div>
                        <div className="text-xs text-slate-500">{inputs.isRoundTrip ? '(Ida y Vuelta)' : '(Solo Ida)'}</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="font-bold text-slate-700">{formatCurrency(costs.tollsCost)}</div>
                    <div className="text-xs text-slate-400">{formatPercent(costs.tollsCost, inputs.freightPrice)}</div>
                </div>
            </div>

            <div className="flex justify-between items-center px-6 py-3 hover:bg-blue-50/30 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-blue-100 rounded text-blue-600"><User className="w-4 h-4"/></div>
                    <div>
                        <div className="text-sm font-semibold text-slate-700">Sueldo Operador</div>
                        <div className="text-xs text-slate-500">20% (Flete - Diesel)</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="font-bold text-slate-700">{formatCurrency(costs.operatorSalary)}</div>
                    <div className="text-xs text-slate-400">{formatPercent(costs.operatorSalary, inputs.freightPrice)}</div>
                </div>
            </div>

            <div className="flex justify-between items-center px-6 py-3 hover:bg-cyan-50/30 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-cyan-100 rounded text-cyan-600"><Award className="w-4 h-4"/></div>
                    <div>
                        <div className="text-sm font-semibold text-slate-700">Bono Operador</div>
                        <div className="text-xs text-slate-500">0.24 x KM</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="font-bold text-slate-700">{formatCurrency(costs.operatorBonus)}</div>
                    <div className="text-xs text-slate-400">{formatPercent(costs.operatorBonus, inputs.freightPrice)}</div>
                </div>
            </div>

            <div className="flex justify-between items-center px-6 py-3 hover:bg-purple-50/30 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-purple-100 rounded text-purple-600"><Building className="w-4 h-4"/></div>
                    <div>
                        <div className="text-sm font-semibold text-slate-700">Administración</div>
                        <div className="text-xs text-slate-500">12% Flete</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="font-bold text-slate-700">{formatCurrency(costs.adminCost)}</div>
                    <div className="text-xs text-slate-400">{formatPercent(costs.adminCost, inputs.freightPrice)}</div>
                </div>
            </div>
          </div>
            
            <div className="bg-red-50 px-6 py-4 border-t border-red-100 flex justify-between items-center">
                <span className="text-red-800 font-bold uppercase text-sm">Total Gastos</span>
                <span className="text-xl font-extrabold text-red-700">{formatCurrency(costs.totalExpenses)}</span>
            </div>
        </div>

        {/* PROFIT & KPI SECTION */}
        <div className="flex flex-col gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-center items-center text-center border-t-4 border-green-500">
                <h3 className="text-slate-500 font-semibold uppercase tracking-wider text-sm mb-2">Utilidad Bruta</h3>
                <div className={`text-5xl font-extrabold mb-2 ${costs.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(costs.profit)}
                </div>
                <div className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full text-sm text-slate-700 font-medium">
                    Margen: <span className="font-bold text-slate-900">{((costs.profit / inputs.freightPrice) * 100).toFixed(1)}%</span>
                </div>
            </div>

            {/* KPI GRID */}
            <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl shadow border ${semaphore.border} ${semaphore.bg} text-center relative flex flex-col justify-center`}>
                    <div className="text-xs text-slate-500 uppercase font-bold mb-1 flex items-center justify-center gap-1">
                        Utilidad / KM
                    </div>
                    <div className={`text-2xl font-bold ${semaphore.color}`}>{formatCurrency(costs.profitPerKm)}</div>
                    <div className={`inline-block mx-auto mt-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide border ${semaphore.border} bg-white/50 ${semaphore.color}`}>
                        {semaphore.label}
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow border border-slate-100 text-center flex flex-col justify-center">
                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">Utilidad / Día</div>
                    <div className="text-2xl font-bold text-slate-800">
                        {formatCurrency(costs.profit / inputs.tripDays)}
                    </div>
                </div>

                <div className="col-span-2 bg-white p-4 rounded-xl shadow border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                         <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                            <TrendingUp className="w-5 h-5" />
                         </div>
                         <div className="flex flex-col">
                            <span className="text-xs text-slate-500 uppercase font-bold leading-none mb-1">Cuota / KM</span>
                            <span className="text-lg font-bold text-slate-700">{formatCurrency(ratePerKm)}</span>
                         </div>
                    </div>
                </div>
            </div>

            {/* CHART */}
            <div className="bg-white rounded-xl shadow-lg p-4 flex-1 min-h-[180px] flex flex-col">
                 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Distribución de Costos</h4>
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={55}
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: number) => formatCurrency(value)} 
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};
