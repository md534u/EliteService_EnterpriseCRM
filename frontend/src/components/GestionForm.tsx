import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, FileText } from 'lucide-react';

// 1. Definición de Catálogos (Enums del Backend)
const TIPOS_GESTION = [
  'Agenda y Reuniones',
  'Administración General',
  'Recursos Humanos',
  'Atención al Cliente',
  'Redes Sociales',
  'Finanzas y Facturación',
  'Viajes y Suministros'
];

const ETAPAS_GESTION = [
  'Solicitud Recibida',
  'En Análisis',
  'En Ejecución',
  'En Espera',
  'En Seguimiento',
  'Completada',
  'Cancelada'
];

const PRIORIDADES = ['Alta', 'Media', 'Baja'];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
  defaultContactName?: string; 
  defaultAccountName?: string; 
}

const GestionForm: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  defaultContactName = '',
  defaultAccountName = ''
}) => {
  
  // 2. Estado adaptado al modelo GestionOperativa
  const [formData, setFormData] = useState({
    tipo_gestion: 'Agenda y Reuniones',
    etapa: 'Solicitud Recibida',
    prioridad: 'Media',
    fecha_compromiso: '',
    descripcion: '',
    // Mantenemos contexto de cliente si aplica
    nombre_cuenta: '',       
    nombre_representante: '' 
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        nombre_cuenta: initialData.nombre_cuenta || defaultAccountName,
        nombre_representante: initialData.nombre_representante || defaultContactName
      });
    } else {
      // Reset para nueva gestión
      setFormData({
        tipo_gestion: 'Agenda y Reuniones',
        etapa: 'Solicitud Recibida',
        prioridad: 'Media',
        fecha_compromiso: new Date().toISOString().split('T')[0], // Default hoy
        descripcion: '',
        nombre_cuenta: defaultAccountName,
        nombre_representante: defaultContactName
      });
    }
  }, [initialData, isOpen, defaultContactName, defaultAccountName]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.descripcion.trim()) {
      alert('La descripción del requerimiento es obligatoria');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm font-sans">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FileText size={20} className="text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-800 tracking-tight">
              {initialData ? '📝 Editar Gestión' : '🚀 Nueva Gestión Operativa'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto font-sans">
          
          {/* Contexto de Cliente (Read Only) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Cuenta / Empresa</label>
              <input name="nombre_cuenta" value={formData.nombre_cuenta} className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm text-gray-500 font-bold" readOnly />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Solicitante</label>
              <input name="nombre_representante" value={formData.nombre_representante} className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm text-gray-500 font-bold" readOnly />
            </div>
          </div>

          {/* Tipo de Gestión */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Tipo de Gestión</label>
            <select 
              name="tipo_gestion" 
              value={formData.tipo_gestion} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-700"
            >
              {TIPOS_GESTION.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          {/* Grid: Etapa y Prioridad */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Etapa</label>
              <select 
                name="etapa" 
                value={formData.etapa} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-700"
              >
                {ETAPAS_GESTION.map(etapa => (
                  <option key={etapa} value={etapa}>{etapa}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Prioridad</label>
              <select 
                name="prioridad" 
                value={formData.prioridad} 
                onChange={handleChange} 
                className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold
                  ${formData.prioridad === 'Alta' ? 'text-red-600 bg-red-50' : 
                    formData.prioridad === 'Media' ? 'text-orange-600 bg-orange-50' : 'text-gray-700'}
                `}
              >
                {PRIORIDADES.map(prio => (
                  <option key={prio} value={prio}>{prio}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Fecha Compromiso */}
          <div>
             <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest flex items-center gap-1">
               <Calendar size={10}/> Fecha Compromiso
             </label>
             <input 
               type="date" 
               name="fecha_compromiso" 
               value={formData.fecha_compromiso} 
               onChange={handleChange} 
               className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none font-bold text-gray-700" 
             />
          </div>

          {/* Descripción (Antes Comentarios) */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Descripción del Requerimiento</label>
            <textarea 
              name="descripcion" 
              value={formData.descripcion} 
              onChange={handleChange} 
              rows={4}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700 placeholder-gray-300"
              placeholder="Describe detalladamente qué se necesita realizar..."
            />
          </div>

          {/* Footer botones */}
          <div className="flex justify-end gap-3 pt-4 border-t mt-4 font-sans">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-100 font-bold text-xs uppercase tracking-widest transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
            >
              <Save size={16} /> {initialData ? 'Guardar Cambios' : 'Crear Gestión'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default GestionForm;