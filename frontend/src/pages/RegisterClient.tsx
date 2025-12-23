import React, { useState } from 'react';
import axios from 'axios';
import { UserPlus, Briefcase, User, Calendar, MapPin } from 'lucide-react';
import { API_URL } from '../config';

const RegisterClient = () => {
  const [segment, setSegment] = useState<'Persona Física con Actividad Empresarial' | 'Persona Moral'>('Persona Moral');
  const [folio, setFolio] = useState(`REGB2B${Math.floor(Math.random() * 900000) + 100000}`);
  
  const [formData, setFormData] = useState({
    Razon_Social: '', Giro: '', RFC_Empresa: '',
    Nombre: '', Segundo_Nombre: '', Apellido_Paterno: '', Apellido_Materno: '',
    Fecha_Nacimiento: '2000-01-01', RFC: '',
    Telefono: '', Email_Facturacion: '',
    Calle: '', No_Exterior: '', No_Interno: '', Colonia: '', Municipio: '', Estado: '', CP: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        Folio: folio,
        Segmento: segment,
        Fecha_Registro: new Date().toISOString().split('T')[0],
        Estado_CRM: 'ACTIVO',
        ...formData
      };
      
      await axios.post(`${API_URL}/leads/`, payload);
      alert(`Cliente registrado con éxito! Folio: ${folio}`);
      // Reset
      setFolio(`REGB2B${Math.floor(Math.random() * 900000) + 100000}`);
      setFormData({
        Razon_Social: '', Giro: '', RFC_Empresa: '',
        Nombre: '', Segundo_Nombre: '', Apellido_Paterno: '', Apellido_Materno: '',
        Fecha_Nacimiento: '2000-01-01', RFC: '',
        Telefono: '', Email_Facturacion: '',
        Calle: '', No_Exterior: '', No_Interno: '', Colonia: '', Municipio: '', Estado: '', CP: ''
      });
    } catch (err) {
      alert("Error al registrar cliente");
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-2 rounded-full text-att-dark">
          <UserPlus size={24} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Registrar Nuevo Cliente</h1>
      </div>

      <div className="google-card mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">1. Segmento y Folio</h2>
        
        <div className="flex gap-6 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="segment" 
              checked={segment === 'Persona Física con Actividad Empresarial'} 
              onChange={() => setSegment('Persona Física con Actividad Empresarial')}
              className="text-att-blue focus:ring-att-blue"
            />
            <span className="text-gray-700">Persona Física con Actividad Empresarial</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="segment" 
              checked={segment === 'Persona Moral'} 
              onChange={() => setSegment('Persona Moral')}
              className="text-att-blue focus:ring-att-blue"
            />
            <span className="text-gray-700">Persona Moral</span>
          </label>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r flex items-center gap-3">
          <div className="text-yellow-600 font-bold text-lg">🆔 Folio:</div>
          <div className="font-mono text-xl font-bold text-gray-800 tracking-wider">{folio}</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="google-card space-y-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">2. Datos Generales</h2>

        {segment === 'Persona Moral' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">Razón Social</label>
              <input name="Razon_Social" value={formData.Razon_Social} onChange={handleChange} className="input-field" required />
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-600 mb-1">RFC Empresa</label>
               <input name="RFC_Empresa" value={formData.RFC_Empresa} onChange={handleChange} className="input-field" required />
            </div>
            <div className="md:col-span-2">
               <label className="block text-sm font-medium text-gray-600 mb-1">Giro / Industria</label>
               <input name="Giro" value={formData.Giro} onChange={handleChange} className="input-field" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="md:col-span-2 text-sm font-bold text-gray-500 uppercase tracking-wide mt-2">Representante Legal</div>
           <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nombre</label>
              <input name="Nombre" value={formData.Nombre} onChange={handleChange} className="input-field" required />
           </div>
           <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Segundo Nombre</label>
              <input name="Segundo_Nombre" value={formData.Segundo_Nombre} onChange={handleChange} className="input-field" />
           </div>
           <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Apellido Paterno</label>
              <input name="Apellido_Paterno" value={formData.Apellido_Paterno} onChange={handleChange} className="input-field" required />
           </div>
           <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Apellido Materno</label>
              <input name="Apellido_Materno" value={formData.Apellido_Materno} onChange={handleChange} className="input-field" />
           </div>
           
           {segment !== 'Persona Moral' && (
             <>
               <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Fecha Nacimiento</label>
                  <input type="date" name="Fecha_Nacimiento" value={formData.Fecha_Nacimiento} onChange={handleChange} className="input-field" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">RFC</label>
                  <input name="RFC" value={formData.RFC} onChange={handleChange} className="input-field" required />
               </div>
             </>
           )}

           <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Teléfono Contacto</label>
              <input name="Telefono" value={formData.Telefono} onChange={handleChange} className="input-field" required />
           </div>
           <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email Facturación</label>
              <input type="email" name="Email_Facturacion" value={formData.Email_Facturacion} onChange={handleChange} className="input-field" />
           </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="md:col-span-3 text-sm font-bold text-gray-500 uppercase tracking-wide mt-2">Domicilio Fiscal</div>
           <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Calle</label>
              <input name="Calle" value={formData.Calle} onChange={handleChange} className="input-field" />
           </div>
           <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">No. Exterior</label>
              <input name="No_Exterior" value={formData.No_Exterior} onChange={handleChange} className="input-field" />
           </div>
           <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Colonia</label>
              <input name="Colonia" value={formData.Colonia} onChange={handleChange} className="input-field" />
           </div>
           <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Municipio</label>
              <input name="Municipio" value={formData.Municipio} onChange={handleChange} className="input-field" />
           </div>
           <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">CP</label>
              <input name="CP" value={formData.CP} onChange={handleChange} className="input-field" />
           </div>
           <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Estado</label>
              <input name="Estado" value={formData.Estado} onChange={handleChange} className="input-field" />
           </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Briefcase size={18} />
            Guardar Registro
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterClient;
