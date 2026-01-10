import React, { useState, useEffect } from 'react';
import { Edit, ClipboardList, FileText, Plus, AlertCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 1. Definición de la interfaz alineada a tu Backend (GestionOperativa)
export interface GestionOperativa {
  id: number;
  tipo_gestion: string;
  etapa: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  fecha_compromiso: string;
  descripcion?: string;
  owner_id?: number;
  [key: string]: any;
}

export interface GestionListProps {
  gestiones: GestionOperativa[]; // Renombrado de opportunities
  onEdit: (gestion: GestionOperativa) => void;
  onCreate: () => void;
}

const GestionList: React.FC<GestionListProps> = ({ 
  gestiones = [], 
  onEdit, 
  onCreate 
}) => {
  const navigate = useNavigate();
  const [localGestiones, setLocalGestiones] = useState<GestionOperativa[]>(gestiones);

  useEffect(() => {
    setLocalGestiones(gestiones);
  }, [gestiones]);

  // Helper para formatear el ID visualmente (Ej: GO-00023)
  const formatId = (id: number) => `GO-${id.toString().padStart(5, '0')}`;

  // Helper para colores de Prioridad
  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'Alta': return 'bg-red-50 text-red-600 border-red-100';
      case 'Media': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Baja': return 'bg-slate-50 text-slate-600 border-slate-100';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  // Helper para colores de Etapa
  const getStageColor = (etapa: string) => {
    if (etapa === 'Completada') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (etapa === 'Cancelada') return 'bg-gray-100 text-gray-500 border-gray-200';
    if (etapa === 'En Ejecución') return 'bg-blue-50 text-blue-600 border-blue-100';
    return 'bg-purple-50 text-purple-600 border-purple-100';
  };

  // Estado vacío
  if (!localGestiones || localGestiones.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-200">
        <div className="bg-blue-50 p-4 rounded-full inline-block mb-4">
          <ClipboardList size={32} className="text-blue-300" />
        </div>
        <h4 className="text-lg font-medium text-gray-900 mb-1 font-sans">No hay gestiones registradas</h4>
        <p className="text-gray-400 mb-6 text-sm font-sans">Comienza registrando una nueva solicitud operativa.</p>
        <button 
          onClick={onCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 mx-auto hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} /> Nueva Gestión
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300 font-sans w-full">
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-100">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 uppercase text-xs font-bold text-gray-500 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 w-32">Código</th>
              <th className="px-6 py-4">Tipo de Gestión</th>
              <th className="px-6 py-4">Etapa</th>
              <th className="px-6 py-4 text-center">Prioridad</th>
              <th className="px-6 py-4">Compromiso</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {localGestiones.map((gestion, index) => (
              <tr key={gestion.id || index} className="hover:bg-gray-50 group transition-colors">
                
                {/* 1. Columna Código (Clickeable) */}
                <td className="px-6 py-4">
                  <button 
                    onClick={() => navigate(`/gestion/${gestion.id}`)} 
                    className="text-gray-700 hover:text-blue-600 text-left font-bold transition-colors font-mono"
                  >
                    {formatId(gestion.id)}
                  </button>
                </td>

                {/* 2. Columna Tipo */}
                <td className="px-6 py-4 text-gray-600 font-medium">
                  {gestion.tipo_gestion}
                </td>

                {/* 3. Columna Etapa */}
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${getStageColor(gestion.etapa)}`}>
                    {gestion.etapa}
                  </span>
                </td>

                {/* 4. Columna Prioridad */}
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${getPriorityColor(gestion.prioridad)}`}>
                    {gestion.prioridad === 'Alta' && <AlertCircle size={10} />}
                    {gestion.prioridad}
                  </span>
                </td>

                {/* 5. Columna Fecha Compromiso */}
                <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-300" />
                    {gestion.fecha_compromiso}
                  </div>
                </td>

                {/* 6. Acciones */}
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => navigate(`/gestion/${gestion.id}`)} 
                      className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" 
                      title="Ver Detalle"
                    >
                      <FileText size={16} />
                    </button>
                    <button 
                      onClick={() => onEdit(gestion)} 
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GestionList;