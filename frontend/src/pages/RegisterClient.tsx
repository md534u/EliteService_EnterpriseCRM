import React, { useState } from 'react';
import axios from 'axios';
import { UserPlus, CheckCircle, Eye, ArrowLeft, Send, Building2, MapPin } from 'lucide-react';
import { API_URL } from '../config';

const RegisterClient = () => {
  const [showPreview, setShowPreview] = useState(false);
  const [segment, setSegment] = useState<'Persona Física con Actividad Empresarial' | 'Persona Moral'>('Persona Moral');
  const [folio, setFolio] = useState(`PROSP-${Math.floor(Math.random() * 900000) + 100000}`);
  
  // TODOS LOS CAMPOS REQUERIDOS POR TU CSV
  const [formData, setFormData] = useState({
    Nombre: '',
    Segundo_Nombre: '',
    Apellido_Paterno: '',
    Apellido_Materno: '',
    Fecha_Nacimiento: '2000-01-01',
    RFC: '', // RFC Personal
    Telefono: '',
    Email_Facturacion: '',
    Razon_Social: '',
    RFC_Empresa: '',
    Giro: '',
    Calle: '',
    No_Exterior: '',
    No_Interno: '',
    Colonia: '',
    Municipio: '',
    Estado: '',
    CP: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fullName = [formData.Nombre, formData.Segundo_Nombre, formData.Apellido_Paterno, formData.Apellido_Materno].filter(Boolean).join(" ").trim();

  const handleFinalSubmit = async () => {
    try {
      // PAYLOAD CON LOS 22 CAMPOS EXACTOS
      const payload = {
        Folio: folio,
        Segmento: segment,
        Fecha_Registro: new Date().toISOString().split('T')[0],
        Nombre: formData.Nombre,
        Segundo_Nombre: formData.Segundo_Nombre,
        Apellido_Paterno: formData.Apellido_Paterno,
        Apellido_Materno: formData.Apellido_Materno,
        Fecha_Nacimiento: formData.Fecha_Nacimiento,
        RFC: formData.RFC,
        Telefono: formData.Telefono,
        Email_Facturacion: formData.Email_Facturacion,
        Razon_Social: formData.Razon_Social,
        RFC_Empresa: formData.RFC_Empresa,
        Giro: formData.Giro,
        Calle: formData.Calle,
        No_Exterior: formData.No_Exterior,
        No_Interno: formData.No_Interno,
        Colonia: formData.Colonia,
        Municipio: formData.Municipio,
        Estado: formData.Estado,
        CP: formData.CP,
        Estado_CRM: 'NUEVO'
      };
      
      await axios.post(`${API_URL}/leads/`, payload);
      alert(`✅ Registro exitoso. Folio: ${folio}`);
      resetForm();
    } catch (err) {
      alert("Error al conectar con el servidor.");
    }
  };

  const resetForm = () => {
    setShowPreview(false);
    setFolio(`PROSP-${Math.floor(Math.random() * 900000) + 100000}`);
    setFormData({
      Nombre: '', Segundo_Nombre: '', Apellido_Paterno: '', Apellido_Materno: '',
      Fecha_Nacimiento: '2000-01-01', RFC: '', Telefono: '', Email_Facturacion: '',
      Razon_Social: '', RFC_Empresa: '', Giro: '',
      Calle: '', No_Exterior: '', No_Interno: '', Colonia: '', Municipio: '', Estado: '', CP: ''
    });
  };

  if (showPreview) {
    return (
      <div className="max-w-4xl mx-auto pb-20 animate-in fade-in zoom-in duration-300">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ArrowLeft size={24} /></button>
          <h1 className="text-2xl font-black text-gray-900">Confirmar Datos de Registro</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border overflow-hidden">
          <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{segment === 'Persona Moral' ? formData.Razon_Social : fullName}</h2>
              <p className="text-slate-400 font-mono">{folio} | {segment}</p>
            </div>
            <CheckCircle size={40} className="text-green-500" />
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest">Identidad y Fiscal</h3>
              <p className="text-sm"><strong>Titular:</strong> {fullName}</p>
              <p className="text-sm"><strong>RFC:</strong> {segment === 'Persona Moral' ? formData.RFC_Empresa : formData.RFC}</p>
              <p className="text-sm"><strong>Giro:</strong> {formData.Giro || 'N/A'}</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest">Contacto y Ubicación</h3>
              <p className="text-sm"><strong>Tel/Email:</strong> {formData.Telefono} / {formData.Email_Facturacion}</p>
              <p className="text-sm"><strong>Dirección:</strong> {formData.Calle} {formData.No_Exterior}, {formData.Colonia}, {formData.Municipio}</p>
            </div>
          </div>

          <div className="p-6 bg-gray-50 border-t flex justify-end gap-4">
            <button onClick={() => setShowPreview(false)} className="px-6 py-2 font-bold text-gray-500">Regresar a editar</button>
            <button onClick={handleFinalSubmit} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2">
              <Send size={18} /> Procesar Registro
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg"><UserPlus size={28} /></div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Alta de Prospecto</h1>
          <p className="text-sm text-gray-500">Folio: {folio}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <button 
          type="button" 
          onClick={() => setSegment('Persona Moral')} 
          className={`p-4 rounded-2xl font-bold text-sm transition-all flex flex-col items-center gap-2 ${
            segment === 'Persona Moral' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 ring-2 ring-blue-600 ring-offset-2' 
              : 'bg-white text-gray-500 border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
          }`}
        >
          <Building2 size={24} className={segment === 'Persona Moral' ? 'text-white' : 'text-gray-400'} />
          Persona Moral
        </button>
        
        <button 
          type="button" 
          onClick={() => setSegment('Persona Física con Actividad Empresarial')} 
          className={`p-4 rounded-2xl font-bold text-sm transition-all flex flex-col items-center gap-2 ${
            segment !== 'Persona Moral' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 ring-2 ring-blue-600 ring-offset-2' 
              : 'bg-white text-gray-500 border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
          }`}
        >
          <UserPlus size={24} className={segment !== 'Persona Moral' ? 'text-white' : 'text-gray-400'} />
          Persona Física
        </button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setShowPreview(true); }} className="space-y-6">
        {/* CAMPOS DINÁMICOS SEGÚN SEGMENTO */}
        {segment === 'Persona Moral' && (
          <div className="bg-white p-8 rounded-2xl border border-gray-300 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 text-sm font-black text-blue-800 border-b-2 border-blue-100 pb-3 mb-2">Datos de la Empresa</div>
            <div className="md:col-span-2"><label className="text-[10px] font-black text-gray-400">Razón Social</label><input name="Razon_Social" value={formData.Razon_Social} onChange={handleChange} className="w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-bold outline-none" required /></div>
            <div><label className="text-[10px] font-black text-gray-400">RFC Empresa</label><input name="RFC_Empresa" value={formData.RFC_Empresa} onChange={handleChange} className="w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-bold" required /></div>
            <div><label className="text-[10px] font-black text-gray-400">Giro</label><input name="Giro" value={formData.Giro} onChange={handleChange} className="w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-bold" /></div>
          </div>
        )}

        <div className="bg-white p-8 rounded-2xl border border-gray-300 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 text-sm font-black text-blue-800 border-b-2 border-blue-100 pb-3 mb-2">Información del {segment === 'Persona Moral' ? 'Representante' : 'Titular'}</div>
          <div><label className="text-[10px] font-black text-gray-400">Nombre</label><input name="Nombre" value={formData.Nombre} onChange={handleChange} className="w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-bold" required /></div>
          <div><label className="text-[10px] font-black text-gray-400">Segundo Nombre</label><input name="Segundo_Nombre" value={formData.Segundo_Nombre} onChange={handleChange} className="w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-bold" /></div>
          <div><label className="text-[10px] font-black text-gray-400">Apellido Paterno</label><input name="Apellido_Paterno" value={formData.Apellido_Paterno} onChange={handleChange} className="w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-bold" required /></div>
          <div><label className="text-[10px] font-black text-gray-400">Apellido Materno</label><input name="Apellido_Materno" value={formData.Apellido_Materno} onChange={handleChange} className="w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-bold" /></div>
          {segment !== 'Persona Moral' && (
            <>
              <div><label className="text-[10px] font-black text-gray-400">Fecha Nacimiento</label><input type="date" name="Fecha_Nacimiento" value={formData.Fecha_Nacimiento} onChange={handleChange} className="w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-bold" /></div>
              <div><label className="text-[10px] font-black text-gray-400">RFC Personal</label><input name="RFC" value={formData.RFC} onChange={handleChange} className="w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-bold" required /></div>
            </>
          )}
          <div><label className="text-[10px] font-black text-gray-400">Teléfono</label><input name="Telefono" value={formData.Telefono} onChange={handleChange} className="w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-bold" required /></div>
          <div><label className="text-[10px] font-black text-gray-400">Email</label><input type="email" name="Email_Facturacion" value={formData.Email_Facturacion} onChange={handleChange} className="w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-bold" required /></div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-gray-300 shadow-sm grid grid-cols-1 md:grid-cols-6 gap-6">
          <div className="md:col-span-6 text-sm font-black text-blue-800 border-b-2 border-blue-100 pb-3 mb-2">Domicilio Fiscal</div>
          <div className="md:col-span-4"><label className="text-[10px] font-black text-gray-400">Calle</label><input name="Calle" value={formData.Calle} onChange={handleChange} className="w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-bold" /></div>
          <div className="md:col-span-1"><label className="text-[10px] font-black text-gray-400">Ext</label><input name="No_Exterior" value={formData.No_Exterior} onChange={handleChange} className="w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-bold" /></div>
          <div className="md:col-span-1"><label className="text-[10px] font-black text-gray-400">Int</label><input name="No_Interno" value={formData.No_Interno} onChange={handleChange} className="w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-bold" /></div>
          <div className="md:col-span-2"><label className="text-[10px] font-black text-gray-400">Colonia</label><input name="Colonia" value={formData.Colonia} onChange={handleChange} className="w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-bold" /></div>
          <div className="md:col-span-2"><label className="text-[10px] font-black text-gray-400">Municipio</label><input name="Municipio" value={formData.Municipio} onChange={handleChange} className="w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-bold" /></div>
          <div className="md:col-span-1"><label className="text-[10px] font-black text-gray-400">Estado</label><input name="Estado" value={formData.Estado} onChange={handleChange} className="w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-bold" /></div>
          <div className="md:col-span-1"><label className="text-[10px] font-black text-gray-400">CP</label><input name="CP" value={formData.CP} onChange={handleChange} className="w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-bold" /></div>
        </div>

        <div className="flex justify-end"><button type="submit" className="bg-slate-900 text-white px-12 py-4 rounded-2xl font-black uppercase text-xs flex items-center gap-2 tracking-widest hover:bg-slate-800 transition-all"><Eye size={18} /> Ver Vista Previa</button></div>
      </form>
    </div>
  );
};

export default RegisterClient;