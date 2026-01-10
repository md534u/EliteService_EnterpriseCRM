import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from "socket.io-client";
import { 
  Phone, Search, Save, Clock, Building,
  ExternalLink, Mail, MessageCircle, Video, FileText, 
  Plus, Download, X, Calendar, UploadCloud, Trash2,
  File as FileIcon
} from 'lucide-react';
import { API_URL } from '../config';
import { useToast } from '../context/ToastContext'; // 👇 Importar

// Helper para tiempo relativo
const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Hace un momento';
  if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
  if (diffInSeconds < 172800) return 'Ayer';
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
};

// Helper para iconos según canal
const getChannelIcon = (channel: string) => {
  const c = (channel || '').toLowerCase();
  if (c.includes('correo') || c.includes('email')) return <Mail size={16} className="text-purple-600" />;
  if (c.includes('llamada') || c.includes('teléfono')) return <Phone size={16} className="text-blue-600" />;
  if (c.includes('whatsapp')) return <MessageCircle size={16} className="text-green-600" />;
  if (c.includes('presencial') || c.includes('reunión')) return <Video size={16} className="text-orange-600" />;
  return <FileText size={16} className="text-gray-600" />;
};

// Helper para color de fondo del icono
const getChannelBg = (channel: string) => {
  const c = (channel || '').toLowerCase();
  if (c.includes('correo')) return 'bg-purple-50';
  if (c.includes('llamada')) return 'bg-blue-50';
  if (c.includes('whatsapp')) return 'bg-green-50';
  if (c.includes('presencial')) return 'bg-orange-50';
  return 'bg-gray-50';
};



const InteractionsPage = () => {
  const { addToast } = useToast();

  const navigate = useNavigate(); // Esto define la función que te falta
  
  // Estados de Datos
  const [accounts, setAccounts] = useState<any[]>([]);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  
  // Estados de UI
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  // Estado del Formulario (Modal)
  const [form, setForm] = useState({ 
    canal: 'Llamada', 
    asunto: '', 
    fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    contacto: '',
    descripcion: '' 
  });

  useEffect(() => {
    // Conectamos al servidor que tienes corriendo en el puerto 4000
    const socket = io("http://localhost:4000");

    // Escuchamos el evento que configuramos en el index.js del backend
    socket.on("new_mail_notification", (data) => {
      addToast(`📧 Nuevo correo: ${data.subject} de ${data.from}`, 'info');
    });

    // Limpiamos la conexión cuando cerramos la página
    return () => {
      socket.disconnect();
    };
  }, [addToast]);

  // Carga Inicial
  useEffect(() => {
    const loadData = async () => {
      try {
        const [accRes, intRes] = await Promise.all([
          axios.get(`${API_URL}/accounts/`),
          axios.get(`${API_URL}/interactions/`)
        ]);
        setAccounts(Array.isArray(accRes.data) ? accRes.data : []);
        setInteractions(Array.isArray(intRes.data) ? intRes.data : []);
      } catch (e) {
        console.error("Error cargando datos:", e);
      }
    };
    loadData();
  }, []);

  // Cargar Contactos al seleccionar cuenta
  useEffect(() => {
    if (selectedAccount?.ID) {
      axios.get(`${API_URL}/contacts/by-account/${selectedAccount.ID}`)
        .then(res => setContacts(Array.isArray(res.data) ? res.data : []))
        .catch(() => setContacts([]));
    } else {
      setContacts([]);
    }
  }, [selectedAccount]);

  // Filtrado de Cuentas (Sidebar)
  const filteredAccounts = useMemo(() => {
    return accounts.filter(acc => 
      (acc.Nombre_Cuenta || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(acc.ID).includes(searchTerm)
    );
  }, [accounts, searchTerm]);

  // Filtrado de Interacciones (Main Panel)
  const accountInteractions = useMemo(() => {
    if (!selectedAccount) return [];
    return interactions
      .filter((i: any) => String(i.ID_Cuenta_FK) === String(selectedAccount.ID))
      .sort((a: any, b: any) => new Date(b.Fecha_Hora).getTime() - new Date(a.Fecha_Hora).getTime());
  }, [selectedAccount, interactions]);

  // Manejo de Archivos
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files as FileList)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Guardar Interacción
  const handleSubmit = async () => {
    if (!form.descripcion) return addToast("Por favor ingrese la descripción", 'error');
    if (!form.asunto) return addToast("Por favor ingrese un asunto", 'error');
    if (!selectedAccount) return addToast("Error: No hay cuenta seleccionada", 'error');

    try {
      const formData = new FormData();
      formData.append('ID_Cuenta_FK', String(selectedAccount.ID));
      formData.append('Fecha_Hora', `${form.fecha} ${form.hora}`);
      formData.append('Canal_Atencion', form.canal);
      formData.append('Tipo_Interaccion', form.asunto);
      formData.append('Sentido_Contacto', 'Entrante');
      formData.append('Usuario_Registro', "Marcos Victor de la O Cano");
      formData.append('Notas_Detalle', form.descripcion);

      // Adjuntar archivos si existen
      files.forEach((file) => {
        console.log(`📤 Enviando archivo: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
        formData.append('files', file);
      });

      const res = await axios.post(`${API_URL}/interactions/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Actualizar lista localmente
      setInteractions(prev => [res.data, ...prev]);
      addToast("Interacción registrada correctamente", 'success');
      setIsModalOpen(false);
      setForm({ 
        canal: 'Llamada', 
        asunto: '', 
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        contacto: '',
        descripcion: '' 
      });
      setFiles([]);

      // Lógica de Ticket Automático
      if (form.asunto.toLowerCase().includes('problema') || form.asunto.toLowerCase().includes('falla')) {
        if (window.confirm("Esta interacción reporta un problema. ¿Desea crear un ticket automáticamente?")) {
          navigate('/tickets/create', { 
            state: { 
              accountId: selectedAccount.ID, 
              accountName: selectedAccount.Nombre_Cuenta 
            } 
          });
        }
      }
    } catch (e) { addToast("Error al guardar la interacción", 'error'); }
  };

  return (
    <div className="flex h-[85vh] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden font-sans">
      
      {/* 1. SIDEBAR IZQUIERDO (Lista de Clientes) */}
      <div className="w-[30%] border-r border-gray-200 flex flex-col bg-white">
        {/* Encabezado y Buscador */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Building size={20} className="text-blue-600"/> Clientes
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-gray-400"
              placeholder="Buscar por nombre o ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Lista de Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredAccounts.map(acc => (
            <div 
              key={acc.ID}
              onClick={() => setSelectedAccount(acc)}
              className={`p-4 rounded-xl cursor-pointer transition-all flex items-center gap-4 group ${
                selectedAccount?.ID === acc.ID 
                  ? 'bg-blue-50 border border-blue-100 shadow-sm' 
                  : 'hover:bg-gray-50 border border-transparent'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                selectedAccount?.ID === acc.ID 
                  ? 'bg-blue-200 text-blue-700' 
                  : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
              }`}>
                {acc.Nombre_Cuenta.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-bold truncate ${selectedAccount?.ID === acc.ID ? 'text-blue-900' : 'text-gray-700'}`}>
                  {acc.Nombre_Cuenta}
                </h3>
                <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                  <span className="font-mono">#{acc.ID}</span> • {acc.Segmento_Tipo || 'General'}
                </p>
              </div>
            </div>
          ))}
          {filteredAccounts.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">No se encontraron clientes.</div>
          )}
        </div>
      </div>

      {/* 2. PANEL PRINCIPAL (Historial) */}
      <div className="flex-1 flex flex-col bg-gray-50/30">
        {selectedAccount ? (
          <>
            {/* Encabezado Superior */}
            <div className="p-8 bg-white border-b border-gray-200 flex justify-between items-start shadow-sm z-10">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  Interacciones con {selectedAccount.Nombre_Cuenta}
                  <button 
                    onClick={() => navigate(`/universe/${selectedAccount.ID}`)}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    title="Ver perfil completo"
                  >
                    <ExternalLink size={18} />
                  </button>
                </h1>
                <p className="text-gray-500 text-sm mt-1 font-medium">
                  {accountInteractions.length} registros encontrados • {selectedAccount.RFC}
                </p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors">
                  <Download size={18} /> Exportar
                </button>
                <button 
                  onClick={() => setIsModalOpen(true)} 
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center gap-2 transition-all active:scale-95"
                >
                  <Plus size={18} /> Registrar Interacción
                </button>
              </div>
            </div>

            {/* Timeline / Feed */}
            <div className="flex-1 overflow-y-auto p-8">
              <div className="space-y-6 max-w-3xl mx-auto">
                {accountInteractions.map((interaction) => (
                  <div key={interaction.ID} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    {/* Encabezado Tarjeta */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getChannelBg(interaction.Canal_Atencion)}`}>
                          {getChannelIcon(interaction.Canal_Atencion)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-800">{interaction.Tipo_Interaccion}</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs font-medium text-gray-500">{getRelativeTime(interaction.Fecha_Hora)}</span>
                        </div>
                      </div>
                      <div className="text-xs font-mono text-gray-400 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(interaction.Fecha_Hora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>

                    {/* Cuerpo Tarjeta */}
                    <div className="pl-[52px]">
                      <h4 className="text-sm font-bold text-gray-900 mb-1">{interaction.Canal_Atencion} - {interaction.Sentido_Contacto || 'Entrante'}</h4>
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {interaction.Notas_Detalle}
                      </p>
                    </div>

                    {/* Footer Tarjeta */}
                    <div className="pl-[52px] mt-4 pt-4 border-t border-gray-50">
                      {/* Archivos Adjuntos */}
                      {interaction.Adjuntos && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {interaction.Adjuntos.split(',').map((file: string, idx: number) => (
                            <a 
                              key={idx}
                              href={`${API_URL}/interactions/${interaction.ID}/download/${file}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 transition-colors"
                            >
                              <Download size={14} /> {file}
                            </a>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                          {(interaction.Usuario_Registro || 'U').charAt(0)}
                        </div>
                        <span className="text-xs text-gray-400 font-medium">
                          Registrado por <span className="text-gray-600">{interaction.Usuario_Registro || 'Sistema'}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {accountInteractions.length === 0 && (
                  <div className="text-center py-20 opacity-50">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                      <MessageCircle size={40} />
                    </div>
                    <h3 className="text-gray-900 font-bold text-lg">Sin interacciones</h3>
                    <p className="text-gray-500">No hay registros históricos para este cliente.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
            <div className="w-24 h-24 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center mb-6">
              <Search size={40} className="text-blue-200" />
            </div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">Selecciona un Cliente</h2>
            <p className="text-sm text-gray-500 max-w-xs text-center">
              Utiliza el buscador de la izquierda para encontrar un cliente y ver su historial completo de interacciones.
            </p>
          </div>
        )}
      </div>

      {/* MODAL DE REGISTRO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* 1. ENCABEZADO */}
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-start bg-white shrink-0">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Registrar Nueva Interacción</h3>
                <p className="text-sm text-gray-500 mt-1">Complete los detalles de la comunicación con el cliente.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24}/>
              </button>
            </div>
            
            {/* 2. CUERPO DEL FORMULARIO */}
            <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
              
              {/* Selector de Tipo */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-3 block tracking-wider">Tipo de interacción</label>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { id: 'Llamada', icon: Phone, label: 'Teléfono' },
                    { id: 'Correo', icon: Mail, label: 'Correo' },
                    { id: 'Reunión', icon: Video, label: 'Reunión' },
                    { id: 'Nota', icon: FileText, label: 'Nota' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setForm({ ...form, canal: type.id })}
                      className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all ${
                        form.canal === type.id 
                          ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' 
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      <type.icon size={24} className="mb-2" />
                      <span className="text-xs font-bold">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Asunto */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block tracking-wider">Asunto</label>
                <input 
                  className="input-field w-full" 
                  placeholder="Ej. Consulta de saldo, Renovación de contrato..."
                  value={form.asunto}
                  onChange={e => setForm({...form, asunto: e.target.value})}
                />
              </div>

              {/* Fila Fecha/Hora y Contacto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block tracking-wider">Fecha y Hora</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input type="date" className="input-field w-full pl-10" value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} />
                    </div>
                    <div className="relative w-32">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input type="time" className="input-field w-full pl-10" value={form.hora} onChange={e => setForm({...form, hora: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block tracking-wider">Contacto Asociado</label>
                  <select className="input-field w-full" value={form.contacto} onChange={e => setForm({...form, contacto: e.target.value})}>
                    <option value="">Seleccionar contacto...</option>
                    {contacts.map(c => (
                      <option key={c.ID} value={c.ID}>{c.Nombre} {c.Apellido}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block tracking-wider">Descripción</label>
                <textarea 
                  className="input-field w-full h-32 resize-none py-3 leading-relaxed"
                  placeholder="Escribe aquí los detalles importantes de la interacción..."
                  value={form.descripcion}
                  onChange={e => setForm({...form, descripcion: e.target.value})}
                />
              </div>

              {/* Archivos Adjuntos */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block tracking-wider">Archivos Adjuntos</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                  <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileSelect} />
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-full mb-3"><UploadCloud size={24} /></div>
                  <p className="text-sm font-bold text-gray-700">Haz clic para subir o arrastra archivos</p>
                  <p className="text-xs text-gray-400 mt-1">Soporta PDF, JPG, PNG (Máx. 10MB)</p>
                </div>
                
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500"><FileIcon size={16}/></div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-700 truncate">{file.name}</p>
                            <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <button onClick={() => removeFile(idx)} className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 3. PIE DEL MODAL */}
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSubmit} 
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center gap-2 transition-all active:scale-95"
              >
                <Save size={18}/> Guardar Interacción
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractionsPage