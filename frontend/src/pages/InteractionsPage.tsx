import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Phone, Search, Save, Clock } from 'lucide-react';
import { API_URL } from '../config';

const InteractionsPage = () => {
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [client, setClient] = useState<any>(null);
  const [form, setForm] = useState({ canal: 'Teléfono (Inbound)', tipo: 'Consulta de Saldo', detalle: '' });
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/interactions/`);
      setHistory(res.data);
    } catch (e) { console.error(e); }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.get(`${API_URL}/search/?term=${searchTerm}`);
      if (res.data && res.data.tipo === 'CLIENTE') {
        setClient(res.data);
        setStep(2);
      } else {
        alert("Cliente no encontrado o es prospecto.");
      }
    } catch (e) { alert("Error en búsqueda"); }
  };

  const handleSubmit = async () => {
    if (!form.detalle) return alert("Falta detalle");
    try {
      await axios.post(`${API_URL}/interactions/`, {
        ID_Servicio_FK: client.ID_Servicio,
        ID_Cuenta_FK: client.ID_Cliente,
        Fecha_Hora: new Date().toISOString().replace('T',' ').substring(0, 19),
        Canal_Atencion: form.canal,
        Tipo_Interaccion: form.tipo,
        Usuario_Registro: "Marcos Victor de la O Cano",
        Notas_Detalle: form.detalle
      });
      alert("Interacción registrada");
      setStep(1);
      setClient(null);
      setForm({ ...form, detalle: '' });
      fetchHistory();
    } catch (e) { alert("Error al guardar"); }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex gap-6 mb-8">
        <div className="flex-1">
           <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
             <Phone className="text-att-blue" /> Bitácora de Interacciones
           </h1>

           <div className="google-card mb-6">
             {step === 1 && (
               <div>
                 <h2 className="text-lg font-bold text-gray-700 mb-4">1. Identificar Cliente</h2>
                 <form onSubmit={handleSearch} className="flex gap-4">
                   <input 
                     className="input-field flex-1"
                     placeholder="Ingrese DN (10 dígitos)"
                     value={searchTerm}
                     onChange={e => setSearchTerm(e.target.value)}
                   />
                   <button type="submit" className="btn-primary">Buscar</button>
                 </form>
               </div>
             )}

             {step === 2 && client && (
               <div className="animate-fade-in-up">
                 <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6 flex justify-between items-center">
                    <div>
                      <div className="text-xs text-blue-600 font-bold uppercase">Cliente Identificado</div>
                      <div className="font-bold text-lg text-gray-800">{client.nombre}</div>
                      <div className="text-sm text-gray-600">DN: {client.linea_movil} | Plan: {client.Plan}</div>
                    </div>
                    <button onClick={() => setStep(1)} className="text-sm text-blue-600 hover:underline">Cambiar</button>
                 </div>

                 <h2 className="text-lg font-bold text-gray-700 mb-4">2. Registrar Detalle</h2>
                 <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-bold text-gray-500">Canal</label>
                      <select className="input-field" value={form.canal} onChange={e => setForm({...form, canal: e.target.value})}>
                        <option>Teléfono (Inbound)</option>
                        <option>Teléfono (Outbound)</option>
                        <option>Correo Electrónico</option>
                        <option>Chat Web</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-500">Tipo</label>
                      <select className="input-field" value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}>
                        <option>Consulta de Saldo</option>
                        <option>Solicitud de Soporte</option>
                        <option>Queja General</option>
                        <option>Venta/Renovación</option>
                      </select>
                    </div>
                 </div>
                 <textarea 
                   className="input-field h-32 py-3 mb-4 resize-none"
                   placeholder="Detalle de la conversación..."
                   value={form.detalle}
                   onChange={e => setForm({...form, detalle: e.target.value})}
                 />
                 <div className="flex justify-end gap-3">
                   <button onClick={() => setStep(1)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-full">Cancelar</button>
                   <button onClick={handleSubmit} className="btn-primary flex items-center gap-2">
                     <Save size={18} /> Guardar
                   </button>
                 </div>
               </div>
             )}
           </div>
        </div>

        <div className="w-80">
           <h3 className="font-bold text-gray-500 uppercase text-xs mb-4">Historial Reciente</h3>
           <div className="space-y-3">
             {history.slice(0, 5).map((h: any) => (
               <div key={h.ID} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                 <div className="flex justify-between items-center mb-1">
                   <span className="text-xs font-bold text-att-blue">{h.Canal_Atencion}</span>
                   <span className="text-[10px] text-gray-400">{h.Fecha_Hora.split(' ')[0]}</span>
                 </div>
                 <div className="font-medium text-sm text-gray-800 mb-1">{h.Tipo_Interaccion}</div>
                 <p className="text-xs text-gray-500 line-clamp-2">{h.Notas_Detalle}</p>
               </div>
             ))}
             {history.length === 0 && <p className="text-sm text-gray-400">Sin registros.</p>}
           </div>
        </div>
      </div>
    </div>
  );
};

export default InteractionsPage;
