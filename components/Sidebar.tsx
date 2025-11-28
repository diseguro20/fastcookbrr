import React from 'react';
import { X, ShoppingCart, Leaf, Flame, WheatOff, ChefHat, Milk, Zap } from 'lucide-react';
import { DietaryFilter } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: DietaryFilter[];
  toggleFilter: (id: string) => void;
  shoppingListCount: number;
  onOpenShoppingList: () => void;
  usageCount: number;
  maxFreeUsages: number;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  filters, 
  toggleFilter, 
  shoppingListCount,
  onOpenShoppingList,
  usageCount,
  maxFreeUsages
}) => {
  const remaining = Math.max(0, maxFreeUsages - usageCount);
  const percentage = (usageCount / maxFreeUsages) * 100;

  return (
    <>
      {/* Overlay with blur */}
      <div 
        className={`fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-40 transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Panel - Responsive Width */}
      <div className={`fixed top-0 left-0 h-full w-[85vw] max-w-[320px] bg-white shadow-2xl z-50 transform transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 md:p-8 h-full flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-zinc-900 flex items-center gap-3">
              <div className="bg-amber-50 p-2 rounded-xl border border-amber-100">
                <ChefHat className="w-5 h-5 md:w-6 md:h-6 text-amber-500" />
              </div>
              FastCook
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors active:scale-95">
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide pb-4">
            {/* Usage Stats Widget */}
            <div className="mb-8 p-4 md:p-5 bg-zinc-50 border border-zinc-200 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                   <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                   <span className="text-sm font-bold text-zinc-700">Seu Plano</span>
                </div>
                <span className="text-[10px] md:text-xs font-semibold bg-white px-2 py-0.5 rounded text-zinc-500 border border-zinc-200">Grátis</span>
              </div>
              
              <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
                <span>Usos restantes</span>
                <span className="font-medium text-zinc-900">{remaining} de {maxFreeUsages}</span>
              </div>
              
              <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${remaining === 0 ? 'bg-red-500' : 'bg-gradient-to-r from-amber-400 to-amber-600'}`} 
                  style={{ width: `${Math.min(100, percentage)}%` }}
                />
              </div>
              
              {remaining === 0 && (
                <button 
                  onClick={() => window.open('https://go.pepperpay.com.br/fapra', '_blank')}
                  className="w-full mt-3 bg-zinc-900 hover:bg-black text-amber-400 text-xs font-bold py-2.5 rounded-lg transition-colors active:scale-95 flex items-center justify-center gap-2"
                >
                  <Zap className="w-3 h-3 fill-current" />
                  Fazer Upgrade
                </button>
              )}
            </div>

            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 md:mb-6">
              Preferências
            </h3>
            <div className="space-y-3 md:space-y-4">
              {filters.map(filter => {
                const Icon = getFilterIcon(filter.id);
                return (
                  <button
                    key={filter.id}
                    onClick={() => toggleFilter(filter.id)}
                    className={`w-full flex items-center p-3.5 md:p-4 rounded-2xl transition-all duration-200 group active:scale-[0.98] ${
                      filter.active 
                        ? 'bg-amber-50 text-amber-900 ring-2 ring-amber-400 ring-offset-1' 
                        : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-3 md:mr-4 transition-colors ${filter.active ? 'text-amber-500' : 'text-zinc-400 group-hover:text-zinc-600'}`} />
                    <span className="font-semibold text-sm md:text-base">{filter.label}</span>
                    {filter.active && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-auto border-t border-zinc-100 pt-6 md:pt-8">
            <button 
              onClick={() => {
                onOpenShoppingList();
                onClose();
              }}
              className="w-full group flex items-center justify-between bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-black hover:to-zinc-900 text-amber-400 p-4 md:p-5 rounded-2xl shadow-xl shadow-zinc-200 transition-all transform hover:-translate-y-1 active:scale-95 active:translate-y-0 overflow-hidden relative"
            >
              {/* Shine effect */}
              <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-10 group-hover:animate-shimmer" />
              
              <div className="flex items-center gap-3 relative z-10">
                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                <span className="font-bold text-sm md:text-base">Ver Lista</span>
              </div>
              {shoppingListCount > 0 && (
                <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm relative z-10">
                  {shoppingListCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const getFilterIcon = (id: string) => {
  switch (id) {
    case 'vegetarian': return Leaf;
    case 'vegan': return Leaf;
    case 'keto': return Flame;
    case 'gluten_free': return WheatOff;
    case 'lactose_free': return Milk;
    default: return ChefHat;
  }
};

export default Sidebar;