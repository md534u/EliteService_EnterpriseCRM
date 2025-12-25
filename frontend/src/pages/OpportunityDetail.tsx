import { useEffect, useState } from "react";
import axios from 'axios';
import { 
  ArrowLeft, Edit, ThumbsDown, CheckCircle, Calendar, 
  DollarSign, PieChart, FileText, Plus, User, MapPin, Tag, ArrowRight 
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

// Componentes
import QuoteBuilder from '../components/QuoteBuilder'; 
import BadgeFolio from '../components/BadgeFolio';      
import BarraProgreso from '../components/BarraProgreso'; 

// --- DEFINICIÓN DE TIPOS ---
interface Opportunity {
  ID: string | number;
  Folio: string;
  Nombre_Oportunidad: string;
  Cliente: string;
  Propietario: string;
  Tipo_Op: string;
  Valor: number;
  Fecha_Cierre: string;
  Cantidad_Lineas: number | string;
  Canal_Ventas: string;
  Etapa?: string; 
  Motivo_Perdida?: string;
  Sub_Motivo?: string;
}

// --- CONSTANTES ---
const STAGES = [
  'Contacto', 'Identificar Necesidades', 'Propuesta', 'Negociación', 
  'Firma', 'En validación por Crédito', 'Oportunidad Ganada', 'Oportunidad Perdida'
];

const PROBABILITIES: Record<string, number> = {
  'Contacto': 10, 'Identificar Necesidades': 25, 'Propuesta': 50, 'Negociación': 75,
  'Firma': 90, 'En validación por Crédito': 95, 'Oportunidad Ganada': 100, 'Oportunidad Perdida': 0
};

const OpportunityDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Estados
  const [activeTab, setActiveTab] = useState('detalles');
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [opportunityData, setOpportunityData] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStage, setCurrentStage] = useState('Negociación');
  const [probability, setProbability] = useState(PROBABILITIES['Negociación']);

  // Cargar datos del Backend
  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        // ✅ URL CORRECTA (Sin dos puntos antes del ID)
        const response = await axios.get(`http://localhost:8000/opportunities/${id}`);
        setOpportunityData(response.data);
        
        if (response.data.Etapa) {
             setCurrentStage(response.data.Etapa);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error cargando oportunidad:", error);
        setLoading(false);
      }
    };

    if (id) fetchOpportunity();
  }, [id]);

  // Recalcular probabilidad
  useEffect(() => {
    setProbability(PROBABILITIES[currentStage] ?? 0);
  }, [currentStage]);

  // Botón Siguiente
  const handleNextStage = () => {
    const currentIndex = STAGES.indexOf(currentStage);
    if (currentIndex >= 0 && currentIndex < 6) {
      setCurrentStage(STAGES[currentIndex + 1]);
    }
  };

  const isFinalStage = ['Oportunidad Ganada', 'Oportunidad Perdida'].includes(currentStage);
  
  // Datos dummy de cotizaciones (Ahora sí se usan abajo para quitar el warning)
  const quotesList = [
    { id: "COT-2024-003", concepto: "Propuesta Final v2", fecha: "10 Oct 2023", total: 125000, estado: "Aceptada" },
    { id: "COT-2024-002", concepto: "Propuesta Inicial", fecha: "05 Oct 2023", total: 130000, estado: "Enviada" },
  ];

  // Estilos
  const labelStyle = "block text-xs font-bold text-gray-500 uppercase mb-1";
  const inputStyle = "block w-full rounded-lg border-gray-300 bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2.5 px-3 border";
  const readOnlyValueStyle = "text-base font-medium text-gray-900 py-1";

  if (loading) return <div className="p-10 text-center">Cargando información...</div>;
  if (!opportunityData) return <div className="p-10 text-center text-red-500">No se encontró la oportunidad</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-800 flex items-center gap-2 mb-4 text-sm font-medium transition-colors">
          <ArrowLeft size={16} /> Volver a la Cuenta
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900"> {opportunityData.Nombre_Oportunidad || "Oportunidad sin nombre"}</h1>
            <div className="flex items-center gap-3">
                 <BadgeFolio tipo="oportunidad" folio={opportunityData.Folio} />
                 <span className="text-gray-400 text-sm">| {opportunityData.Cliente}</span>
            </div>
          </div>

          <div className="flex gap-2 mt-2 md:mt-0">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700 transition-colors">
              <Edit size={16} /> Editar
            </button>
            
            {!isFinalStage && (
              <button onClick={handleNextStage} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700 transition-colors">
                <ArrowRight size={16} /> Siguiente Etapa
              </button>
            )}

            <button onClick={() => setCurrentStage('Oportunidad Perdida')} className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm font-bold text-red-700 hover:bg-red-100 transition-colors">
              <ThumbsDown size={16} /> Cerrar Perdida
            </button>
            <button onClick={() => setCurrentStage('Oportunidad Ganada')} className="flex items-center gap-2 px-4 py-2 bg-green-600 border border-green-600 rounded-lg text-sm font-bold text-white hover:bg-green-700 shadow-sm transition-colors">
              <CheckCircle size={16} /> Cerrar Ganada
            </button>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 mt-2">
            <BarraProgreso etapaActual={currentStage} />
        </div>
      </div>

      {/* KPIS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sm font-medium text-gray-500 mb-1">Valor Estimado</p>
            <h2 className="text-3xl font-bold text-gray-900">${opportunityData.Valor?.toLocaleString() || 0} MXN</h2>
            <p className="text-xs font-medium text-green-600 mt-1 flex items-center gap-1">↗ +5% vs objetivo</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-full text-blue-600 relative z-10"><DollarSign size={24} /></div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Probabilidad</p>
            <h2 className="text-3xl font-bold text-gray-900">{probability}%</h2>
            <div className="w-24 h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-purple-600 rounded-full" style={{ width: `${probability}%` }}></div>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-full text-purple-600"><PieChart size={24} /></div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Fecha de Cierre</p>
            <h2 className="text-3xl font-bold text-gray-900">{opportunityData.Fecha_Cierre}</h2>
            <p className="text-xs font-medium text-orange-600 mt-1 flex items-center gap-1">⏱ En proceso</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-full text-orange-600"><Calendar size={24} /></div>
        </div>
      </div>

      {/* PESTAÑAS */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm min-h-[500px]">
        <div className="border-b border-gray-200 px-6 flex gap-8">
          {['detalles', 'cotizaciones', 'actividad', 'archivos'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 text-sm font-medium border-b-2 transition-colors capitalize flex items-center gap-2
                ${activeTab === tab 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              {tab === 'cotizaciones' && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-bold ml-1">3</span>}
              {tab}
            </button>
          ))}
        </div>

        <div className="p-8">
          {activeTab === 'detalles' && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Tag className="text-blue-600" size={20}/>
                <h3 className="text-lg font-bold text-gray-900">Información de la Oportunidad</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-6 mb-8">
                <div>
                  <label className={labelStyle}>Folio Oportunidad</label>
                  <div className="mt-1"><BadgeFolio tipo="oportunidad" folio={opportunityData.Folio} /></div>
                </div>
                <div className="lg:col-span-2">
                  <label className={labelStyle}>Nombre de la Oportunidad</label>
                  <div className={readOnlyValueStyle}>{opportunityData.Nombre_Oportunidad}</div>
                </div>
                <div className="lg:col-span-2">
                  <label className={labelStyle}>Cuenta / Razón Social</label>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="text-gray-400" size={18}/>
                    <span className={readOnlyValueStyle}>{opportunityData.Cliente}</span>
                    <BadgeFolio tipo="cuenta" folio="C-9982" />
                  </div>
                </div>
                <div>
                   <label className={labelStyle}>Propietario</label>
                   <div className="flex items-center gap-2 mt-1">
                     <User className="text-gray-400" size={18}/>
                     <span className={readOnlyValueStyle}>{opportunityData.Propietario}</span>
                   </div>
                </div>
                <div>
                   <label className={labelStyle}>Tipo de Oportunidad</label>
                   <div className={readOnlyValueStyle}>{opportunityData.Tipo_Op}</div>
                </div>
                <div>
                   <label className={labelStyle}>Etapa Actual</label>
                   <div className={readOnlyValueStyle}>{currentStage}</div>
                </div>
                <div>
                   <label className={labelStyle}>Fecha de Cierre Estimada</label>
                   <div className={readOnlyValueStyle}>{opportunityData.Fecha_Cierre}</div>
                </div>
                <div>
                   <label className={labelStyle}>Cantidad de Líneas</label>
                   <div className={readOnlyValueStyle}>{opportunityData.Cantidad_Lineas}</div>
                </div>
                <div>
                   <label className={labelStyle}>Canal de Ventas</label>
                   <div className={readOnlyValueStyle}>{opportunityData.Canal_Ventas}</div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h4 className="text-sm font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">Información Adicional</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelStyle}>Motivo de Pérdida</label>
                        <textarea className={inputStyle} rows={3} placeholder="Ingrese el motivo..." />
                    </div>
                    <div>
                        <label className={labelStyle}>Submotivo de Cuenta</label>
                        <input className={inputStyle} placeholder="Detalle específico..." />
                    </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cotizaciones' && (
            <div>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Gestión de Cotizaciones</h3>
                  <p className="text-sm text-gray-500">Historial de documentos generados.</p>
                </div>
                <button onClick={() => setIsQuoteOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-all">
                  <Plus size={18} /> Nueva Cotización
                </button>
              </div>

              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Referencia</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Concepto</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Importe</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Estado</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {quotesList.map((q) => (
                      <tr key={q.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4"><BadgeFolio tipo="cotizacion" folio={q.id} /></td>
                        <td className="px-6 py-4"><div className="text-sm font-bold text-gray-900">{q.concepto}</div></td>
                        <td className="px-6 py-4 text-sm text-gray-500">{q.fecha}</td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">${q.total.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${q.estado === 'Aceptada' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{q.estado}</span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <button className="text-gray-400 hover:text-gray-600"><FileText size={18}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === 'actividad' && <div className="text-center py-20 text-gray-400">Log de llamadas y notas.</div>}
          {activeTab === 'archivos' && <div className="text-center py-20 text-gray-400">Documentos adjuntos.</div>}
        </div>
      </div>

      <QuoteBuilder isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} opportunity={opportunityData} />
    </div>
  );
};

export default OpportunityDetail;