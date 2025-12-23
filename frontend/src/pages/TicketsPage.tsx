import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Ticket, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { API_URL } from '../config';

const TicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [movements, setMovements] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (activeTicket) {
      fetchMovements(activeTicket.ID);
      setNewStatus(activeTicket.Estado);
    }
  }, [activeTicket]);

  const fetchTickets = async () => {
    try {
      const res = await axios.get(`${API_URL}/tickets/`);
      setTickets(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchMovements = async (id: string) => {
    try {
      const res = await axios.get(`${API_URL}/tickets/${id}/movements`);
      setMovements(res.data);
    } catch (e) { console.error(e); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote) return alert("Escribe una nota.");
    
    try {
      await axios.post(`${API_URL}/tickets/${activeTicket.ID}/movements`, {
        Usuario: "Marcos Victor de la O Cano", // Hardcoded current user
        Nota: newNote,
        Nuevo_Estado: newStatus
      });
      alert("Ticket actualizado");
      setNewNote('');
      fetchTickets();
      fetchMovements(activeTicket.ID);
      // Update local state for immediate feedback
      setActiveTicket({...activeTicket, Estado: newStatus});
    } catch (e) {
      console.error(e);
      alert("Error al actualizar");
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6">
      {/* List */}
      <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-bold text-gray-700 flex items-center gap-2">
            <Ticket size={20} /> Bandeja de Entrada
          </h2>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-2">
          {tickets.map((t: any) => (
            <div 
              key={t.ID}
              onClick={() => setActiveTicket(t)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${activeTicket?.ID === t.ID ? 'bg-blue-50 border-att-blue shadow-sm' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-gray-800 text-sm">{t.Titulo}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${t.Estado === 'Abierto' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {t.Estado}
                </span>
              </div>
              <div className="text-xs text-gray-500 flex justify-between">
                <span>{t.ID}</span>
                <span>{t.Prioridad}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        {activeTicket ? (
          <>
            <div className={`p-6 border-b border-gray-100 ${activeTicket.Prioridad === 'Urgente' ? 'bg-red-50' : 'bg-white'}`}>
               <div className="flex justify-between items-start">
                 <div>
                   <h1 className="text-2xl font-bold text-gray-800 mb-2">{activeTicket.Titulo}</h1>
                   <div className="flex gap-4 text-sm text-gray-600">
                     <span className="flex items-center gap-1"><Ticket size={14}/> {activeTicket.ID}</span>
                     <span className="flex items-center gap-1 font-medium"><AlertCircle size={14}/> {activeTicket.Prioridad}</span>
                   </div>
                 </div>
                 <div className="text-right">
                   <div className="text-xs text-gray-500 uppercase font-bold">Cliente</div>
                   <div className="font-medium">{activeTicket.Cliente}</div>
                   <div className="text-sm text-gray-500">{activeTicket.Línea_Móvil}</div>
                 </div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
               <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
                 <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Descripción Inicial</h3>
                 <p className="text-gray-700 whitespace-pre-wrap">{activeTicket.Notas}</p>
                 <div className="mt-4 pt-4 border-t border-gray-50 text-xs text-gray-400">
                    Tipificación: {activeTicket.Tipo1} / {activeTicket.Tipo2} / {activeTicket.Tipo3}
                 </div>
               </div>

               <div className="space-y-4">
                 {movements.map((m: any, idx) => (
                   <div key={idx} className="flex gap-3">
                      <div className="mt-1">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                          {m.Usuario.substring(0,2).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-sm text-gray-800">{m.Usuario}</span>
                          <span className="text-xs text-gray-400">{m.Fecha}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">{m.Nota}</p>
                        {m.Nuevo_Estado && <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded">Cambio a: {m.Nuevo_Estado}</span>}
                      </div>
                   </div>
                 ))}
               </div>
            </div>

            <div className="p-4 bg-white border-t border-gray-200">
              <form onSubmit={handleUpdate} className="flex gap-4 items-start">
                 <div className="flex-1">
                   <textarea 
                     className="input-field h-20 py-2 resize-none bg-gray-50" 
                     placeholder="Escribe una nota de seguimiento..."
                     value={newNote}
                     onChange={e => setNewNote(e.target.value)}
                   />
                 </div>
                 <div className="w-48 space-y-2">
                   <select 
                     className="input-field h-9 text-sm"
                     value={newStatus}
                     onChange={e => setNewStatus(e.target.value)}
                   >
                     <option>Abierto</option>
                     <option>En proceso</option>
                     <option>Escalado a BO</option>
                     <option>Resuelto</option>
                     <option>Cerrado Sí Procede</option>
                   </select>
                   <button type="submit" className="btn-primary w-full text-sm py-1.5 h-9 flex items-center justify-center gap-2">
                     <MessageSquare size={16} /> Enviar
                   </button>
                 </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <Ticket size={64} className="mb-4 opacity-20" />
            <p>Selecciona un ticket para ver el detalle</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketsPage;
