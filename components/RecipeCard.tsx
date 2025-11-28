import React from 'react';
import { Clock, Flame, ArrowRight, Loader2, Image as ImageIcon, Share2 } from 'lucide-react';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onSelect }) => {
  
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `Olha essa receita de ${recipe.title} que encontrei no FastCook! 😋\n\n${recipe.description}\n\nTempo: ${recipe.prepTime}\nCalorias: ${recipe.calories}`;
    
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: text,
        url: window.location.href,
      }).catch(console.error);
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  return (
    <div 
      className="group bg-white rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-lg shadow-zinc-200/50 hover:shadow-2xl hover:shadow-amber-100/50 border border-white hover:border-amber-200 flex flex-col h-full transition-all duration-300 transform hover:-translate-y-2 cursor-pointer active:scale-[0.98]"
      onClick={() => onSelect(recipe)}
    >
      <div className="h-48 sm:h-56 bg-zinc-100 relative overflow-hidden">
        {recipe.imageUrl ? (
          <img 
            src={recipe.imageUrl} 
            alt={recipe.title}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 animate-fade-in"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-50 text-zinc-300 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 to-zinc-100"></div>
             <div className="relative z-10 flex flex-col items-center">
                <div className="relative mb-3">
                  <ImageIcon className="w-10 h-10 opacity-30" />
                  <Loader2 className="absolute -bottom-2 -right-2 w-5 h-5 animate-spin text-amber-500" />
                </div>
                <span className="text-xs font-medium text-zinc-400 animate-pulse">Criando imagem...</span>
             </div>
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>

        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold text-zinc-800 shadow-sm z-10 border border-white/50">
          {recipe.difficulty}
        </div>

        {/* Share Button on Image */}
        <button 
          onClick={handleShare}
          className="absolute top-3 left-3 sm:top-4 sm:left-4 p-2 bg-black/20 backdrop-blur-md hover:bg-amber-500/90 rounded-full text-white transition-all z-20 active:scale-90"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-5 sm:p-7 flex-1 flex flex-col relative">
        <div className="flex-1">
          <div className="flex flex-wrap gap-1.5 mb-2 sm:mb-3">
            {recipe.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 bg-zinc-50 text-zinc-500 rounded-md border border-zinc-100">
                {tag}
              </span>
            ))}
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-2 sm:mb-3 leading-tight group-hover:text-amber-600 transition-colors">
            {recipe.title}
          </h3>
          <p className="text-zinc-500 text-xs sm:text-sm mb-4 sm:mb-6 line-clamp-2 leading-relaxed">
            {recipe.description}
          </p>
          
          <div className="flex items-center gap-4 text-xs sm:text-sm font-medium text-zinc-600 mb-4 sm:mb-6">
            <div className="flex items-center gap-1.5 bg-zinc-50 px-2 py-1 rounded-md">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
              {recipe.prepTime}
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-50 px-2 py-1 rounded-md">
              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500" />
              {recipe.calories} kcal
            </div>
          </div>
        </div>

        <button 
          className="w-full mt-auto bg-zinc-50 group-hover:bg-amber-500 text-zinc-600 group-hover:text-white py-3 sm:py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base active:scale-[0.98] relative overflow-hidden"
        >
           {/* Shine effect on hover */}
           <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shimmer" />
          
          <span className="relative z-10">Ver Receita</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" />
        </button>
      </div>
    </div>
  );
};

export default RecipeCard;