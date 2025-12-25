import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

const OpportunityForm: React.FC<Props> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    Nombre_Oportunidad: '',
    Etapa: 'Prospección',
    Cantidad_Lineas: '',
    Fecha_Cierre: '',
    Servicio_Clave: '',
    Probabilidad: 10,
    Tipo_Op: 'Nueva Venta',
    Comentarios: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        Nombre_Oportunidad: '',
        Etapa: 'Prospección',
        Cantidad_Lineas: '',
        Fecha_Cierre: '',
        Servicio_Clave: '',
        Probabilidad: 10,
        Tipo_Op: 'Nueva Venta',
        Comentarios: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // ✅ Handler genérico (recomendado)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convertir campos numéricos antes de enviar
    const payload = {
      ...formData,
      Cantidad_Lineas: Number(formData.Cantidad_Lineas) || 0,
      Probabilidad: Number(formData.Probabilidad) || 0,
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">
            {initialData ? 'Editar Oportunidad' : 'Nueva Oportunidad'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Oportunidad
            </label>
            <input
              name="Nombre_Oportunidad"
              value={formData.Nombre_Oportunidad}
              onChange={handleChange}
              className="input-field"
              placeholder="Ej. Renovación de líneas 2024"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Etapa</label>
              <select
                name="Etapa"
                value={formData.Etapa}
                onChange={handleChange}
                className="input-field"
              >
                <option value="Prospección">Prospección</option>
                <option value="Calificación">Calificación</option>
                <option value="Propuesta">Propuesta</option>
                <option value="Negociación">Negociación</option>
                <option value="Cerrada Ganada">Cerrada Ganada</option>
                <option value="Perdida">Perdida</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                name="Tipo_Op"
                value={formData.Tipo_Op}
                onChange={handleChange}
                className="input-field"
              >
                <option value="Nueva Venta">Nueva Venta</option>
                <option value="Renovación">Renovación</option>
                <option value="Adición">Adición</option>
                <option value="Portabilidad">Portabilidad</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad Líneas
              </label>
              <input
                type="number"
                name="Cantidad_Lineas"
                value={formData.Cantidad_Lineas}
                onChange={handleChange}
                className="input-field"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Probabilidad (%)
              </label>
              <input
                type="number"
                name="Probabilidad"
                value={formData.Probabilidad}
                onChange={handleChange}
                className="input-field"
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Servicio Clave
              </label>
              <input
                name="Servicio_Clave"
                value={formData.Servicio_Clave}
                onChange={handleChange}
                className="input-field"
                placeholder="Ej. Plan Empresarial 5G"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Cierre Est.
              </label>
              <input
                type="date"
                name="Fecha_Cierre"
                value={formData.Fecha_Cierre}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comentarios
            </label>
            <textarea
              name="Comentarios"
              value={formData.Comentarios}
              onChange={handleChange}
              className="input-field h-24 pt-2 resize-none"
              placeholder="Detalles adicionales..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center gap-2"
            >
              <Save size={18} />
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OpportunityForm;
