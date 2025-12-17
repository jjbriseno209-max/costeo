
import React, { useState } from 'react';
import { X, Save, MessageSquare, User } from 'lucide-react';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (observations: string, user: string) => void;
}

export const SaveModal: React.FC<SaveModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [observations, setObservations] = useState('');
  const [user, setUser] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(observations, user);
    setObservations(''); 
    setUser('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Save className="w-5 h-5 text-blue-600" />
                Guardar Cotización
            </h3>
            <button 
                onClick={onClose} 
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-full transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                    Observaciones (Opcional)
                </label>
                <textarea
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    placeholder="Ej. Cliente: Empresa Logística, entregar antes de las 5pm..."
                    className="w-full h-24 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-slate-700 text-sm bg-slate-50 focus:bg-white transition-colors"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    Usuario
                </label>
                <input
                    type="text"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    placeholder="Tu nombre o ID de usuario"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 text-sm bg-slate-50 focus:bg-white transition-colors"
                />
            </div>
            
            <div className="flex gap-3 mt-6">
                <button 
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    Cancelar
                </button>
                <button 
                    type="submit"
                    className="flex-1 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                    <Save className="w-4 h-4" />
                    Confirmar Guardado
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};
