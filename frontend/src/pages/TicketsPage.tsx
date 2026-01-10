import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import { 
  Ticket, AlertCircle, MessageSquare, Plus, Search, 
  Download, Settings, ChevronLeft, ChevronRight, MoreHorizontal, 
  TrendingUp, Clock, User, ArrowUpRight, X, ArrowUpDown,
  Check, FileText, Lock, Send, Paperclip, Calendar
} from 'lucide-react';
import { API_URL } from '../config';
import { useTickets } from '../hooks/useTickets';

// --- CONFIGURACIÓN DE ESTADOS ---
const ESTADOS_INCIDENCIA = [
  "Nuevo", "Asignado", "En Espera", "Resuelto", "Cerrado", "Reabierto", "Cancelado"
];

const ESTADOS_REQUERIMIENTO = [
  "En ingreso", "En Trámite", "Pendiente de Información", "En Revisión", 
  "Turnado a Área Externa", "En Suspensión", "Resuelto", "Cerrado"
];

// Unión de todos los estados para el filtro general
const TODOS_LOS_ESTADOS = Array.from(new Set([...ESTADOS_INCIDENCIA, ...ESTADOS_REQUERIMIENTO]));

const TicketsPage = () => {
  const { 
    tickets, currentTickets, uniqueAgents, fetchTickets, 
    filters, setFilters, pagination, pageHandlers, 
    sortConfig, handleSort 
  } = useTickets();

  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [movements, setMovements] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [composerTab, setComposerTab] = useState<'public' | 'internal'>('public');
  
  const [accountsCache, setAccountsCache] = useState<any[]>([]);
  
  const location = useLocation();
  const CURRENT_USER = "Marcos Victor de la O Cano"; 

  useEffect(() => {
    const loadAccounts = async () => {
        try {
            const res = await axios.get(`${API_URL}/accounts/`);
            setAccountsCache(res.data);
        } catch (error) {
            console.error("Error cargando cuentas:", error);
        }
    };
    loadAccounts();
  }, []);

  useEffect(() => {
    if (location.state?.ticketId && tickets.length > 0) {
      const t = tickets.find((ticket: any) => String(ticket.ID) === String(location.state.ticketId));
      if (t) setActiveTicket(t);
    }
  }, [tickets, location.state]);

  useEffect(() => {
    if (activeTicket?.ID) {
      fetchMovements(activeTicket.ID);
      setNewStatus(activeTicket.Estado);
      setComposerTab('public');
    }
  }, [activeTicket?.ID]);

  const getEnrichedTicket = (t: any) => {
    if (!t) return null;
    const linkedAccount = accountsCache.find(a => String(a.ID) === String(t.Cuenta_ID || t.ID_Cuenta));
    const clientName = t.Nombre_Cuenta || t.Cliente || linkedAccount?.Nombre_Cuenta || 'Desconocido';
    const contactName = t.Contacto || t.Nombre_Representante || linkedAccount?.Nombre_Representante || 'Sin Contacto';

    return {
        ...t,
        displayName: clientName,
        displayContact: contactName,
        linkedAccount: linkedAccount
    };
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
      const movementId = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Date.now().toString();
      await axios.post(`${API_URL}/tickets/${activeTicket.ID}/movements`, {
        ID: movementId, ID_Ticket: activeTicket.ID, Usuario: CURRENT_USER,
        Nota: composerTab === 'internal' ? `INTERNAL: ${newNote}` : newNote, Nuevo_Estado: newStatus
      });
      alert("Ticket actualizado"); setNewNote(''); fetchTickets(); fetchMovements(activeTicket.ID);
      setActiveTicket((prev: any) => ({...prev, Estado: newStatus}));
    } catch (e) { console.error(e); alert("Error al actualizar"); }
  };

  const handleSelfAssign = async () => {
    if (!activeTicket) return;
    try {
      // Lógica inteligente: Si es Incidencia pasa a "Asignado", si es Requerimiento pasa a "En Trámite"
      const nextState = activeTicket.Tipo1 === 'Requerimiento' ? 'En Trámite' : 'Asignado';
      
      await axios.put(`${API_URL}/tickets/${activeTicket.ID}`, { ...activeTicket, Agente: CURRENT_USER, Estado: nextState });
      alert(`Ticket asignado a ${CURRENT_USER}`);
      setActiveTicket({ ...activeTicket, Agente: CURRENT_USER, Estado: nextState }); fetchTickets(); 
    } catch (e) { console.error(e); alert("Error al autoasignar"); }
  };

  const getSLAState = (ticket: any) => {
    if (!ticket.Fecha) return { label: 'N/A', isUrgent: false };
    const deadline = new Date(ticket.Fecha); deadline.setHours(23, 59, 59);
    const now = new Date(); const diff = deadline.getTime() - now.getTime();
    const isUrgent = diff < (24 * 60 * 60 * 1000); 
    if (diff < 0) return { label: 'Vencido', isUrgent: true };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24)); const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { label: `${days}d ${hours}h`, isUrgent };
  };

  const openTickets = tickets.filter((t: any) => !['Cerrado', 'Cancelado', 'Resuelto'].includes(t.Estado)).length;
  const criticalTickets = tickets.filter((t: any) => (t.Prioridad || '').includes('Urgente') || (t.Prioridad || '').includes('Crítica')).length;
  const unassignedTickets = tickets.filter((t: any) => !t.Agente || t.Agente === 'Sin Asignar').length;
  const slaRisk = tickets.filter((t: any) => { if (['Resuelto', 'Cerrado', 'Cancelado'].includes(t.Estado)) return false; return getSLAState(t).isUrgent; }).length;

  const handleKPIClick = (type: string) => {
    setFilters.setSearch(''); 
    switch(type) {
      case 'open': setFilters.setStatus('Todos'); setFilters.setPriority('Todas'); setFilters.setAgent('Todos'); break; // Simplificado
      case 'critical': setFilters.setPriority('Crítica'); setFilters.setStatus('Todos'); setFilters.setAgent('Todos'); break;
      case 'sla': setFilters.setStatus('Todos'); setFilters.setPriority('Todas'); setFilters.setAgent('Todos'); handleSort('Fecha'); break;
      case 'unassigned': setFilters.setAgent('Sin Asignar'); setFilters.setStatus('Todos'); setFilters.setPriority('Todas'); break;
    }
  };

  const kpis = [
    { id: 'open', title: "Tickets Activos", value: openTickets, trend: "+12%", color: "text-[#BF0CEA]", bg: "bg-[#BF0CEA]/10", icon: <Ticket size={20} /> },
    { id: 'critical', title: "Prioridad Crítica", value: criticalTickets, trend: "+5%", color: "text-[#E72E70]", bg: "bg-[#E72E70]/10", icon: <AlertCircle size={20} /> },
    { id: 'sla', title: "SLA en Riesgo", value: slaRisk, trend: "-2%", color: "text-[#FF8226]", bg: "bg-[#FF8226]/10", icon: <Clock size={20} /> },
    { id: 'unassigned', title: "Sin Asignar", value: unassignedTickets, trend: "0%", color: "text-gray-600", bg: "bg-gray-50", icon: <User size={20} /> },
  ];

  const getPriorityBadge = (p: string) => {
    const priority = (p || '').toLowerCase();
    if (priority.includes('urgente') || priority.includes('crítica')) return 'bg-[#E72E70]/10 text-[#E72E70] border-[#E72E70]/20';
    if (priority.includes('alta')) return 'bg-[#FF8226]/10 text-[#FF8226] border-[#FF8226]/20';
    return 'bg-gray-50 text-gray-600 border-gray-200';
  };

  // --- LÓGICA DE COLORES DE ESTADO ACTUALIZADA ---
  const getStatusStyle = (s: string) => {
    switch(s) {
      // INICIO (Azules)
      case 'Nuevo':
      case 'En ingreso': 
        return { color: 'text-[#BF0CEA] bg-[#BF0CEA]/10 border-[#BF0CEA]/20', progress: 'w-[10%] bg-[#BF0CEA]' };
      
      // PROCESO (Morados/Indigo)
      case 'Asignado':
      case 'En Trámite':
      case 'Turnado a Área Externa':
        return { color: 'text-[#BF0CEA] bg-[#BF0CEA]/10 border-[#BF0CEA]/20', progress: 'w-[50%] bg-[#BF0CEA]' };
      
      // ESPERA/PENDIENTE (Naranjas/Ambar)
      case 'En Espera':
      case 'Pendiente de Información':
      case 'En Revisión':
      case 'En Suspensión':
        return { color: 'text-[#FF8226] bg-[#FF8226]/10 border-[#FF8226]/20', progress: 'w-[50%] bg-[#FF8226]' };

      // ALERTA (Rojos/Rosas)
      case 'Reabierto':
        return { color: 'text-[#E72E70] bg-[#E72E70]/10 border-[#E72E70]/20', progress: 'w-[20%] bg-[#E72E70]' };

      // FINALIZADO EXITOSO (Verdes)
      case 'Resuelto': 
        return { color: 'text-emerald-700 bg-emerald-50 border-emerald-100', progress: 'w-[90%] bg-emerald-500' };
      
      // CERRADO/CANCELADO (Grises)
      case 'Cerrado':
      case 'Cancelado':
        return { color: 'text-gray-700 bg-gray-50 border-gray-100', progress: 'w-full bg-gray-500' };
      
      default: return { color: 'text-gray-600 bg-gray-50 border-gray-100', progress: 'w-0' };
    }
  };

  const enrichedActiveTicket = activeTicket ? getEnrichedTicket(activeTicket) : null;
  const slaState = activeTicket ? getSLAState(activeTicket) : { label: 'N/A', isUrgent: false };

  // Helper para determinar qué opciones mostrar en el select
  const getStatusOptions = (tipo: string) => {
    if (tipo === 'Requerimiento') return ESTADOS_REQUERIMIENTO;
    return ESTADOS_INCIDENCIA; // Default para Incidencia o vacío
  };

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-[#BF0CEA]/5 min-h-screen font-sans text-gray-900">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gestión de Folios de Soporte</h1>
          <p className="text-gray-400 text-sm mt-1 font-medium">Administración centralizada de incidencias y requerimientos.</p>
        </div>
        <Link to="/tickets/create" className="bg-[#E72E70] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#be1b55] shadow-lg shadow-[#E72E70]/30 transition-all active:scale-95">
          <Plus size={18} /> Crear Nuevo Ticket
        </Link>
      </div>

      {/* KPIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, idx) => (
          <div key={idx} onClick={() => handleKPIClick(kpi.id)} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#BF0CEA]/30 transition-all cursor-pointer active:scale-[0.98]">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2.5 rounded-xl ${kpi.bg} ${kpi.color}`}>{kpi.icon}</div>
              <span className="flex items-center gap-1 text-[10px] font-bold bg-gray-50 px-2 py-1 rounded-full text-gray-500"><TrendingUp size={12} /> {kpi.trend}</span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{kpi.title}</p>
              <h3 className="text-3xl font-bold text-gray-800">{kpi.value}</h3>
            </div>
            <div className="mt-4 h-1 w-full bg-gray-50 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${kpi.color.replace('text', 'bg')} opacity-30`} style={{ width: '60%' }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* FILTROS */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Buscar por Folio, Asunto o Cliente..." value={filters.search} onChange={(e) => setFilters.setSearch(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#BF0CEA]/20 focus:border-[#BF0CEA] transition-all shadow-sm" />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
          <select value={filters.status} onChange={(e) => setFilters.setStatus(e.target.value)} className="bg-white border border-gray-200 text-gray-600 text-xs font-bold px-4 py-2.5 rounded-xl outline-none hover:border-[#BF0CEA] cursor-pointer shadow-sm transition-colors">
            <option value="Todos">Estado: Todos</option>
            {TODOS_LOS_ESTADOS.map(estado => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>
          <select value={filters.priority} onChange={(e) => setFilters.setPriority(e.target.value)} className="bg-white border border-gray-200 text-gray-600 text-xs font-bold px-4 py-2.5 rounded-xl outline-none hover:border-[#BF0CEA] cursor-pointer shadow-sm transition-colors"><option value="Todas">Prioridad: Todas</option><option value="Crítica">Crítica</option><option value="Alta">Alta</option><option value="Normal">Normal</option></select>
          <select value={filters.agent} onChange={(e) => setFilters.setAgent(e.target.value)} className="bg-white border border-gray-200 text-gray-600 text-xs font-bold px-4 py-2.5 rounded-xl outline-none hover:border-[#BF0CEA] cursor-pointer shadow-sm transition-colors"><option value="Todos">Agente: Todos</option>{uniqueAgents.map((agent: any) => <option key={agent} value={agent}>{agent}</option>)}</select>
        </div>
      </div>

      {/* TABLA PRINCIPAL */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
              <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('ID')}>Folio ID <ArrowUpDown size={12} className="inline ml-1"/></th>
              <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('Cliente')}>Cliente <ArrowUpDown size={12} className="inline ml-1"/></th>
              <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('Titulo')}>Asunto <ArrowUpDown size={12} className="inline ml-1"/></th>
              <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('Prioridad')}>Prioridad <ArrowUpDown size={12} className="inline ml-1"/></th>
              <th className="px-6 py-4">Asignado a</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {currentTickets.map((t: any) => {
              const statusStyle = getStatusStyle(t.Estado);
              const priorityClass = getPriorityBadge(t.Prioridad);
              const enriched = getEnrichedTicket(t);
              
              return (
                <tr key={t.ID} onClick={() => setActiveTicket(t)} className="hover:bg-[#BF0CEA]/5 hover:shadow-sm transition-all cursor-pointer group">
                  <td className="px-6 py-4"><span className="font-mono text-xs font-bold text-[#FF8226]">#{t.ID}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#BF0CEA]/10 to-[#E72E70]/10 text-[#BF0CEA] flex items-center justify-center text-xs font-bold border border-[#BF0CEA]/20 shadow-sm">{enriched.displayName.charAt(0)}</div>
                      <div>
                        <div className="text-sm font-bold text-gray-800">{enriched.displayName}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1"><User size={10} /> {enriched.displayContact}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <div className="text-sm font-bold text-gray-800 truncate">{t.Titulo}</div>
                      <div className="text-xs text-gray-500 truncate mt-0.5">{t.Notas || '...'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${priorityClass}`}>{t.Prioridad || 'Normal'}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {t.Agente ? <><div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 border border-white shadow-sm">{t.Agente.charAt(0)}</div><span className="text-xs font-medium text-gray-600">{t.Agente.split(' ')[0]}</span></> : <span className="text-xs text-gray-400 italic">Sin asignar</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase border mb-1.5 ${statusStyle.color}`}>{t.Estado}</div>
                  </td>
                  <td className="px-6 py-4 text-right"><MoreHorizontal size={18} className="text-gray-300 group-hover:text-[#BF0CEA] transition-colors" /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      <div className="flex justify-between items-center mt-6">
        <p className="text-xs text-gray-400 font-medium">Mostrando {currentTickets.length > 0 ? pagination.startIndex + 1 : 0}-{Math.min(pagination.startIndex + pagination.itemsPerPage, pagination.totalResults)} de {pagination.totalResults}</p>
        <div className="flex gap-2">
          <button onClick={pageHandlers.prev} disabled={pagination.currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-white hover:text-[#BF0CEA] hover:border-[#BF0CEA]/30 transition-all bg-white disabled:opacity-50"><ChevronLeft size={16} /></button>
          <button onClick={pageHandlers.next} disabled={pagination.currentPage === pagination.totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-white hover:text-[#BF0CEA] hover:border-[#BF0CEA]/30 transition-all bg-white disabled:opacity-50"><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* DRAWER DETALLES */}
      {enrichedActiveTicket && (
        <div className="fixed inset-0 z-50 flex justify-end bg-gray-900/20 backdrop-blur-sm transition-all" onClick={() => setActiveTicket(null)}>
          <div className="w-full max-w-6xl bg-gray-50 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Header Drawer */}
            <div className="bg-gray-50/80 backdrop-blur-xl border-b border-gray-200 px-8 py-5 flex justify-between items-start shrink-0">
              <div>
                <div className="flex gap-2 mb-3">
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border ${getPriorityBadge(enrichedActiveTicket.Prioridad)}`}>{enrichedActiveTicket.Prioridad || 'Normal'}</span>
                  {/* Aquí también aplicamos el estilo dinámico al badge */}
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border ${getStatusStyle(enrichedActiveTicket.Estado).color}`}>{enrichedActiveTicket.Estado}</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1 leading-tight">{enrichedActiveTicket.Titulo}</h1>
                <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                  <span className="flex items-center gap-1 text-[#FF8226]"><Ticket size={12}/> ID: #{enrichedActiveTicket.ID}</span>
                  <span className="flex items-center gap-1"><Calendar size={12}/> {enrichedActiveTicket.Fecha || 'Fecha desconocida'}</span>
                  <span className="flex items-center gap-1"><User size={12}/> {enrichedActiveTicket.displayName}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveTicket(null)} className="p-2 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-700 transition-colors ml-2"><X size={20} /></button>
              </div>
            </div>

            {/* Body Drawer */}
            <div className="flex-1 overflow-y-auto p-8 bg-white">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col */}
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider mb-4 text-gray-800">Detalles del Ticket</h3>
                    
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Cliente</label>
                        <p className="text-sm font-bold text-gray-800">{enrichedActiveTicket.displayName}</p>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Contacto</label>
                        <p className="text-sm font-medium text-gray-800">{enrichedActiveTicket.displayContact}</p>
                    </div>

                    <div><label className="text-[10px] font-bold text-gray-500 uppercase">Categoría</label><p className="text-sm font-medium text-gray-600">{enrichedActiveTicket.Tipo1} • {enrichedActiveTicket.Tipo2 || 'General'}</p></div>
                    
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Asignado a</label>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 border border-white shadow-sm">{enrichedActiveTicket.Agente ? enrichedActiveTicket.Agente.charAt(0) : '?'}</div>
                        <span className="text-sm font-medium text-gray-700">{enrichedActiveTicket.Agente || 'Sin asignar'}</span>
                      </div>
                      {!enrichedActiveTicket.Agente && <button onClick={handleSelfAssign} className="mt-2 text-xs text-[#BF0CEA] font-bold hover:underline flex items-center gap-1 cursor-pointer"><User size={12} /> Asignarme a mí</button>}
                    </div>

                    <div className={`p-3 rounded-lg border ${slaState.isUrgent ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Clock size={14} className={slaState.isUrgent ? 'text-red-500' : 'text-gray-400'} />
                        <span className={`text-[10px] font-bold uppercase ${slaState.isUrgent ? 'text-red-600' : 'text-gray-500'}`}>SLA Restante</span>
                      </div>
                      <p className={`text-lg font-bold ${slaState.isUrgent ? 'text-red-700' : 'text-gray-700'}`}>{slaState.label}</p>
                    </div>
                  </div>

                  {/* Adjuntos */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="text-xs font-bold text-blue-900/40 uppercase tracking-wider mb-4">Adjuntos</h3>
                    {enrichedActiveTicket.Adjunto_Nombre ? (
                      <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                        <div className="p-2 bg-[#BF0CEA]/10 text-[#BF0CEA] rounded-lg"><FileText size={16}/></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-700 truncate">{enrichedActiveTicket.Adjunto_Nombre}</p>
                          <p className="text-[10px] text-gray-400">Archivo Adjunto</p>
                        </div>
                        <a href={`${API_URL}/tickets/${enrichedActiveTicket.ID}/download`} target="_blank" rel="noreferrer"><Download size={14} className="text-gray-300 hover:text-gray-600"/></a>
                      </div>
                    ) : <p className="text-xs text-gray-400 italic">No hay archivos.</p>}
                  </div>
                </div>

                {/* Right Col (Main) */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="text-xs font-bold text-blue-900/40 uppercase tracking-wider mb-4">Descripción</h3>
                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">{enrichedActiveTicket.Notas}</div>
                  </div>

                  {/* Composer */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="flex border-b border-gray-100">
                      <button onClick={() => setComposerTab('public')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 ${composerTab === 'public' ? 'bg-white text-[#E72E70] border-b-2 border-[#E72E70]' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors'}`}><MessageSquare size={14}/> Respuesta Pública</button>
                      <button onClick={() => setComposerTab('internal')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 ${composerTab === 'internal' ? 'bg-[#FF8226]/10 text-[#FF8226] border-b-2 border-[#FF8226]' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors'}`}><Lock size={14}/> Nota Interna</button>
                    </div>
                    <div className={`p-4 ${composerTab === 'internal' ? 'bg-[#FF8226]/5' : 'bg-white'}`}>
                      <textarea className="w-full min-h-[120px] p-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#BF0CEA]" placeholder={composerTab === 'internal' ? "Nota interna..." : "Respuesta al cliente..."} value={newNote} onChange={e => setNewNote(e.target.value)} />
                      <div className="flex justify-between items-center mt-3">
                        <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"><Paperclip size={18}/></button>
                        <div className="flex gap-3 items-center">
                          {/* SELECTOR DE ESTADO DINÁMICO */}
                          <select 
                            value={newStatus} 
                            onChange={e => setNewStatus(e.target.value)} 
                            className="text-xs font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none hover:border-[#BF0CEA] transition-colors"
                          >
                            {getStatusOptions(enrichedActiveTicket.Tipo1).map(estado => (
                              <option key={estado} value={estado}>{estado}</option>
                            ))}
                          </select>
                          <button onClick={handleUpdate} className={`px-6 py-2 rounded-xl text-white text-sm font-bold shadow-md flex items-center gap-2 hover:shadow-lg transition-all active:scale-95 ${composerTab === 'internal' ? 'bg-[#FF8226] hover:bg-[#e57622]' : 'bg-[#E72E70] hover:bg-[#be1b55]'}`}><Send size={16}/> Enviar</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="relative pl-4 space-y-8 before:absolute before:left-[27px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                    {movements.map((m: any, idx) => {
                      const isSystem = !!m.Nuevo_Estado && (!m.Nota || m.Nota.startsWith('Ticket creado'));
                      const isInternal = m.Nota && m.Nota.includes('INTERNAL:');
                      const cleanNote = isInternal ? m.Nota.replace('INTERNAL: ', '') : m.Nota;
                      return (
                        <div key={idx} className="relative flex gap-4 group">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold z-10 border-4 border-gray-50 shadow-sm ${isSystem ? 'bg-gray-100 text-gray-500' : 'bg-white text-[#BF0CEA]'}`}>
                            {isSystem ? <Settings size={16}/> : (m.Usuario ? m.Usuario.charAt(0) : 'U')}
                          </div>
                          {isSystem ? (
                            <div className="py-2"><p className="text-xs text-gray-500 font-medium"><span className="font-bold text-gray-700">{m.Usuario}</span> cambió estado a <span className="font-bold text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded">{m.Nuevo_Estado}</span></p><span className="text-[10px] text-gray-400">{m.Fecha}</span></div>
                          ) : (
                            <div className={`flex-1 p-4 rounded-2xl border shadow-sm ${isInternal ? 'bg-[#FF8226]/10 border-[#FF8226]/20' : 'bg-white border-gray-100'}`}>
                              <div className="flex justify-between items-start mb-2"><div className="flex items-center gap-2"><span className="text-sm font-bold text-gray-800">{m.Usuario}</span>{isInternal && <span className="text-[10px] font-bold text-[#FF8226] flex items-center gap-1"><Lock size={10}/> Interno</span>}</div><span className="text-[10px] text-gray-400">{m.Fecha}</span></div>
                              <p className="text-sm text-gray-700 leading-relaxed">{cleanNote}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsPage;