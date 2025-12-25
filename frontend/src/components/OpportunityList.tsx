import React, { useState } from 'react';
import { Plus, Edit, Briefcase, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Importante para la navegación
import QuoteBuilder from './QuoteBuilder';

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
  accountData?: any;
  contacts?: any[];
}

const OpportunityList: React.FC<Props> = ({ opportunities, onEdit, onCreate, accountData, contacts }) => {
  const navigate = useNavigate(); // Hook para redirigir
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [selectedOpForQuote, setSelectedOpForQuote] = useState<Opportunity | null>(null);

  const handleOpenQuote = (op: Opportunity) => {
    setSelectedOpForQuote(op);
    setIsQuoteOpen(true);
  };

  // Identificar el contacto principal para el cotizador
  const primaryContact = contacts && contacts.length > 0 ? contacts[0] : null;

  // --- EMPTY STATE (Cuando no hay oportunidades) ---
  if (opportunities.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <div className="bg-white p-4 rounded-full inline-block mb-4 shadow-sm">
          <Briefcase size={32} className="text-att-blue opacity-50" />
        </div>
        <h4 className="text-lg font-medium text-gray-900 mb-1">No hay oportunidades registradas</h4>
        <p className="text-gray-500 mb-6 text-sm">Comienza agregando una nueva oportunidad de negocio para esta cuenta.</p>
        <button 
          onClick={onCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
        >
          <Plus size={18} /> Nueva Oportunidad
        </button>
      </div>
    );
  }

  // --- LISTA DE OPORTUNIDADES ---
  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-700">Oportunidades Abiertas</h3>
          <button 
            onClick={onCreate}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} /> Nueva
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 uppercase text-xs font-bold text-gray-500">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Etapa</th>
                <th className="px-4 py-3">Líneas</th>
                <th className="px-4 py-3">Servicio</th>
                <th className="px-4 py-3">Cierre Estimado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {opportunities.map((op) => (
                <tr key={op.ID} className="hover:bg-gray-50 group transition-colors">
                  
                  {/* NOMBRE CLICKABLE -> LLEVA AL DETALLE */}
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <button 
                      onClick={() => navigate(`/opportunity/${op.ID}`)}
                      className="hover:text-blue-600 hover:underline text-left font-bold transition-colors"
                    >
                      {op.Nombre_Op}
                    </button>
                  </td>

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
                  
                  <td className="px-4 py-3 text-right flex justify-end gap-2">
                    {/* Botón COTIZAR RÁPIDO (Abre modal aquí mismo) */}
                    <button 
                      onClick={() => handleOpenQuote(op)}
                      className="text-gray-400 hover:text-green-600 transition-colors p-1"
                      title="Generar Cotización Rápida"
                    >
                      <FileText size={18} />
                    </button>
                    
                    {/* Botón EDITAR */}
                    <button 
                      onClick={() => onEdit(op)}
                      className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                      title="Editar Oportunidad"
                    >
                      <Edit size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RENDERIZADO DEL MODAL DE COTIZACIÓN (QUICK QUOTE) */}
      <QuoteBuilder 
        isOpen={isQuoteOpen} 
        onClose={() => setIsQuoteOpen(false)} 
        opportunity={selectedOpForQuote}
        accountData={accountData}     
        primaryContact={primaryContact} 
      />
    </>
  );
};

export default OpportunityList;