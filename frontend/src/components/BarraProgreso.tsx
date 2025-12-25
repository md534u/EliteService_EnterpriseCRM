import React from 'react';
import { Check } from 'lucide-react';

interface BarraProgresoProps {
  etapaActual: string;
}

// DEFINICIÓN OBLIGATORIA DE ETAPAS (Orden Fijo)
const etapas = [
  'Contacto',
  'Identificar Necesidades',
  'Propuesta',
  'Negociación',
  'Firma',
  'En validación por Crédito',
  'Oportunidad Ganada',
  'Oportunidad Perdida'
];

const BarraProgreso: React.FC<BarraProgresoProps> = ({ etapaActual }) => {
  const indiceActual = etapas.indexOf(etapaActual);
  const pasoActual = indiceActual === -1 ? 0 : indiceActual;

  return (
    <div className="w-full py-4">
      <h3 className="text-sm font-bold text-gray-900 mb-6">Etapa del Proceso</h3>
      <div className="relative flex justify-between items-start w-full">
        
        {/* Línea de fondo */}
        <div className="absolute top-4 left-0 w-full h-1 bg-gray-100 -z-10" />
        
        {/* Línea de progreso (azul) */}
        <div 
            className="absolute top-4 left-0 h-1 bg-blue-600 -z-10 transition-all duration-500" 
            style={{ width: `${(pasoActual / (etapas.length - 1)) * 100}%` }}
        />

        {etapas.map((etapa, index) => {
          const completado = index < pasoActual;
          const activo = index === pasoActual;

          return (
            <div key={index} className="flex flex-col items-center group cursor-default w-full">
              {/* Círculo */}
              <div 
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 z-10 bg-white
                  ${completado ? 'bg-blue-600 border-blue-600 text-white' : ''}
                  ${activo ? 'bg-blue-600 border-blue-200 ring-4 ring-blue-50 text-white scale-110' : ''}
                  ${!completado && !activo ? 'bg-gray-100 border-gray-200 text-gray-400' : ''}
                `}
              >
                {completado ? <Check size={16} strokeWidth={3} /> : index + 1}
              </div>
              
              {/* Label */}
              <span 
                className={`mt-2 text-[10px] sm:text-xs font-medium transition-colors duration-300 text-center max-w-[80px] leading-tight
                  ${activo ? 'text-gray-900 font-bold' : 'text-gray-500'}
                `}
              >
                {etapa}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BarraProgreso;