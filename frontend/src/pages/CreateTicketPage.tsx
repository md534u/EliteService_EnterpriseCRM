import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Building, Calendar, CloudUpload, 
  FileText, Flag, Info, User, AlertCircle, X, Search, ChevronDown, CheckCircle, ArrowRight
} from 'lucide-react';
import { API_URL } from '../config';

interface Cuenta {
  ID: string;
  Nombre_Cuenta: string;
  Nombre_Representante?: string; // Agregado para TypeScript
}

interface Contacto {
  ID: string | number;
  Nombre: string;
  Apellido?: string;
  Puesto?: string;
}

const CreateTicketPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const CURRENT_USER = "Marcos Victor de la O Cano";
  
  // Estados del formulario
  const [incidentType, setIncidentType] = useState<'Incidencia' | 'Requerimiento'>('Incidencia');
  const [accountId, setAccountId] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedContact, setSelectedContact] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Normal');
  const [deadline, setDeadline] = useState('');
  const [agent, setAgent] = useState(CURRENT_USER);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Datos externos y estado de carga
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [contacts, setContacts] = useState<Contacto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Estado para el modal de éxito
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState('');

  // 1. Cargar cuentas al montar el componente
  useEffect(() => {
    const fetchCuentas = async () => {
      try {
        const response = await axios.get(`${API_URL}/accounts/`);
        setCuentas(response.data);
      } catch (error) {
        console.error('Error al cargar cuentas:', error);
      }
    };
    fetchCuentas();
  }, []);

  // 2. Pre-llenar datos si vienen de navegación (ej. desde AccountDetail)
  useEffect(() => {
    if (location.state?.accountId && location.state?.accountName) {
      setAccountId(location.state.accountId);
      setSearchTerm(location.state.accountName);
    }
  }, [location.state]);

  // 3. LOGICA CORREGIDA: Cargar contactos + Representante Legal
  useEffect(() => {
    // Si no hay cuenta seleccionada, limpiar todo
    if (!accountId) {
      setContacts([]);
      setSelectedContact('');
      return;
    }

    const fetchContactsAndRep = async () => {
      let mixedContacts: Contacto[] = [];
      let defaultSelection = '';

      // A) Buscar la cuenta en memoria para sacar al Representante Legal
      const currentAccount = cuentas.find(c => String(c.ID) === String(accountId));
      
      if (currentAccount && currentAccount.Nombre_Representante) {
        const repName = currentAccount.Nombre_Representante;
        // Creamos un objeto de contacto "virtual" para el representante
        mixedContacts.push({
          ID: 'rep_legal',
          Nombre: repName,
          Apellido: '(Representante Legal)',
          Puesto: 'Titular'
        });
        // Lo preparamos como selección por defecto
        defaultSelection = `${repName} (Representante Legal)`;
      }

      // B) Obtener contactos registrados en la base de datos
      try {
        const res = await axios.get(`${API_URL}/contacts/by-account/${accountId}`);
        if (Array.isArray(res.data) && res.data.length > 0) {
          mixedContacts = [...mixedContacts, ...res.data];
        }
      } catch (e) {
        console.error("Error cargando contactos adicionales:", e);
      }

      // C) Actualizar estado
      setContacts(mixedContacts);
      
      // Si no se ha seleccionado nada aún, seleccionar al representante
      if (!selectedContact && defaultSelection) {
        setSelectedContact(defaultSelection);
      }
    };

    fetchContactsAndRep();
  }, [accountId, cuentas]); // Dependencia agregada: cuentas

  const filteredAccounts = cuentas.filter(c => 
    c.Nombre_Cuenta.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accountId || !subject || !description) {
      alert("Por favor complete los campos obligatorios marcados con *.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('Titulo', subject);
    formData.append('Notas', description);
    formData.append('Prioridad', priority);
    formData.append('Estado', 'Abierto');
    formData.append('Agente', agent || '');
    formData.append('Cuenta_ID', accountId);
    formData.append('Contacto', selectedContact);
    formData.append('Tipo1', incidentType);
    formData.append('Fecha', deadline || new Date().toISOString().split('T')[0]);
    formData.append('Tipo2', ''); // Puedes expandir esto luego
    formData.append('Tipo3', '');

    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    try {
      const response = await axios.post(`${API_URL}/tickets/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const newFolio = response.data.ID;
      setCreatedTicketId(newFolio);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error al crear ticket:', error);
      alert('Error al conectar con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-900">
      
      {/* 1. CABECERA DE PÁGINA */}
      <div className="max-w-4xl mx-auto mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-500 hover:text-[#BF0CEA] transition-colors mb-4 text-sm font-bold"
        >
          <ArrowLeft size={16} /> Volver al listado
        </button>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Crear Ticket de Soporte</h1>
        <p className="text-gray-500 mt-2 font-medium">Complete el formulario a continuación para registrar una nueva incidencia o solicitud de servicio.</p>
      </div>

      {/* 2. CONTENEDOR DEL FORMULARIO PRINCIPAL */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* Fila 1 (Dos Columnas) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Columna Izquierda - Tipo de Incidencia */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo de Incidencia</label>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setIncidentType('Incidencia')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${incidentType === 'Incidencia' ? 'bg-white text-[#E72E70] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <AlertCircle size={16} /> Incidencia
                </button>
                <button
                  type="button"
                  onClick={() => setIncidentType('Requerimiento')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${incidentType === 'Requerimiento' ? 'bg-white text-[#E72E70] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <FileText size={16} /> Requerimiento
                </button>
              </div>
            </div>

            {/* Columna Derecha - Cuenta Empresarial */}
            <div className="space-y-4">
              <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cuenta Empresarial <span className="text-[#E72E70]">*</span></label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsDropdownOpen(true);
                    if (accountId) setAccountId(''); // Limpiar selección si edita texto
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                  className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#BF0CEA]/20 focus:border-[#BF0CEA] transition-all placeholder:text-gray-400 text-gray-700"
                />
                {isDropdownOpen && (
                  <div className="absolute z-10 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                    {filteredAccounts.length > 0 ? (
                      filteredAccounts.map((cuenta) => (
                        <div
                          key={cuenta.ID}
                          onClick={() => {
                            setAccountId(cuenta.ID);
                            setSearchTerm(cuenta.Nombre_Cuenta);
                            setIsDropdownOpen(false);
                          }}
                          className="px-4 py-3 hover:bg-[#BF0CEA]/10 cursor-pointer text-sm font-medium text-gray-700 transition-colors flex items-center gap-2"
                        >
                          <Building size={14} className="text-gray-400" />
                          {cuenta.Nombre_Cuenta}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-400 italic">
                        No se encontraron resultados
                      </div>
                    )}
                  </div>
                )}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  {isDropdownOpen ? <Search size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
              </div>

              {/* Selector de Contacto (CORREGIDO) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contacto Solicitante</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    value={selectedContact}
                    onChange={(e) => setSelectedContact(e.target.value)}
                    disabled={!accountId}
                    className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#BF0CEA]/20 focus:border-[#BF0CEA] transition-all appearance-none cursor-pointer text-gray-700 disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <option value="">{contacts.length === 0 ? (accountId ? "Sin contactos registrados" : "Seleccione una cuenta primero") : "Seleccione un contacto..."}</option>
                    
                    {contacts.map((c) => {
                        // Construcción inteligente del nombre para el Value del select
                        const val = c.ID === 'rep_legal'
                            ? `${c.Nombre} ${c.Apellido}`
                            : `${c.Nombre} ${c.Apellido || ''}`.trim();

                        return (
                            <option key={c.ID} value={val}>
                                {c.Nombre} {c.Apellido || ''} {c.Puesto ? `(${c.Puesto})` : ''}
                            </option>
                        );
                    })}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><ChevronDown size={16} /></div>
                </div>
              </div>
            </div>
          </div>

          {/* Fila 2 - Asunto */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Asunto <span className="text-[#E72E70]">*</span></label>
            <input 
              type="text" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Resumen breve del problema..." 
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#BF0CEA]/20 focus:border-[#BF0CEA] transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Fila 3 - Descripción */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Descripción Detallada <span className="text-[#E72E70]">*</span></label>
            <div className="relative">
              <textarea 
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describa el problema con el mayor detalle posible..." 
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#BF0CEA]/20 focus:border-[#BF0CEA] transition-all resize-y placeholder:text-gray-400"
              ></textarea>
              <span className="absolute bottom-3 right-4 text-[10px] font-bold text-gray-400 bg-white/80 px-1 backdrop-blur-sm rounded">Markdown soportado</span>
            </div>
          </div>

          {/* Fila 4 - Carga de Archivos */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Adjuntos</label>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer group ${selectedFile ? 'border-[#BF0CEA] bg-[#BF0CEA]/10' : 'border-gray-200 hover:bg-gray-50 hover:border-[#BF0CEA]/50'}`}
            >
              {selectedFile ? (
                <div className="flex items-center gap-4 w-full max-w-md bg-white p-4 rounded-xl shadow-sm border border-[#BF0CEA]/30">
                  <div className="p-3 bg-[#BF0CEA]/20 text-[#BF0CEA] rounded-lg"><FileText size={24} /></div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"><X size={20} /></button>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-[#BF0CEA]/10 text-[#BF0CEA] rounded-full mb-3 group-hover:scale-110 group-hover:shadow-sm transition-all"><CloudUpload size={24} /></div>
                  <p className="text-sm font-bold text-gray-700 group-hover:text-[#BF0CEA] transition-colors">Haga clic para subir o arrastre archivos aquí</p>
                  <p className="text-xs text-gray-400 mt-1">Soporta JPG, PNG, PDF (Máx. 10MB)</p>
                </>
              )}
            </div>
          </div>

          {/* Fila 5 - Detalles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Prioridad */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Prioridad</label>
              <div className="relative">
                <Flag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#BF0CEA]/20 focus:border-[#BF0CEA] transition-all appearance-none cursor-pointer text-gray-700"
                >
                  <option value="Normal">Normal</option>
                  <option value="Alta">Alta</option>
                  <option value="Crítica">Crítica</option>
                  <option value="Urgente">Urgente</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>

            {/* Fecha Límite */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha Límite</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="date" 
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#BF0CEA]/20 focus:border-[#BF0CEA] transition-all text-gray-600"
                />
              </div>
            </div>

            {/* Asignar Responsable */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Asignar Responsable</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select 
                  value={agent}
                  onChange={(e) => setAgent(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#BF0CEA]/20 focus:border-[#BF0CEA] transition-all appearance-none cursor-pointer text-gray-700"
                >
                  <option value="">Sin asignar</option>
                  <option value={CURRENT_USER}>{CURRENT_USER} (Yo)</option>
                  <option value="Juan Pérez">Juan Pérez</option>
                  <option value="María García">María García</option>
                  <option value="Carlos López">Carlos López</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>
          </div>

          {/* 3. PIE DE FORMULARIO */}
          <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
              <Info size={14} />
              <span>Los campos marcados con <span className="text-[#E72E70]">*</span> son obligatorios.</span>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button 
                type="button" 
                onClick={() => navigate(-1)}
                className="flex-1 md:flex-none px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 hover:text-gray-800 transition-all"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-[#E72E70] text-white text-sm font-bold hover:bg-[#be1b55] shadow-lg shadow-[#E72E70]/30 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creando...' : 'Crear Ticket'}
              </button>
            </div>
          </div>

        </form>
      </div>

      {/* MODAL DE ÉXITO */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100 animate-in zoom-in-95 duration-300">
            <div className="bg-[#BF0CEA]/10 p-8 flex flex-col items-center justify-center border-b border-[#BF0CEA]/20">
              <div className="w-20 h-20 bg-[#BF0CEA]/20 text-[#BF0CEA] rounded-full flex items-center justify-center mb-4 shadow-sm ring-4 ring-white">
                <CheckCircle size={40} strokeWidth={3} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">¡Ticket Creado!</h2>
              <p className="text-[#BF0CEA] font-medium mt-1">La solicitud se registró correctamente</p>
            </div>
            
            <div className="p-8 text-center space-y-6">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Folio Generado</p>
                <div className="text-4xl font-black text-[#FF8226] tracking-tight font-mono bg-gray-50 py-4 rounded-2xl border-2 border-dashed border-gray-200 select-all">
                  {createdTicketId}
                </div>
              </div>
              
              <p className="text-sm text-gray-500 leading-relaxed">
                Hemos notificado al equipo de soporte. Puedes dar seguimiento al estado de tu solicitud con este folio.
              </p>

              <div className="flex flex-col gap-3 pt-2">
                <button 
                  onClick={() => navigate('/tickets', { state: { ticketId: createdTicketId } })}
                  className="w-full bg-[#E72E70] text-white py-4 rounded-xl font-bold hover:bg-[#be1b55] shadow-lg shadow-[#E72E70]/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Ver Detalle del Ticket <ArrowRight size={18} />
                </button>
                <button 
                  onClick={() => navigate('/tickets')}
                  className="w-full bg-white text-gray-600 py-4 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all"
                >
                  Volver al Listado
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTicketPage;