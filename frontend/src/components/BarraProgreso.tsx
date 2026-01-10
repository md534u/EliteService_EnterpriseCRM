import React, { useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import { STAGES, STATUS_CANCELED, STAGE_DESCRIPTIONS } from '../constants';

interface BarraProgresoProps {
  currentStage: string;
  // 👇 AGREGADO: Función para manejar el clic en la etapa
  onStageSelect: (stage: string) => void;
}

// 👇 AGREGADO: Desestructuramos onStageSelect de los props
const BarraProgreso: React.FC<BarraProgresoProps> = ({ currentStage, onStageSelect }) => {
  const isCanceled = currentStage === STATUS_CANCELED;
  const currentIndex = STAGES.indexOf(currentStage);
  const isFullyCompleted = currentStage === 'Completada';

  // 👇 AGREGADO: Efecto de sonido al cambiar de etapa
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Evitamos que suene al cargar la página por primera vez
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Generador de sonido "Pop/Success" sutil usando Web Audio API
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        // Configuración: Tono suave que sube de frecuencia (sensación positiva)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);
        
        // Volumen: Desvanecimiento rápido para que sea corto y sutil
        gain.gain.setValueAtTime(0.05, ctx.currentTime); // Volumen bajo (5%)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch (e) {
      // Fallback silencioso si el navegador no soporta audio o está bloqueado
      console.error("Audio effect error", e);
    }
  }, [currentStage]);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0" />
        
        {/* Active Progress Line */}
        {!isCanceled && (
          <div 
            className={`absolute top-1/2 left-0 h-0.5 -translate-y-1/2 z-0 transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] ${isFullyCompleted ? 'bg-emerald-500' : 'bg-blue-600'}`}
            style={{ 
              width: `${Math.max(0, (currentIndex / (STAGES.length - 1)) * 100)}%` 
            }}
          />
        )}

        {STAGES.map((stage, index) => {
          const isCompleted = !isCanceled && index < currentIndex;
          const isActive = !isCanceled && index === currentIndex;
          const isPending = !isCanceled && index > currentIndex;

          return (
            <div key={stage} className="flex flex-col items-center relative z-10 flex-1 group">
              <div 
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ease-out
                  ${isCompleted ? (isFullyCompleted ? 'bg-emerald-500 text-white shadow-md' : 'bg-blue-600 text-white shadow-md') : ''}
                  ${isActive ? (isFullyCompleted ? 'bg-emerald-500 text-white ring-4 ring-emerald-100 shadow-lg scale-110' : 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-lg scale-110') : ''}
                  ${isPending ? 'bg-white border-2 border-gray-300 text-gray-400 hover:border-blue-300' : ''}
                  ${isCanceled ? 'bg-gray-100 border-2 border-gray-300 text-gray-400' : ''}
                `}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {isCompleted ? (
                  <Check size={16} strokeWidth={3} className="animate-in zoom-in duration-300" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              
              <div 
                // Evitamos que los clicks en el texto disparen eventos indeseados o interfieran
                className="absolute top-10 w-full px-2 flex flex-col items-center pointer-events-none"
              >
                <span className={`
                  text-[9px] md:text-[10px] uppercase tracking-wider font-black transition-colors duration-300 text-center leading-tight
                  ${isActive ? (isFullyCompleted ? 'text-emerald-600' : 'text-blue-600') : 'text-gray-400'}
                  ${isCompleted ? (isFullyCompleted ? 'text-emerald-800' : 'text-blue-800') : ''}
                `}>
                  {stage}
                </span>
                
                {/* Description (Static for active, Tooltip for others) */}
                <div className={`
                  mt-1 text-[9px] font-medium normal-case max-w-[120px] text-center leading-tight transition-all duration-300
                  ${isActive 
                    ? 'text-gray-500 opacity-100' 
                    : 'absolute top-full mt-2 bg-gray-800 text-white px-2 py-1.5 rounded-md shadow-lg opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 z-50 w-32 pointer-events-none'}
                `}>
                  {STAGE_DESCRIPTIONS[stage]}
                  {!isActive && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 transform rotate-45" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Special status for Canceled */}
      {isCanceled && (
        <div className="mt-16 flex justify-center">
           <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm">
             <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
             Gestión Cancelada
           </div>
        </div>
      )}
      <div className="h-12" /> {/* Increased spacer for descriptions */}
    </div>
  );
};

export default BarraProgreso;