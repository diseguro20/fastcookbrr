import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Menu, Loader2, Sparkles, ChefHat, RotateCcw, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import RecipeCard from './components/RecipeCard';
import CookingMode from './components/CookingMode';
import ShoppingList from './components/ShoppingList';
import SubscriptionModal from './components/SubscriptionModal';
import { analyzeFridgeImage, generateRecipeImage } from './services/geminiService';
import { AppView, DietaryFilter, Recipe, AnalysisResult } from './types';

const INITIAL_FILTERS: DietaryFilter[] = [
  { id: 'vegetarian', label: 'Vegetariano', active: false },
  { id: 'vegan', label: 'Vegano', active: false },
  { id: 'keto', label: 'Cetogênica', active: false },
  { id: 'gluten_free', label: 'Sem Glúten', active: false },
  { id: 'lactose_free', label: 'Sem Lactose', active: false },
];

const LOADING_MESSAGES = [
  "Analisando sua geladeira...",
  "Identificando ingredientes frescos...",
  "Consultando chefs virtuais...",
  "Criando receitas personalizadas...",
  "Ajustando temperos...",
  "Finalizando detalhes..."
];

const MAX_FREE_USAGES = 3;

export default function App() {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [filters, setFilters] = useState<DietaryFilter[]>(INITIAL_FILTERS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  
  // Usage tracking state
  const [usageCount, setUsageCount] = useState(() => {
    if (typeof window !== 'undefined') {
      return Number(localStorage.getItem('fastcook_usage') || 0);
    }
    return 0;
  });

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [shoppingList, setShoppingList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (view === AppView.ANALYZING) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [view]);

  const incrementUsage = () => {
    const newCount = usageCount + 1;
    setUsageCount(newCount);
    localStorage.setItem('fastcook_usage', String(newCount));
  };

  const toggleFilter = (id: string) => {
    setFilters(prev => prev.map(f => f.id === id ? { ...f, active: !f.active } : f));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check usage limit before processing
    if (usageCount >= MAX_FREE_USAGES) {
      setIsSubscriptionModalOpen(true);
      event.target.value = '';
      return;
    }

    setIsLoading(true);
    setView(AppView.ANALYZING);
    setLoadingMessageIndex(0);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        const activeFilters = filters.filter(f => f.active).map(f => f.label);
        
        try {
          const result = await analyzeFridgeImage(base64String, activeFilters);
          
          incrementUsage();

          setAnalysisResult(result);
          
          setTimeout(() => {
             setView(AppView.RESULTS);
          }, 500);
          
          // Generate images in background
          result.recipes.forEach(async (recipe) => {
             const imageUrl = await generateRecipeImage(recipe.title, recipe.description);
             if (imageUrl) {
               setAnalysisResult(prev => {
                 if (!prev) return null;
                 return {
                   ...prev,
                   recipes: prev.recipes.map(r => r.id === recipe.id ? { ...r, imageUrl } : r)
                 };
               });
             }
          });
          
        } catch (error) {
          console.error(error);
          alert("Ops! Ocorreu um erro ao analisar a imagem. Tente novamente.");
          setView(AppView.HOME);
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      setView(AppView.HOME);
    }
  };

  const handleCancelAnalysis = () => {
    setIsLoading(false);
    setView(AppView.HOME);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReset = () => {
    setSelectedRecipe(null);
    setAnalysisResult(null);
    setView(AppView.HOME);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addToShoppingList = (items: string[]) => {
    const newItems = items.filter(item => !shoppingList.includes(item));
    setShoppingList(prev => [...prev, ...newItems]);
    setIsShoppingListOpen(true);
  };

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 md:px-6 text-center animate-fade-in relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-[-10%] right-[-10%] w-80 h-80 md:w-96 md:h-96 bg-amber-100/40 rounded-full blur-3xl opacity-50 animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 md:w-96 md:h-96 bg-zinc-200 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="w-24 h-24 md:w-28 md:h-28 bg-white rounded-full flex items-center justify-center mb-6 md:mb-8 shadow-xl shadow-amber-100 animate-slide-up border border-white">
        <ChefHat className="w-12 h-12 md:w-14 md:h-14 text-amber-500" />
      </div>
      
      <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 mb-4 md:mb-6 tracking-tight animate-slide-up delay-100">
        O que tem na <br/>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-500">
          geladeira?
        </span>
      </h1>
      
      <p className="text-zinc-500 mb-10 md:mb-12 max-w-md text-base md:text-lg leading-relaxed animate-slide-up delay-200">
        Transforme ingredientes do dia a dia em pratos extraordinários com IA.
      </p>

      <div className="w-full max-w-sm space-y-4 animate-slide-up delay-300">
        <button 
          onClick={() => {
            if (usageCount >= MAX_FREE_USAGES) {
              setIsSubscriptionModalOpen(true);
            } else {
              fileInputRef.current?.click();
            }
          }}
          className="group relative w-full overflow-hidden bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:via-yellow-300 hover:to-amber-500 text-black py-4 md:py-5 px-6 rounded-2xl shadow-xl shadow-amber-500/30 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 text-base md:text-lg font-bold"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
          <Camera className="w-6 h-6" />
          <span>Tirar Foto dos Ingredientes</span>
        </button>
        
        {usageCount < MAX_FREE_USAGES ? (
          <p className="text-[10px] md:text-xs text-zinc-400 font-medium uppercase tracking-widest mt-6 opacity-70">
            {MAX_FREE_USAGES - usageCount} usos gratuitos restantes
          </p>
        ) : (
          <p className="text-[10px] md:text-xs text-amber-500 font-bold uppercase tracking-widest mt-6">
            Limite gratuito atingido
          </p>
        )}
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />
    </div>
  );

  const renderAnalyzing = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center animate-fade-in">
      <div className="relative mb-10">
        <div className="absolute inset-0 bg-amber-200 rounded-full blur-xl opacity-30 animate-ping"></div>
        <div className="relative bg-white p-6 rounded-full shadow-lg">
          <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
        </div>
      </div>
      
      <div className="h-20 flex items-center justify-center w-full max-w-xs">
        <h2 key={loadingMessageIndex} className="text-xl md:text-2xl font-bold text-zinc-800 animate-slide-up">
          {LOADING_MESSAGES[loadingMessageIndex]}
        </h2>
      </div>
      
      <p className="text-zinc-400 mt-2 mb-8 animate-pulse text-sm">Isso pode levar alguns segundos...</p>

      <button 
        onClick={handleCancelAnalysis}
        className="text-zinc-400 hover:text-red-500 text-sm font-medium px-6 py-2 rounded-full hover:bg-red-50 transition-colors flex items-center gap-2"
      >
        <X className="w-4 h-4" />
        Cancelar
      </button>
    </div>
  );

  const renderResults = () => {
    if (!analysisResult) return null;

    return (
      <div className="pb-24 animate-fade-in">
        <div className="px-4 md:px-6 py-6 md:py-8">
          <div className="mb-8 md:mb-10 text-center animate-slide-up">
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-4 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-amber-500 fill-amber-500" />
              Descobertas do Chef
            </h2>
            <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
              {analysisResult.detectedIngredients.map((ing, i) => (
                <span 
                  key={i} 
                  className="px-3 py-1 md:px-4 md:py-1.5 bg-white border border-zinc-100 text-zinc-600 rounded-full text-xs md:text-sm font-medium shadow-sm animate-pop hover:border-amber-200 transition-colors"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {ing}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {analysisResult.recipes.map((recipe, index) => (
              <div 
                key={recipe.id} 
                className="animate-slide-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <RecipeCard 
                  recipe={recipe} 
                  onSelect={(r) => {
                    setSelectedRecipe(r);
                    setView(AppView.COOKING);
                  }} 
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-zinc-900 selection:bg-amber-100 selection:text-amber-900">
      {/* Navigation Bar */}
      <nav className={`sticky top-0 z-30 transition-all duration-300 ${view === AppView.HOME ? 'bg-transparent py-4 md:py-6' : 'bg-white/80 backdrop-blur-md border-b border-zinc-100 py-3 shadow-sm'}`}>
        <div className="max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-between">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-zinc-100 rounded-xl transition-colors group active:scale-95"
          >
            <Menu className="w-6 h-6 text-zinc-800 group-hover:scale-110 transition-transform" />
          </button>
          
          <span 
            className={`font-bold text-lg tracking-tight cursor-pointer transition-colors ${view === AppView.HOME ? 'opacity-0' : 'text-zinc-900'}`}
            onClick={handleReset}
          >
            FastCook
          </span>
          
          {view === AppView.RESULTS ? (
            <button 
              onClick={handleReset}
              className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl transition-colors active:scale-95"
              title="Nova Foto"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-9 h-9" /> 
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto w-full">
        {view === AppView.HOME && renderHome()}
        {view === AppView.ANALYZING && renderAnalyzing()}
        {view === AppView.RESULTS && renderResults()}
      </main>

      {/* Modals & Overlays */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        filters={filters}
        toggleFilter={toggleFilter}
        shoppingListCount={shoppingList.length}
        onOpenShoppingList={() => setIsShoppingListOpen(true)}
        usageCount={usageCount}
        maxFreeUsages={MAX_FREE_USAGES}
      />

      <ShoppingList 
        isOpen={isShoppingListOpen}
        onClose={() => setIsShoppingListOpen(false)}
        items={shoppingList}
        onAddItem={(item) => setShoppingList(prev => [...prev, item])}
        onRemoveItem={(index) => setShoppingList(prev => prev.filter((_, i) => i !== index))}
      />

      <SubscriptionModal 
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
      />

      {view === AppView.COOKING && selectedRecipe && (
        <CookingMode 
          recipe={selectedRecipe} 
          onClose={() => setView(AppView.RESULTS)} 
          onAddToShoppingList={addToShoppingList}
        />
      )}
    </div>
  );
}