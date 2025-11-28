import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Volume2, X, CheckCircle, ShoppingBag, ArrowLeft, CookingPot, Home, Loader2, StopCircle, Share2, Award, List } from 'lucide-react';
import { Recipe } from '../types';
import { generateSpeech } from '../services/geminiService';

interface CookingModeProps {
  recipe: Recipe;
  onClose: () => void;
  onAddToShoppingList: (items: string[]) => void;
}

// Helper to decode Base64
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to decode PCM audio data
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const CookingMode: React.FC<CookingModeProps> = ({ recipe, onClose, onAddToShoppingList }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const audioCacheRef = useRef<Map<string, AudioBuffer>>(new Map());
  const preloadingRef = useRef<Set<number>>(new Set());
  
  // Track the latest requested step
  const latestStepRef = useRef(currentStep);

  const progress = ((currentStep + 1) / recipe.steps.length) * 100;

  useEffect(() => {
    // Initialize Audio Context on mount
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    return () => {
      stopAudio();
      audioContextRef.current?.close();
    };
  }, []);

  // Update ref and play when step changes
  useEffect(() => {
    latestStepRef.current = currentStep;
    if (!isCompleted) {
       playCurrentStep();
    }
  }, [currentStep, isCompleted]);

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch (e) {
        // ignore errors
      }
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  const preloadStep = async (stepIndex: number) => {
    if (stepIndex >= recipe.steps.length || preloadingRef.current.has(stepIndex)) return;
    
    const cacheKey = `${recipe.id}-step-${stepIndex}`;
    if (audioCacheRef.current.has(cacheKey)) return;

    preloadingRef.current.add(stepIndex);
    
    try {
      const base64Audio = await generateSpeech(recipe.steps[stepIndex]);
      if (base64Audio && audioContextRef.current) {
         const audioBytes = decode(base64Audio);
         const audioBuffer = await decodeAudioData(audioBytes, audioContextRef.current, 24000, 1);
         audioCacheRef.current.set(cacheKey, audioBuffer);
      }
    } catch (error) {
      console.error(`Error preloading step ${stepIndex}:`, error);
    } finally {
      preloadingRef.current.delete(stepIndex);
    }
  };

  const playCurrentStep = async () => {
    if (!audioContextRef.current) return;
    
    stopAudio();
    setIsLoadingAudio(true);

    const stepToPlay = currentStep;

    // Trigger preload for the next step
    if (currentStep + 1 < recipe.steps.length) {
       preloadStep(currentStep + 1);
    }

    const stepText = recipe.steps[currentStep];
    const cacheKey = `${recipe.id}-step-${currentStep}`;

    try {
      let audioBuffer: AudioBuffer;

      if (audioCacheRef.current.has(cacheKey)) {
        audioBuffer = audioCacheRef.current.get(cacheKey)!;
      } else {
        const base64Audio = await generateSpeech(stepText);
        
        if (stepToPlay !== latestStepRef.current) return;

        if (!base64Audio) {
          throw new Error("Failed to generate speech");
        }

        const audioBytes = decode(base64Audio);
        audioBuffer = await decodeAudioData(audioBytes, audioContextRef.current, 24000, 1);
        
        if (stepToPlay !== latestStepRef.current) return;

        audioCacheRef.current.set(cacheKey, audioBuffer);
      }

      if (stepToPlay !== latestStepRef.current) {
        setIsLoadingAudio(false);
        return;
      }

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => {
        setIsPlaying(false);
        sourceNodeRef.current = null;
      };

      source.start();
      sourceNodeRef.current = source;
      setIsPlaying(true);

    } catch (error) {
      console.error("Audio playback error:", error);
    } finally {
      if (stepToPlay === latestStepRef.current) {
        setIsLoadingAudio(false);
      }
    }
  };

  const handleNext = () => {
    stopAudio();
    if (currentStep < recipe.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrev = () => {
    stopAudio();
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const toggleAudio = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      playCurrentStep();
    }
  };

  const handleShare = () => {
    const text = `Estou fazendo ${recipe.title} no FastCook! 👨‍🍳\n\n${recipe.steps[currentStep]}`;
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

  if (isCompleted) {
    return (
      <div className="fixed inset-0 bg-zinc-900 z-50 flex flex-col items-center justify-center p-6 text-white animate-fade-in overflow-hidden">
        {/* Ambient Gold Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative mb-10 md:mb-12">
          {/* Steam Animation (Golden) */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex justify-center gap-3 opacity-80">
            <div className="w-2 h-8 bg-amber-200/40 rounded-full animate-steam delay-0"></div>
            <div className="w-2.5 h-12 bg-amber-200/40 rounded-full animate-steam delay-200"></div>
            <div className="w-2 h-10 bg-amber-200/40 rounded-full animate-steam delay-500"></div>
          </div>
          
          <div className="relative z-10 animate-cooking">
            <CookingPot className="w-32 h-32 md:w-40 md:h-40 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" strokeWidth={1.5} />
          </div>

          <div className="absolute -bottom-4 -right-4 bg-white text-zinc-900 rounded-full p-3 shadow-xl shadow-amber-500/20 animate-checkmark delay-500 border-4 border-zinc-900">
            <CheckCircle className="w-10 h-10 md:w-12 md:h-12 fill-amber-500 text-white" />
          </div>
        </div>

        <h2 className="text-3xl md:text-5xl font-extrabold mb-4 text-center animate-slide-up delay-300 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200">
          Receita<br/>Concluída!
        </h2>
        
        <p className="text-zinc-400 text-lg md:text-xl text-center max-w-md mb-10 md:mb-12 animate-slide-up delay-500 px-4">
          Parabéns! Você acaba de preparar um delicioso <strong className="text-amber-400 block mt-1">{recipe.title}</strong>
        </p>

        <button 
          onClick={onClose}
          className="w-full max-w-xs group relative bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-zinc-900 px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105 transition-all flex items-center justify-center gap-3 animate-slide-up delay-700 active:scale-95 overflow-hidden"
        >
          <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-40 group-hover:animate-shimmer" />
          <List className="w-5 h-5 relative z-10" />
          <span className="relative z-10">Ver Outras Receitas</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col animate-fade-in">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl opacity-50 -z-10 translate-x-1/2 -translate-y-1/2"></div>
      
      {/* Top Bar - Mobile Optimized */}
      <div className="pt-4 pb-2 px-4 md:pt-6 md:pb-4 md:px-6 bg-white/80 backdrop-blur-sm z-10 border-b border-zinc-50">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => {
              stopAudio();
              onClose();
            }} 
            className="flex items-center gap-2 pl-2 pr-4 py-2 bg-zinc-50/80 border border-zinc-200/60 shadow-sm rounded-full hover:bg-white hover:border-amber-300 hover:shadow-amber-100 transition-all group active:scale-95 backdrop-blur-md"
          >
            <div className="bg-white p-1.5 rounded-full shadow-sm border border-zinc-100 group-hover:border-amber-200 group-hover:bg-amber-50 transition-colors">
               <ArrowLeft className="w-4 h-4 text-zinc-600 group-hover:text-amber-600 transition-colors" />
            </div>
            <span className="font-bold text-sm text-zinc-600 group-hover:text-zinc-900">Voltar</span>
          </button>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleShare}
              className="p-2 bg-zinc-50 hover:bg-zinc-100 rounded-full text-amber-600 transition-colors active:scale-95"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {recipe.missingIngredients.length > 0 && (
              <button 
                onClick={() => onAddToShoppingList(recipe.missingIngredients)}
                className="text-[10px] md:text-xs font-bold text-zinc-700 bg-amber-100 px-3 py-2 rounded-full hover:bg-amber-200 transition-colors flex items-center gap-1 active:scale-95"
              >
                <ShoppingBag className="w-3 h-3" />
                <span className="hidden xs:inline">Faltam Ingredientes</span>
                <span className="inline xs:hidden">Comprar</span>
              </button>
            )}
          </div>
        </div>
        
        <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden w-full">
          <div 
            className="h-full bg-amber-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(245,158,11,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main Content - Flexible Scrollable Area */}
      <div className="flex-1 overflow-y-auto relative">
        <div className="flex flex-col items-center min-h-full py-8 px-5 text-center">
          
          <div className="mb-6 md:mb-8">
            <span className="inline-flex items-center justify-center px-4 py-1.5 bg-zinc-900 text-amber-400 rounded-full text-xs font-bold tracking-wide shadow-md">
              PASSO {currentStep + 1}
            </span>
          </div>

          <div key={currentStep} className="animate-slide-up mb-10 w-full max-w-2xl">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-zinc-900 leading-tight tracking-tight">
              {recipe.steps[currentStep]}
            </h2>
          </div>

          <div className="mt-auto pb-4">
            <button 
              onClick={toggleAudio}
              disabled={isLoadingAudio}
              className={`
                relative group flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full transition-all duration-300
                ${isLoadingAudio 
                  ? 'bg-zinc-100 text-zinc-400 cursor-wait'
                  : isPlaying
                    ? 'bg-amber-500 text-white shadow-xl shadow-amber-200 scale-110' 
                    : 'bg-white border-2 border-zinc-100 text-zinc-400 hover:border-amber-200 hover:text-amber-500 hover:shadow-lg hover:scale-105 active:scale-95'
                }
              `}
            >
              {isLoadingAudio ? (
                <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin" />
              ) : isPlaying ? (
                <>
                  <span className="absolute inset-0 rounded-full border-2 border-white animate-ping opacity-30"></span>
                  <StopCircle className="w-6 h-6 md:w-8 md:h-8 fill-current" />
                </>
              ) : (
                <Volume2 className="w-6 h-6 md:w-8 md:h-8" />
              )}
            </button>
            <span className="block text-xs text-zinc-400 mt-3 font-medium">
              {isLoadingAudio ? 'Gerando voz...' : isPlaying ? 'Parar Áudio' : 'Ouvir Instruções'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Controls - Fixed and Safe Area */}
      <div className="p-4 md:p-6 bg-white border-t border-zinc-50 safe-area-bottom">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3 md:gap-6">
          <button 
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex-1 py-4 md:py-5 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 rounded-xl md:rounded-2xl font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group text-sm md:text-base active:scale-[0.98]"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Anterior
          </button>
          
          <button 
            onClick={handleNext}
            className="flex-[2] py-4 md:py-5 bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-black hover:to-zinc-900 text-amber-400 rounded-xl md:rounded-2xl font-bold shadow-lg shadow-zinc-300 hover:shadow-xl hover:shadow-zinc-400 transition-all flex items-center justify-center gap-2 group text-sm md:text-base active:scale-[0.98] relative overflow-hidden"
          >
            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-10 group-hover:animate-shimmer" />
            
            <div className="relative z-10 flex items-center gap-2">
              {currentStep === recipe.steps.length - 1 ? (
                <>
                  <Award className="w-5 h-5 md:w-6 md:h-6 text-amber-400" />
                  Concluir
                </>
              ) : (
                <>
                  Próximo
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookingMode;