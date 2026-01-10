import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Briefcase, Building } from 'lucide-react';

interface ContactFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
  accountId?: number; // Nuevo prop para saber a qué cuenta pertenece
}

export const ContactForm = ({ isOpen, onClose, onSave, initialData, accountId }: ContactFormProps) => {
  const [formData, setFormData] = useState({
    Nombre: '',
    Apellido_Paterno: '',
    Email: '',
    Telefono: '',
    Puesto: '',
    Departamento: '',
    Account_ID: (accountId || 0).toString() // Inicializamos con el ID de la cuenta
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          Nombre: '',
          Apellido_Paterno: '',
          Email: '',
          Telefono: '',
          Puesto: '',
          Departamento: '',
          Account_ID: (accountId || 0).toString() // Aseguramos que se incluya al limpiar el form
        });
      }
    }
  }, [initialData, isOpen, accountId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">
            {initialData ? 'Editar Contacto' : 'Nuevo Contacto'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Juan"
                  value={formData.Nombre}
                  onChange={(e) => setFormData({...formData, Nombre: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Apellido</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Pérez"
                value={formData.Apellido_Paterno}
                onChange={(e) => setFormData({...formData, Apellido_Paterno: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="email"
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="juan.perez@empresa.com"
                value={formData.Email}
                onChange={(e) => setFormData({...formData, Email: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Teléfono / Celular</label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="tel"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="+52 (55) 1234 5678"
                value={formData.Telefono}
                onChange={(e) => setFormData({...formData, Telefono: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Puesto</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="text"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Gerente IT"
                  value={formData.Puesto}
                  onChange={(e) => setFormData({...formData, Puesto: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Departamento</label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="text"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Sistemas"
                  value={formData.Departamento}
                  onChange={(e) => setFormData({...formData, Departamento: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
            >
              Guardar Contacto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};