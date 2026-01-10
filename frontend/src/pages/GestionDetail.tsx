import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import {
  ArrowLeft, Edit, ArrowRight, Building2, User, Tag, 
  History, Check, X, FileText, Calendar, 
  AlertCircle, ClipboardList, Clock
} from 'lucide-react';

import { STAGES, STATUS_CANCELED } from '../constants';
import GestionForm from '../components/GestionForm';
import BarraProgreso from '../components/BarraProgreso';

const GestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [gestion, setGestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'detalles' | 'historial'>('detalles');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  
  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. GESTIÓN (Antes Opportunities)
      let foundGestion = null;
      try {
        // Ajusta el endpoint según tu backend (ej. /gestiones o /gestion_operativa)
        const res = await axios.get(`${API_URL}/gestiones/${id}`);
        foundGestion = res.data;
      } catch {
        // Fallback porsi usas json-server y busca por lista
        const all = await axios.get(`${API_URL}/gestiones/`);
        foundGestion = (all.data || []).find((o: any) => String(o.id) === String(id));
      }
      setGestion(foundGestion);

      // 2. HISTORIAL
      try {
        const histRes = await axios.get(`${API_URL}/gestiones/${id}/history`);
        const hist = Array.isArray(histRes.data) ? histRes.data : [];
        setHistory(hist.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      } catch { setHistory([]); }

    } catch (err) {
      console.error('Error cargando gestión:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGestion = async (data: any) => {
    try {
      // Limpieza de datos antes de enviar
      const { id: _id, created_at, ...clean } = data;
      try { await axios.put(`${API_URL}/gestiones/${id}`, clean); } catch { await axios.put(`${API_URL}/gestiones/${id}/`, clean); }
      setIsEditModalOpen(false);
      fetchData();
    } catch { alert('Error al guardar la gestión'); }
  };

  const handleStageChange = async (newStage: string) => {
    if (!gestion) return;
    try {
      setGestion((prev: any) => ({ ...prev, etapa: newStage }));
      
      const payload = { ...gestion, etapa: newStage };
      // Limpiamos ID para evitar errores de update
      delete payload.id; 
      
      try { await axios.put(`${API_URL}/gestiones/${id}`, payload); } catch { await axios.put(`${API_URL}/gestiones/${id}/`, payload); }
      
      // Registrar en historial
      try {
        await axios.post(`${API_URL}/gestiones/${id}/history`, {
          stage: newStage, 
          previous_stage: gestion.etapa, 
          timestamp: new Date().toISOString(), 
          description: `Cambio de etapa a ${newStage}`
        });
      } catch {}
      
      fetchData();
    } catch { fetchData(); }
  };

  const nextStage = (() => {
    if (!gestion) return null;
    const idx = STAGES.indexOf(gestion.etapa);
    // Lógica: Si no es el último y no está en estados finales
    // STAGES termina en 'Completada', así que length-2 es el penúltimo ('En Seguimiento')
    if (idx !== -1 && idx < STAGES.length - 2) { 
        // Simplemente devolvemos el siguiente en la lista lógica
        return STAGES[idx + 1];
    }
    return null;
  })();

  const isClosed = ['Completada', STATUS_CANCELED].includes(gestion?.etapa);
  // La última etapa operativa es la penúltima de la lista (antes de 'Completada')
  const isLastOperationalStage = gestion?.etapa === STAGES[STAGES.length - 2];

  // Helpers visuales
  const formatId = (val: any) => `GO-${Number(val).toString().padStart(5, '0')}`;
  
  const getPriorityColor = (p: string) => {
      switch(p) {
          case 'Alta': return 'text-red-600 bg-red-50 border-red-100';
          case 'Media': return 'text-orange-600 bg-orange-50 border-orange-100';
          default: return 'text-slate-600 bg-slate-50 border-slate-100';
      }
  };

  if (loading) return <div className="p-20 text-center text-gray-400 italic">Cargando gestión...</div>;
  if (!gestion) return <div className="p-20 text-center text-red-500 font-bold">Gestión no encontrada</div>;

  return (
    <div className="p-8 max-w-[1600px] mx-auto bg-gray-50 min-h-screen font-sans text-gray-900">
      
      {/* HEADER */}
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-sm text-gray-400 hover:text-blue-600">
        <ArrowLeft size={16} className="mr-1" /> Volver
      </button>

      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-800">{formatId(gestion.id)}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPriorityColor(gestion.prioridad)}`}>
                Prioridad {gestion.prioridad}
            </span>
          </div>
          <p className="text-gray-500 mt-2 text-lg">{gestion.tipo_gestion}</p>
        </div>
        
        <div className="flex gap-2">
          {!isClosed && isLastOperationalStage && (
            <>
              <button onClick={() => handleStageChange('Completada')} className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-emerald-100 transition-colors">
                <Check size={16} /> Completar
              </button>
              <button onClick={() => handleStageChange(STATUS_CANCELED)} className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-red-100 transition-colors">
                <X size={16} /> Cancelar
              </button>
            </>
          )}
          {nextStage && !isClosed && (
            <button onClick={() => handleStageChange(nextStage)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-blue-700 shadow-md shadow-blue-200 transition-all">
                Avanzar a {nextStage} <ArrowRight size={16} />
            </button>
          )}
          <button onClick={() => setIsEditModalOpen(true)} className="bg-white border px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors text-gray-700">
            <Edit size={16} /> Editar
          </button>
        </div>
      </div>

      {/* Componente visual de etapas (Asegúrate de actualizar STAGES dentro de BarraProgreso o pásalos como prop) */}
      <BarraProgreso currentStage={gestion.etapa} onStageSelect={handleStageChange} />

      {/* KPIs NUEVOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
        
        {/* KPI 1: Tipo de Gestión */}
        <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <ClipboardList size={20} />
                    <p className="text-[10px] font-bold uppercase text-blue-400">Categoría</p>
                </div>
                <h3 className="text-xl font-bold text-gray-800 leading-tight">{gestion.tipo_gestion}</h3>
            </div>
        </div>

        {/* KPI 2: Prioridad */}
        <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 bg-orange-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 text-orange-600 mb-2">
                    <AlertCircle size={20} />
                    <p className="text-[10px] font-bold uppercase text-orange-400">Nivel de Urgencia</p>
                </div>
                <h3 className="text-3xl font-bold text-gray-800">{gestion.prioridad}</h3>
            </div>
        </div>

        {/* KPI 3: Fecha Compromiso */}
        <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <Calendar size={20} />
                    <p className="text-[10px] font-bold uppercase text-purple-400">Fecha Compromiso</p>
                </div>
                <h3 className="text-3xl font-bold text-gray-800">
                    {gestion.fecha_compromiso || "Por definir"}
                </h3>
                {/* Calculador de días restantes (opcional) */}
                {gestion.fecha_compromiso && (
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Clock size={12}/> Vence en {Math.ceil((new Date(gestion.fecha_compromiso).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} días
                    </p>
                )}
            </div>
        </div>
      </div>

      {/* TABS (Cotizaciones eliminado) */}
      <div className="flex gap-6 border-b mb-6 mt-6">
        {[ 
            { id: 'detalles', label: 'Detalles Operativos', icon: FileText }, 
            { id: 'historial', label: 'Historial de Cambios', icon: History } 
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`pb-3 text-xs font-bold uppercase flex items-center gap-2 transition-all ${activeTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
            <tab.icon size={16} />{tab.label}
          </button>
        ))}
      </div>

      {/* CONTENIDO */}
      <div className="bg-white rounded-xl border min-h-[400px] shadow-sm">
        
        {/* DETALLES */}
        {activeTab === 'detalles' && (
          <div className="p-8 grid md:grid-cols-2 gap-x-12 gap-y-8">
            
            {/* Sección Izquierda: Contexto */}
            <div className="space-y-6">
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Cuenta Relacionada</label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="bg-white p-2 rounded shadow-sm"><Building2 size={18} className="text-blue-500"/></div>
                        <p className="font-bold text-gray-700 text-sm">{gestion.nombre_cuenta || 'Sin asignar'}</p>
                    </div>
                </div>
                
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Solicitante</label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="bg-white p-2 rounded shadow-sm"><User size={18} className="text-blue-500"/></div>
                        <p className="font-bold text-gray-700 text-sm">{gestion.nombre_representante || 'No registrado'}</p>
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Clasificación</label>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                        <Tag size={16} className="text-gray-400"/>
                        {gestion.tipo_gestion}
                    </div>
                </div>
            </div>

            {/* Sección Derecha: Descripción */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 flex items-center gap-2">
                    <FileText size={12}/> Descripción del Requerimiento
                </label>
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                    {gestion.descripcion || "No se ha proporcionado una descripción detallada para esta gestión."}
                </div>
            </div>

          </div>
        )}

        {/* HISTORIAL */}
        {activeTab === 'historial' && (
          <div className="p-8 space-y-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Auditoría del proceso</h3>
            {history.length === 0 ? <p className="text-gray-400 italic text-sm">Sin movimientos registrados</p> : history.map((h, i) => (
              <div key={i} className="flex gap-4 relative group">
                {/* Línea conectora */}
                {i !== history.length - 1 && <div className="absolute left-[15px] top-8 bottom-[-24px] w-0.5 bg-gray-100 group-hover:bg-blue-50 transition-colors"></div>}
                
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${i===0 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                    <History size={14} />
                </div>
                
                <div className="pb-2">
                    <p className="text-sm font-bold text-gray-800">{h.stage}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(h.timestamp).toLocaleString()}</p>
                    {h.description && (
                        <div className="mt-2 text-xs text-gray-600 bg-gray-50 border border-gray-100 p-2 rounded max-w-md">
                            {h.description}
                        </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <GestionForm 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSave={handleSaveGestion} 
        initialData={gestion} 
      />
    </div>
  );
};

export default GestionDetail;