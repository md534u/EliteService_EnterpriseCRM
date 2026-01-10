import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { Plus, Filter, ClipboardList, RefreshCw } from 'lucide-react';

// Importamos los componentes hijos. 
// Nota: Usamos 'type' para GestionOperativa para evitar el error TS1484
import GestionList, { type GestionOperativa } from '../components/GestionList';
import GestionForm from '../components/GestionForm';

const GestionesPage = () => {
  // --- ESTADOS ---
  const [gestiones, setGestiones] = useState<GestionOperativa[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGestion, setEditingGestion] = useState<GestionOperativa | null>(null);

  // --- CARGA DE DATOS ---
  const fetchGestiones = async () => {
    try {
      setLoading(true);
      // Petición al endpoint que creamos en backend/routers/gestiones.py
      const res = await axios.get(`${API_URL}/gestiones/`);
      setGestiones(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error cargando gestiones", error);
      // Si falla, mostramos lista vacía para no romper la UI
      setGestiones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGestiones();
  }, []);

  // --- MANEJO DE GUARDADO (Crear / Editar) ---
  const handleSave = async (data: any) => {
    try {
      if (editingGestion) {
        // ACTUALIZAR (PUT)
        await axios.put(`${API_URL}/gestiones/${editingGestion.id}`, data);
      } else {
        // CREAR (POST)
        await axios.post(`${API_URL}/gestiones/`, data);
      }
      // Cerrar modal y refrescar
      setIsModalOpen(false);
      setEditingGestion(null);
      fetchGestiones(); 
    } catch (error) {
      console.error(error);
      alert('Hubo un error al guardar la gestión. Verifica la conexión con el servidor.');
    }
  };

  // --- HANDLERS ---
  const handleEdit = (gestion: GestionOperativa) => {
    setEditingGestion(gestion);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingGestion(null);
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans text-gray-900">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-3 rounded-xl text-white shadow-lg shadow-blue-200">
            <ClipboardList size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Gestión Operativa</h1>
            <p className="text-gray-500 text-sm font-medium">Administración centralizada de requerimientos, agenda y procesos.</p>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          {/* Botón Refrescar */}
          <button 
            onClick={() => fetchGestiones()}
            className="p-2.5 bg-white border border-gray-200 text-gray-500 rounded-xl hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
            title="Recargar lista"
          >
            <RefreshCw size={18} />
          </button>
          
          {/* Botón Filtros (Visual por ahora) */}
          <button className="hidden md:flex bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-bold items-center gap-2 hover:bg-gray-50 shadow-sm transition-all">
            <Filter size={18} /> Filtros
          </button>
          
          {/* Botón Crear */}
          <button 
            onClick={handleCreate}
            className="flex-1 md:flex-none bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            <Plus size={18} /> Nueva Gestión
          </button>
        </div>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      {loading ? (
        // Estado de Carga
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400 font-medium">Sincronizando gestiones...</p>
        </div>
      ) : (
        // Tabla de Datos
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-500">
           <GestionList 
              gestiones={gestiones} 
              onEdit={handleEdit} 
              onCreate={handleCreate} 
           />
        </div>
      )}

      {/* --- MODAL FLOTANTE --- */}
      <GestionForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        initialData={editingGestion}
      />
    </div>
  );
};

export default GestionesPage;