
import React, { useState, useMemo } from 'react';
import { SavedCalculation, UnitType } from '../types';
import { X, Trash2, ArrowRight, Calendar, MapPin, DollarSign, Clock, MessageSquare, Search, User } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: SavedCalculation[];
  onLoad: (item: SavedCalculation) => void;
  onDelete: (id: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ 
  isOpen, 
  onClose, 
  history, 
  onLoad, 
  onDelete 
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const query = searchQuery.toLowerCase();
    return history.filter(item => {
      const origin = item.result.inputs.origin.toLowerCase();
      const destination = item.result.inputs.destination.toLowerCase();
      const observations = (item.observations || '').toLowerCase();
      const user = (item.user || '').toLowerCase();
      return origin.includes(query) || destination.includes(query) || observations.includes(query) || user.includes(query);
    });
  }, [history, searchQuery]);

  if (!isOpen) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(val);
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('es-MX', { 
        day: '2-digit', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex flex-col p-5 border-b border-slate-100 bg-white rounded-t-2xl sticky top-0 z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-blue-600" />
                  Historial de Cotizaciones
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {history.length} cotización(es) guardada(s)
                </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por origen, destino, observaciones o usuario..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto p-5 space-y-4 flex-1 bg-slate-50/50">
            {history.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No hay cotizaciones guardadas aún.</p>
                </div>
            ) : filteredHistory.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                    <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No se encontraron resultados para "{searchQuery}"</p>
                </div>
            ) : (
                filteredHistory.map((item) => (
                    <div 
                        key={item.id} 
                        className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between group"
                    >
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(item.timestamp)}
                                </span>
                                {item.user && (
                                    <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        {item.user}
                                    </span>
                                )}
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${item.result.inputs.unitType === UnitType.TRAILER ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                    {item.result.inputs.unitType}
                                </span>
                            </div>
                            
                            <h3 className="font-bold text-slate-800 text-base truncate flex items-center gap-1">
                                {item.result.inputs.origin} 
                                <ArrowRight className="w-4 h-4 text-slate-300" /> 
                                {item.result.inputs.destination}
                            </h3>
                            
                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                                <span className="flex items-center gap-1">
                                    <DollarSign className="w-3.5 h-3.5 text-green-600" />
                                    <span className="font-semibold">{formatCurrency(item.result.inputs.freightPrice)}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                    {item.result.route.distanceKm.toLocaleString()} km
                                </span>
                            </div>

                            {/* Observations Display */}
                            {item.observations && (
                                <div className="mt-3 text-xs text-slate-500 bg-slate-50 p-2 rounded-md border border-slate-100 italic flex gap-2 items-start">
                                    <MessageSquare className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-slate-400" />
                                    <span className="line-clamp-2">{item.observations}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-slate-100">
                            <button
                                onClick={() => { onLoad(item); onClose(); }}
                                className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                            >
                                Cargar
                            </button>
                            <button
                                onClick={() => onDelete(item.id)}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Eliminar"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white rounded-b-2xl">
            <button 
                onClick={onClose}
                className="w-full py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
            >
                Cerrar
            </button>
        </div>
      </div>
    </div>
  );
};
