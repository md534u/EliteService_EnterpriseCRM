import React, { useState, useEffect } from 'react';
import { X, Save, Building2, User, Phone, Mail, MapPin } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData: any;
}

const AccountEditForm: React.FC<Props> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-300">
        {/* Encabezado Gris Oscuro */}
        <div className="bg-gray-200 px-6 py-4 border-b border-gray-300 flex justify-between items-center">
          <h2 className="font-bold text-gray-600 uppercase text-[11px] tracking-widest flex items-center gap-2">
            <Building2 size={14} /> Editar Información de la Cuenta
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[85vh] overflow-y-auto">
          {/* Nombre de la Razón Social */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1.5 tracking-wider">Razón Social</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <input 
                name="Nombre_Cuenta"
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-700"
                value={formData.Nombre_Cuenta || ''}
                onChange={handleChange}
                placeholder="Nombre de la empresa"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Representante Legal */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1.5 tracking-wider">Representante Legal</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                <input 
                  name="Nombre_Representante"
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700"
                  value={formData.Nombre_Representante || ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1.5 tracking-wider">Teléfono de Contacto</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                <input 
                  name="Telefono"
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700 font-mono"
                  value={formData.Telefono || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Correo Electrónico */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1.5 tracking-wider">Correo Electrónico Corporativo</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <input 
                name="Email"
                type="email"
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700 lowercase"
                value={formData.Email || ''}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Domicilio Fiscal */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1.5 tracking-wider">Domicilio Fiscal / Dirección</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-300" size={16} />
              <textarea 
                name="Domicilio_Fiscal"
                rows={3}
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700 leading-relaxed"
                value={formData.Domicilio_Fiscal || ''}
                onChange={handleChange}
                placeholder="Calle, número, colonia, CP y Ciudad..."
              />
            </div>
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 text-xs font-bold text-gray-400 uppercase tracking-widest hover:bg-gray-50 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
            >
              <Save size={14}/> Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountEditForm;