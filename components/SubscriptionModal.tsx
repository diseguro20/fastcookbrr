import React from 'react';
import { Sparkles, Check, Star, ShieldCheck, Zap, Crown } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen }) => {
  if (!isOpen) return null;

  const handleSubscribe = () => {
    window.open('https://go.pepperpay.com.br/fapra', '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md animate-fade-in" />

      {/* Modal Card */}
      <div className="relative bg-zinc-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-pop border border-zinc-800">
        
        {/* Header with Gradient */}
        <div className="bg-gradient-to-b from-zinc-800 to-zinc-900 p-8 text-center relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <Crown className="w-32 h-32 text-amber-500 -rotate-12" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="bg-gradient-to-br from-amber-400 to-yellow-600 p-3 rounded-2xl mb-4 shadow-lg shadow-amber-500/20">
              <Crown className="w-8 h-8 text-white fill-white" />
            </div>
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 mb-2">
              Limite Atingido
            </h2>
            <p className="text-zinc-400 font-medium">Torne-se um Chef Premium</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 pt-6">
          <div className="text-center mb-8">
            <p className="text-zinc-400 mb-3 text-sm">Você utilizou suas 3 receitas gratuitas.</p>
            <div className="inline-block bg-zinc-800 text-amber-400 px-4 py-1.5 rounded-full text-xs font-bold border border-zinc-700 tracking-wide uppercase">
              Oferta Exclusiva
            </div>
          </div>

          {/* Pricing Box */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 mb-8 relative overflow-hidden group hover:border-amber-500/30 transition-colors shadow-inner">
            <div className="absolute top-0 right-0 bg-amber-500 text-black text-[10px] font-bold px-2 py-1 rounded-bl-lg">
              -50% OFF
            </div>
            
            <div className="flex items-end justify-center gap-2 mb-2">
              <span className="text-zinc-600 text-lg line-through mb-1">R$ 9,90</span>
              <span className="text-4xl font-black text-white">R$ 5,00</span>
              <span className="text-zinc-500 font-medium mb-1">/1º mês</span>
            </div>
            <p className="text-center text-xs text-zinc-500">Depois R$ 9,90/mês. Cancele quando quiser.</p>
          </div>

          {/* Features */}
          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-3 text-zinc-300">
              <div className="bg-amber-500/10 p-1 rounded-full"><Check className="w-3 h-3 text-amber-500" /></div>
              <span className="font-medium text-sm">Receitas ilimitadas com IA</span>
            </li>
            <li className="flex items-center gap-3 text-zinc-300">
              <div className="bg-amber-500/10 p-1 rounded-full"><Check className="w-3 h-3 text-amber-500" /></div>
              <span className="font-medium text-sm">Modo Cozinha passo-a-passo</span>
            </li>
            <li className="flex items-center gap-3 text-zinc-300">
              <div className="bg-amber-500/10 p-1 rounded-full"><Check className="w-3 h-3 text-amber-500" /></div>
              <span className="font-medium text-sm">Geração de imagens dos pratos</span>
            </li>
          </ul>

          {/* CTA Button */}
          <button 
            onClick={handleSubscribe}
            className="w-full group bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black py-4 rounded-xl font-bold text-lg shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 relative overflow-hidden"
          >
            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-40 group-hover:animate-shimmer" />
            <Star className="w-5 h-5 fill-black relative z-10" />
            <span className="relative z-10">Desbloquear Premium</span>
          </button>

          <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-zinc-500">
            <ShieldCheck className="w-3 h-3" />
            <span>Pagamento 100% seguro via PepperPay</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;