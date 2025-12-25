import React from 'react';

// Definimos qué datos espera recibir este componente
export interface BadgeFolioProps {
  tipo: string;
  folio: string | number;
}

// Definimos la estructura de la configuración de colores
interface StyleConfig {
  [key: string]: { color: string; label: string };
}

const config: StyleConfig = {
  cuenta: { color: '#BF0CEA', label: 'Cuenta' },      // Morado
  oportunidad: { color: '#FF8226', label: 'Op' },     // Naranja
  cotizacion: { color: '#E72E70', label: 'Cot' }      // Rosa/Rojo
};

const BadgeFolio: React.FC<BadgeFolioProps> = ({ tipo, folio }) => {
  // Seleccionamos el estilo con fallback a 'oportunidad'
  const estilo = config[tipo.toLowerCase()] || config.oportunidad;

  return (
    <span 
      className="inline-flex items-center px-2.5 py-0.5 rounded text-sm font-medium border"
      style={{
        backgroundColor: `${estilo.color}1A`, // 10% de opacidad
        color: estilo.color,
        borderColor: `${estilo.color}33`      // 20% de opacidad
      }}
    >
      #{folio}
    </span>
  );
};

export default BadgeFolio;