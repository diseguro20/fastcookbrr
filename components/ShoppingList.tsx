import React, { useState, useRef, useEffect } from 'react';
import { X, Trash2, Plus, ShoppingCart, Check } from 'lucide-react';

interface ShoppingListProps {
  items: string[];
  onRemoveItem: (index: number) => void;
  onAddItem: (item: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ items, onRemoveItem, onAddItem, onClose, isOpen }) => {
  const [newItem, setNewItem] = useState('');
  const listEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when items change
  useEffect(() => {
    if (isOpen) {
      listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [items.length, isOpen]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim()) {
      onAddItem(newItem.trim());
      setNewItem('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md animate-fade-in" 
        onClick={onClose} 
      />
      
      {/* Modal with responsive width */}
      <div className="relative bg-white w-[90vw] max-w-md rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-pop border border-white/20">
        <div className="bg-gradient-to-r from-zinc-800 to-zinc-900 p-6 md:p-8 flex justify-between items-start text-white">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-amber-400">
              <ShoppingCart className="w-6 h-6 md:w-8 md:h-8 opacity-90" />
              Compras
            </h2>
            <p className="text-zinc-400 mt-1 text-xs md:text-sm font-medium opacity-90">
              {items.length} {items.length === 1 ? 'item' : 'itens'} na lista
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm active:scale-90"
          >
            <X className="w-5 h-5 text-amber-100" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400 py-10 opacity-70">
              <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="w-8 h-8 text-zinc-300" />
              </div>
              <p className="font-medium">Sua lista está vazia.</p>
              <p className="text-sm mt-1">Adicione itens que faltam.</p>
            </div>
          ) : (
            <ul className="space-y-3 pb-4">
              {items.map((item, idx) => (
                <li 
                  key={`${item}-${idx}`}
                  className="group flex items-center justify-between bg-white border border-zinc-100 p-3 md:p-4 rounded-2xl hover:border-amber-300 hover:shadow-lg hover:shadow-amber-100/50 transition-all animate-slide-up"
                  style={{ animationDelay: `${Math.min(idx * 50, 300)}ms` }}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-zinc-200 group-hover:border-amber-500 transition-colors flex items-center justify-center shrink-0">
                      <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity scale-0 group-hover:scale-100" />
                    </div>
                    <span className="font-semibold text-zinc-700 truncate text-sm md:text-base">{item}</span>
                  </div>
                  <button 
                    onClick={() => onRemoveItem(idx)}
                    className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-95"
                  >
                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </li>
              ))}
              <div ref={listEndRef} />
            </ul>
          )}
        </div>

        <form onSubmit={handleAdd} className="p-4 md:p-6 border-t border-zinc-100 bg-zinc-50/50">
          <div className="flex gap-2 md:gap-3 shadow-sm rounded-2xl bg-white p-1.5 border border-zinc-200 focus-within:ring-4 focus-within:ring-amber-500/10 focus-within:border-amber-400 transition-all">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Adicionar item..."
              className="flex-1 px-3 md:px-4 py-2 md:py-3 bg-transparent focus:outline-none text-zinc-700 placeholder-zinc-400 text-sm md:text-base"
            />
            <button 
              type="submit"
              disabled={!newItem.trim()}
              className="bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white p-2 md:p-3 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <Plus className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShoppingList;