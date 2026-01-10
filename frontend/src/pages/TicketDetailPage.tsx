import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Calendar, User, Tag, 
  AlertCircle, FileText, Download, Paperclip,
  Activity, Clock, CheckCircle
} from 'lucide-react';
import { API_URL } from '../config';

interface Ticket {
  ID: string;
  Titulo: string;
  Notas: string;
  Prioridad: string;
  Estado: string;
  Agente: string;
  Cuenta_ID: string;
  Nombre_Cuenta?: string;
  Tipo1: string;
  Fecha: string;
  Adjunto_Nombre?: string;
  Adjunto_Ruta?: string;
  Contacto?: string;
}

interface Movement {
  ID: string;
  ID_Ticket: string;
  Usuario: string;
  Nota: string;
  Fecha: string;
  Nuevo_Estado?: string;
}

const TicketDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await axios.get(`${API_URL}/tickets/${id}`);
        setTicket(response.data);
        
        const movResponse = await axios.get(`${API_URL}/tickets/${id}/movements`);
        setMovements(movResponse.data);
      } catch (error) {
        console.error("Error cargando ticket:", error);
        alert("No se pudo cargar la información del ticket.");
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchTicket();
  }, [id]);

  const handleDownload = async () => {
    if (!ticket?.ID || !ticket?.Adjunto_Nombre) return;
    
    try {
      const response = await axios.get(`${API_URL}/tickets/${ticket.ID}/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', ticket.Adjunto_Nombre);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error descargando archivo:", error);
      alert("Error al descargar el archivo adjunto.");
    }
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (!ticket) return;

    setUpdating(true);
    try {
      const movementId = typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : Date.now().toString();

      await axios.post(`${API_URL}/tickets/${ticket.ID}/movements`, {
        ID: movementId,
        ID_Ticket: ticket.ID,
        Usuario: 'Sistema Web', // Idealmente tomar del contexto de usuario
        Nota: `Cambio de estado a ${newStatus}`,
        Nuevo_Estado: newStatus,
        Fecha: new Date().toISOString().replace('T', ' ').split('.')[0]
      });

      // Actualizar estado local
      setTicket({ ...ticket, Estado: newStatus });
      // Recargar movimientos para ver el nuevo registro
      const movResponse = await axios.get(`${API_URL}/tickets/${id}/movements`);
      setMovements(movResponse.data);

    } catch (error) {
      console.error("Error actualizando estado:", error);
      alert("No se pudo actualizar el estado.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando detalles...</div>;
  if (!ticket) return <div className="p-8 text-center text-red-500">Ticket no encontrado.</div>;

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Abierto': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'En Progreso': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Resuelto': return 'bg-green-100 text-green-800 border-green-200';
      case 'Cerrado': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-900">
      <div className="max-w-5xl mx-auto mb-6">
        <button 
          onClick={() => navigate('/tickets')} 
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-4 text-sm font-bold"
        >
          <ArrowLeft size={16} /> Volver al listado
        </button>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{ticket.Titulo}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
              <span className={`px-2 py-0.5 rounded border font-bold text-xs ${getStatusColor(ticket.Estado)}`}>
                {ticket.Estado}
              </span>
              <span>•</span>
              <span className="font-mono">ID: {ticket.ID.substring(0, 8)}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <User size={14}/> {ticket.Nombre_Cuenta || 'Cuenta Desconocida'}
              </span>
            </div>
          </div>
          
          {/* CORRECCIÓN 3: Selector de Estado visible */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm">
            <span className="text-xs font-bold text-gray-500 uppercase">Estado:</span>
            <select 
              value={ticket.Estado}
              onChange={handleStatusChange}
              disabled={updating}
              className="bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-1.5"
            >
              <option value="Abierto">Abierto</option>
              <option value="En Progreso">En Progreso</option>
              <option value="Resuelto">Resuelto</option>
              <option value="Cerrado">Cerrado</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* COLUMNA IZQUIERDA (Principal) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Panel de Descripción */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 border-b pb-2">
              <FileText size={20} className="text-gray-400" /> Descripción
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{ticket.Notas}</p>
            
            {/* CORRECCIÓN 2: Sección de Adjuntos Visible */}
            {ticket.Adjunto_Nombre && (
              <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <Paperclip size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Archivo Adjunto</p>
                    <p className="text-xs text-gray-500">{ticket.Adjunto_Nombre}</p>
                  </div>
                </div>
                <button 
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Download size={14} /> Descargar
                </button>
              </div>
            )}
          </div>

          {/* CORRECCIÓN 1: Historial de Movimientos Visible */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
             <h2 className="text-lg font-bold mb-6 flex items-center gap-2 border-b pb-2">
              <Activity size={20} className="text-gray-400" /> Historial de Actividad
            </h2>
            
            <div className="relative border-l-2 border-gray-100 ml-3 space-y-8">
              {movements.length > 0 ? movements.map((mov) => (
                <div key={mov.ID} className="relative pl-8">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-100 border-2 border-white ring-2 ring-blue-500"></div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-gray-900">{mov.Usuario}</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={12} /> {new Date(mov.Fecha).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                    {mov.Nota}
                    {mov.Nuevo_Estado && (
                      <span className="block mt-1 text-xs font-semibold text-blue-600">
                        Estado cambiado a: {mov.Nuevo_Estado}
                      </span>
                    )}
                  </p>
                </div>
              )) : (
                <p className="text-gray-400 text-sm pl-8 italic">No hay movimientos registrados.</p>
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA (Detalles) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2 mb-4">
              Detalles del Ticket
            </h3>

            {/* CORRECCIÓN 4: Datos faltantes agregados a la barra lateral */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-2">
                <AlertCircle size={14} /> Prioridad
              </label>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  ticket.Prioridad === 'Alta' ? 'bg-red-500' : 
                  ticket.Prioridad === 'Media' ? 'bg-yellow-500' : 'bg-green-500'
                }`}></span>
                <p className="font-medium text-gray-900">{ticket.Prioridad}</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-2">
                <Tag size={14} /> Tipo
              </label>
              <p className="font-medium text-gray-900">{ticket.Tipo1}</p>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-2">
                <User size={14} /> Agente Asignado
              </label>
              <p className="font-medium text-gray-900">{ticket.Agente || 'Sin asignar'}</p>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-2">
                <User size={14} /> Contacto Solicitante
              </label>
              <p className="font-medium text-gray-900">
                {ticket.Contacto?.trim() || 'No especificado'}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-2">
                <Calendar size={14} /> Fecha Creación
              </label>
              <p className="text-sm text-gray-600">
                {new Date(ticket.Fecha).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;