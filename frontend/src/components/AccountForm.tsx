import React, { useState, useEffect } from 'react';
import { X, Save, Building2, MapPin, Hash, FileText, Globe, Phone, Mail, User } from 'lucide-react';

interface AccountFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

export const AccountForm = ({ isOpen, onClose, onSave, initialData }: AccountFormProps) => {
  // 1. Estado inicial con TODOS los campos necesarios para el detalle
  const [formData, setFormData] = useState({
    Nombre_Cuenta: '',
    SitioWeb: '',
    Sector: '',
    Tamano: '',
    Descripcion: '',
    RazonSocial: '',
    RFC: '',
    Domicilio_Fiscal: '',
    Telefono: '',
    Email: ''
  });

  // 2. Efecto para rellenar el formulario al abrir
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        Nombre_Cuenta: initialData.Nombre_Cuenta || initialData.nombre || '',
        SitioWeb: initialData.SitioWeb || initialData.Website || '',
        Sector: initialData.Sector || initialData.Giro_Empresa || '',
        Tamano: initialData.Tamano || '',
        Descripcion: initialData.Descripcion || '',
        RazonSocial: initialData.RazonSocial || '',
        RFC: initialData.RFC || '',
        Domicilio_Fiscal: initialData.Domicilio_Fiscal || '',
        Telefono: initialData.Telefono || '',
        Email: initialData.Email || ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Building2 className="text-blue-600" size={20}/> Editar Cuenta
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* SECCIÓN 1: IDENTIDAD */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2">Identidad Corporativa</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre Comercial</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  <input
                    type="text"
                    name="Nombre_Cuenta"
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.Nombre_Cuenta}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sitio Web</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  <input
                    type="text"
                    name="SitioWeb"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.SitioWeb}
                    onChange={handleChange}
                    placeholder="www.ejemplo.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sector / Giro</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  <input
                    type="text"
                    name="Sector"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.Sector}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tamaño Empresa</label>
                <select 
                  name="Tamano" 
                  value={formData.Tamano} 
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="">Seleccionar...</option>
                  <option value="1 - 10 Empleados">1 - 10 Empleados</option>
                  <option value="11 - 50 Empleados">11 - 50 Empleados</option>
                  <option value="51 - 200 Empleados">51 - 200 Empleados</option>
                  <option value="201 - 500 Empleados">201 - 500 Empleados</option>
                  <option value="500+ Empleados">500+ Empleados</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción</label>
                <textarea
                  name="Descripcion"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.Descripcion}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: DATOS DE CONTACTO Y FISCALES */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2">Fiscales y Contacto</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Razón Social</label>
                <input
                  type="text"
                  name="RazonSocial"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.RazonSocial}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">RFC</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  <input
                    type="text"
                    name="RFC"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                    value={formData.RFC}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Domicilio Fiscal</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  <input
                    type="text"
                    name="Domicilio_Fiscal"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.Domicilio_Fiscal}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Teléfono</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  <input
                    type="tel"
                    name="Telefono"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.Telefono}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email General</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  <input
                    type="email"
                    name="Email"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.Email}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 sticky bottom-0 bg-white pb-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Save size={16} /> Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};