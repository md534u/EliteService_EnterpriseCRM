import React from 'react';
import { Plus, Edit } from 'lucide-react';

interface Opportunity {
  ID: string;
  Nombre_Op: string;
  Etapa: string;
  Cantidad_Lineas: string;
  Fecha_Cierre: string;
  Servicio_Clave: string;
  Probabilidad: number;
  Tipo_Op: string;
  Comentarios: string;
}

interface Props {
  opportunities: Opportunity[];
  onEdit: (op: Opportunity) => void;
  onCreate: () => void;
}

const OpportunityList: React.FC<Props> = ({ opportunities, onEdit, onCreate }) => {
  if (opportunities.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 mb-4">No hay oportunidades registradas para esta cuenta.</p>
        <button 
          onClick={onCreate}
          className="btn-primary flex items-center gap-2 mx-auto"
        >
          <Plus size={18} /> Nueva Oportunidad
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-700">Oportunidades Abiertas</h3>
        <button 
          onClick={onCreate}
          className="btn-primary text-sm flex items-center gap-1"
        >
          <Plus size={16} /> Nueva
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 uppercase text-xs font-bold text-gray-500">
            <tr>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Etapa</th>
              <th className="px-4 py-2">Líneas</th>
              <th className="px-4 py-2">Servicio</th>
              <th className="px-4 py-2">Cierre Estimado</th>
              <th className="px-4 py-2">Prob.</th>
              <th className="px-4 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {opportunities.map((op) => (
              <tr key={op.ID} className="hover:bg-gray-50 group">
                <td className="px-4 py-3 font-medium text-gray-900">{op.Nombre_Op}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold
                    ${op.Etapa === 'Cerrada Ganada' ? 'bg-green-100 text-green-800' : 
                      op.Etapa === 'Perdida' ? 'bg-red-100 text-red-800' : 
                      'bg-blue-100 text-blue-800'}`}>
                    {op.Etapa}
                  </span>
                </td>
                <td className="px-4 py-3">{op.Cantidad_Lineas}</td>
                <td className="px-4 py-3">{op.Servicio_Clave}</td>
                <td className="px-4 py-3 text-gray-600">{op.Fecha_Cierre}</td>
                <td className="px-4 py-3">{op.Probabilidad}%</td>
                <td className="px-4 py-3 text-right">
                  <button 
                    onClick={() => onEdit(op)}
                    className="text-gray-400 hover:text-att-blue transition-colors p-1"
                  >
                    <Edit size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OpportunityList;
