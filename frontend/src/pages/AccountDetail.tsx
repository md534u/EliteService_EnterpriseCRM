import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import { 
  Building2, 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Activity, 
  Edit,
  Plus,
  MessageCircle,
  Ticket,
  Trash2,
  CheckCircle,
  AlertCircle,
  ClipboardList // Nuevo icono para Gestiones
} from 'lucide-react';

// --- IMPORTACIONES NUEVAS ---
import GestionList, { type GestionOperativa } from '../components/GestionList';
import GestionForm from '../components/GestionForm';
// -----------------------------
import { useToast } from '../context/ToastContext'; // 👇 Importar Hook

import AccountEditForm from '../components/AccountEditForm';
import { ContactForm } from '../components/ContactForm'; 

const contactAvatarStyles = [
  { bg: 'bg-indigo-50', text: 'text-indigo-500' },
  { bg: 'bg-emerald-50', text: 'text-emerald-500' },
  { bg: 'bg-amber-50', text: 'text-amber-500' },
  { bg: 'bg-rose-50', text: 'text-rose-500' },
  { bg: 'bg-sky-50', text: 'text-sky-500' },
  { bg: 'bg-violet-50', text: 'text-violet-500' },
];

const getContactColor = (id: any) => {
  if (!id) return contactAvatarStyles[0];
  const index = typeof id === 'number' ? id : parseInt(String(id).slice(-1) || '0');
  return contactAvatarStyles[(isNaN(index) ? 0 : index) % contactAvatarStyles.length];
};

const AccountDetails = () => {
  const { id } = useParams();
  
  // Estados
  const [account, setAccount] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  
  // --- ESTADO REFÁCTORIZADO PARA GESTIONES ---
  const [gestiones, setGestiones] = useState<GestionOperativa[]>([]);
  const [isGestionModalOpen, setIsGestionModalOpen] = useState(false);
  const [selectedGestion, setSelectedGestion] = useState<GestionOperativa | null>(null);
  // -------------------------------------------

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('detalle');
  
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false); 
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [deletingContactId, setDeletingContactId] = useState<string | null>(null);
  const { addToast } = useToast(); // 👇 Usar Hook Global

  const getServiceLevel = (lineas: any) => {
    const n = parseInt(lineas) || 0;
    if (n >= 100) return { label: 'Diamante', color: 'bg-cyan-50 text-cyan-600 border-cyan-100' };
    if (n >= 51)  return { label: 'Platino', color: 'bg-slate-50 text-slate-600 border-slate-100' };
    if (n >= 6)   return { label: 'Oro', color: 'bg-yellow-50 text-yellow-600 border-yellow-100' };
    if (n >= 1)   return { label: 'Plata', color: 'bg-gray-50 text-gray-500 border-gray-100' };
    return { label: 'Sin Líneas', color: 'bg-red-50 text-red-500 border-red-100' };
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const accRes = await axios.get(`${API_URL}/accounts/${id}`);
      setAccount(accRes.data);

      const conRes = await axios.get(`${API_URL}/contacts/`);
      const allContacts = conRes.data || [];
      const filteredContacts = allContacts.filter((c: any) => 
        String(c.ID_Cuenta_FK) === String(id) || String(c.Account_ID) === String(id)
      );
      setContacts(filteredContacts);

      // --- FETCH GESTIONES (Antes Oportunidades) ---
      // Asumimos que el backend filtra o traemos todo y filtramos por ID_Cuenta_FK o nombre_cuenta
      const gesRes = await axios.get(`${API_URL}/gestiones/`);
      const allGestiones = gesRes.data || [];
      // Filtramos las gestiones que pertenezcan a esta cuenta (Asegúrate que tu backend guarde este vínculo)
      const filteredGestiones = allGestiones.filter((g: any) => 
        String(g.ID_Cuenta_FK) === String(id) || 
        g.nombre_cuenta === accRes.data.Nombre_Cuenta // Fallback por nombre si no usas FK numérica
      );
      setGestiones(filteredGestiones);
      // ---------------------------------------------

      const tickRes = await axios.get(`${API_URL}/tickets/by-account/${id}`);
      setTickets(tickRes.data);
    } catch (err) {
      console.error("Error al cargar los datos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [id]);

  const handleUpdateAccount = async (updatedData: any) => {
    try {
      const { ID, id: _id, Cantidad_Lineas, FechaAlta, ...cleanData } = updatedData;
      const response = await axios.put(`${API_URL}/accounts/${id}`, cleanData);
      
      if (response.status === 200 || response.status === 204) {
        setIsAccountModalOpen(false);
        fetchAllData();
      }
    } catch (err: any) {
      console.log("Error con PUT, intentando fallback con PATCH...");
      try {
        const { ID, id: _id, Cantidad_Lineas, FechaAlta, ...cleanData } = updatedData;
        await axios.patch(`${API_URL}/accounts/${id}`, cleanData);
        setIsAccountModalOpen(false);
        fetchAllData();
      } catch (finalErr) {
        console.error("Error definitivo:", finalErr);
        alert("No se pudo actualizar.");
      }
    }
  };

  const handleSaveContact = async (contactData: any) => {
    try {
      if (selectedContact) {
        await axios.put(`${API_URL}/contacts/${selectedContact.ID}`, contactData);
      } else {
        const payload = { ...contactData, ID_Cuenta_FK: id };
        await axios.post(`${API_URL}/contacts/`, payload);
      }
      setIsContactModalOpen(false);
      setSelectedContact(null);
      fetchAllData();
    } catch (err) {
      alert("Error al guardar el contacto");
    }
  };

  // --- HANDLER PARA GUARDAR GESTIONES ---
  const handleSaveGestion = async (data: any) => {
    try {
      if (selectedGestion) {
        // Editar
        await axios.put(`${API_URL}/gestiones/${selectedGestion.id}`, data);
      } else {
        // Crear nueva (Inyectamos el contexto de la cuenta actual)
        const payload = { 
          ...data, 
          // Ajusta estos campos según cómo tu backend enlace cuentas
          ID_Cuenta_FK: id, 
          nombre_cuenta: account.Nombre_Cuenta, 
          nombre_representante: account.Nombre_Representante 
        };
        await axios.post(`${API_URL}/gestiones/`, payload);
      }
      setIsGestionModalOpen(false);
      fetchAllData();
      addToast("Gestión guardada correctamente", "success"); // 👇 Usar addToast
    } catch (err) {
      console.error(err);
      alert("Error al guardar la gestión");
    }
  };
  // --------------------------------------

  const handleDeleteContact = async (contactId: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este contacto?")) return;
    setDeletingContactId(contactId);
    setTimeout(async () => {
      try {
        await axios.delete(`${API_URL}/contacts/${contactId}`);
        addToast("Contacto eliminado correctamente", 'success'); // 👇 Usar addToast
        setContacts(prev => prev.filter(c => c.ID !== contactId));
      } catch (err) {
        addToast("Hubo un error al intentar eliminar el contacto.", 'error'); // 👇 Usar addToast
        setDeletingContactId(null);
      }
    }, 300);
  };

  if (loading) return <div className="p-10 text-center text-gray-400 font-medium font-sans italic">Sincronizando perfil...</div>;
  if (!account) return <div className="p-10 text-center text-red-500 font-semibold font-sans">Cuenta no encontrada</div>;

  const level = getServiceLevel(account.Cantidad_Lineas);

  return (
    <div className="bg-gray-50 min-h-screen p-8 font-sans text-gray-900">
      <div className="max-w-[1400px] mx-auto">
        <Link to="/universe" className="text-gray-400 hover:text-blue-500 flex items-center gap-1 text-sm mb-6 transition-colors font-medium">
          <ArrowLeft size={16}/> Volver al Universo
        </Link>
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center text-white shadow-sm">
              <Building2 size={32}/>
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-gray-800 tracking-tight">{account.Nombre_Cuenta}</h1>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-gray-400 text-xs font-medium bg-gray-100 px-2 py-0.5 rounded border border-gray-200">ID: #{account.ID}</span>
                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-emerald-100 tracking-wider">
                  {account.Status || 'ACTIVO'}
                </span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setIsAccountModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-blue-700 shadow-md transition-all active:scale-95"
          >
            <Edit size={18} /> Editar Cuenta
          </button>
        </div>

        {/* NAVEGACIÓN DE PESTAÑAS (Renombrada Oportunidades -> Gestiones) */}
        <div className="flex gap-10 border-b border-gray-200 mb-8">
          {[
            { id: 'detalle', label: 'Detalle de la Cuenta' },
            { id: 'contactos', label: 'Contactos' },
            { id: 'gestiones', label: 'Gestiones Operativas' }, // <-- CAMBIO AQUÍ
            { id: 'tickets', label: 'Tickets' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-xs font-semibold uppercase tracking-widest transition-all relative ${
                activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            
            {/* DETALLES */}
            {activeTab === 'detalle' && (
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
                <div className="bg-gray-200 px-8 py-4 border-b border-gray-300 font-bold text-gray-600 uppercase text-[11px] tracking-widest">
                  Información General
                </div>
                <div className="p-8 grid grid-cols-2 gap-8">
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1.5 tracking-wider">RFC Fiscal</label>
                    <p className="text-sm font-medium text-gray-700 font-mono bg-gray-50 inline-block px-2 py-0.5 rounded border border-gray-200">{account.RFC}</p>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1.5 tracking-wider">Giro Comercial</label>
                    <p className="text-sm font-medium text-gray-700">{account.Giro_Empresa}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1.5 tracking-wider">Domicilio Completo</label>
                    <p className="text-sm font-medium text-gray-700 leading-relaxed">{account.Domicilio_Fiscal}</p>
                  </div>
                </div>
              </section>
            )}

            {/* CONTACTOS */}
            {activeTab === 'contactos' && (
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-gray-200 px-8 py-4 border-b border-gray-300 flex justify-between items-center">
                  <h3 className="font-bold text-gray-600 uppercase text-[11px] tracking-widest">Contactos Vinculados</h3>
                  <button onClick={() => { setSelectedContact(null); setIsContactModalOpen(true); }} className="bg-white text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border border-blue-200 flex items-center gap-1.5 transition-all shadow-sm">
                    <Plus size={14}/> Añadir Contacto
                  </button>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                  {contacts.map((c: any) => {
                    const colors = getContactColor(c.ID);
                    const fullName = c.Nombre_Completo || `${c.Nombre || ''} ${c.Apellido_Paterno || c.Apellido || ''}`.trim() || 'C';
                    const isDeleting = deletingContactId === c.ID;
                    return (
                      <div key={c.ID || Math.random()} className={`p-4 border border-gray-100 rounded-xl flex items-center gap-4 hover:border-blue-100 hover:bg-blue-50/10 transition-all duration-300 group relative ${isDeleting ? 'opacity-0 scale-95 translate-x-4' : ''}`}>
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => { setSelectedContact(c); setIsContactModalOpen(true); }} className="p-1.5 text-gray-300 hover:text-blue-500 transition-colors" title="Editar">
                            <Edit size={14}/>
                          </button>
                          <button onClick={() => handleDeleteContact(c.ID)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors" title="Eliminar">
                            <Trash2 size={14}/>
                          </button>
                        </div>
                        <div className={`w-12 h-12 ${colors.bg} ${colors.text} rounded-full flex items-center justify-center font-semibold text-lg transition-transform duration-300 group-hover:scale-105 shadow-sm`}>
                          {fullName[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors truncate">{fullName}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-2">{c.Puesto || c.Rol || 'Representante'}</p>
                          <div className="flex items-center gap-2">
                            <a href={`tel:${c.Telefono}`} className="p-1.5 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-gray-100"><Phone size={14} /></a>
                            <a href={`mailto:${c.Email || c.Correo}`} className="p-1.5 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-gray-100"><Mail size={14} /></a>
                            <a href={`https://wa.me/${(c.Telefono || '').replace(/\D/g,'')}`} target="_blank" className="p-1.5 bg-gray-50 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg border border-gray-100"><MessageCircle size={14} /></a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* --- SECCION GESTIONES (REFÁCTORIZADA) --- */}
            {activeTab === 'gestiones' && (
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4">
                <div className="bg-gray-200 px-8 py-4 border-b border-gray-300 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <ClipboardList size={16} className="text-gray-500"/>
                    <h3 className="font-bold text-gray-600 uppercase text-[11px] tracking-widest">
                      Gestiones Operativas
                    </h3>
                  </div>
                  <button 
                    onClick={() => { setSelectedGestion(null); setIsGestionModalOpen(true); }}
                    className="bg-white text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border border-blue-200 flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Plus size={14}/> Nueva Gestión
                  </button>
                </div>

                <div className="p-0">
                   {/* Renderizamos el nuevo componente GestionList */}
                   <GestionList 
                      gestiones={gestiones} 
                      onEdit={(gestion) => { setSelectedGestion(gestion); setIsGestionModalOpen(true); }} 
                      onCreate={() => { setSelectedGestion(null); setIsGestionModalOpen(true); }} 
                    />
                </div>
              </section>
            )}
            {/* ----------------------------------------- */}

            {/* TICKETS */}
            {activeTab === 'tickets' && (
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4">
                <div className="bg-gray-200 px-8 py-4 border-b border-gray-300 flex justify-between items-center">
                  <h3 className="font-bold text-gray-600 uppercase text-[11px] tracking-widest">
                    Tickets de Soporte
                  </h3>
                  <Link 
                    to="/tickets/create" 
                    state={{ accountId: account.ID, accountName: account.Nombre_Cuenta }}
                    className="bg-white text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border border-blue-200 flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Plus size={14}/> Nuevo Ticket
                  </Link>
                </div>
                <div className="p-0">
                  {tickets.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm italic">No hay tickets registrados para esta cuenta.</div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {tickets.map((t: any) => (
                        <Link 
                          to="/tickets" 
                          state={{ ticketId: t.ID }}
                          key={t.ID} 
                          className="p-4 hover:bg-gray-50 flex items-center gap-4 transition-colors group"
                        >
                          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <Ticket size={20} />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="text-sm font-bold text-gray-800">{t.Titulo || 'Sin Asunto'}</h4>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                                t.Estado === 'Abierto' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                t.Estado === 'En Proceso' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                'bg-gray-50 text-gray-500 border-gray-100'
                              }`}>
                                {t.Estado}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-1">{t.Notas || 'Sin descripción'}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-6">
            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 flex items-center gap-3 bg-gray-200 border-b border-gray-300 font-bold text-[11px] text-gray-600 uppercase tracking-widest">
                <Activity size={14} className="text-emerald-500" /> Estado de la Cuenta
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-medium text-gray-400">Salud de Cuenta</span>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">100%</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mb-3"><div className="bg-emerald-400 h-full w-full"></div></div>
                <p className="text-[10px] text-gray-400 text-center font-normal italic tracking-tight">Sin bloqueos ni adeudos pendientes.</p>
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 flex items-center gap-3 bg-gray-200 border-b border-gray-300 font-bold text-[11px] text-gray-600 uppercase tracking-widest">
                <ShieldCheck size={16} className="text-blue-500" /> Clasificación
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">SLA Nivel</p>
                    <span className={`${level.color} text-[10px] font-semibold px-2.5 py-1 rounded-md border tracking-tight`}>{level.label}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Líneas</p>
                    <p className="text-xl font-semibold text-gray-700 tracking-tighter">{account.Cantidad_Lineas || 0}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 flex items-center gap-3 bg-gray-200 border-b border-gray-300 font-bold text-[11px] text-gray-600 uppercase tracking-widest">
                <Phone size={14} className="text-blue-500"/> Contacto Principal
              </div>
              <div className="p-8 space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="p-2 bg-blue-50 text-blue-500 rounded-xl shadow-sm"><User size={16}/></div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-0.5">Representante</p>
                    <p className="text-sm font-semibold text-gray-700 truncate">{account.Nombre_Representante}</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="p-2 bg-blue-50 text-blue-500 rounded-xl shadow-sm"><Phone size={16}/></div>
                  <div className="min-w-0"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-0.5">Teléfono</p><p className="text-sm font-semibold text-gray-700 truncate">{account.Telefono}</p></div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="p-2 bg-blue-50 text-blue-500 rounded-xl shadow-sm"><Mail size={16}/></div>
                  <div className="min-w-0"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-0.5">Email</p><p className="text-sm font-semibold text-gray-700 lowercase truncate">{account.Email}</p></div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>

      {/* MODALES */}
      <GestionForm 
        isOpen={isGestionModalOpen} 
        onClose={() => setIsGestionModalOpen(false)} 
        onSave={handleSaveGestion} 
        initialData={selectedGestion} 
        defaultAccountName={account.Nombre_Cuenta} 
        defaultContactName={account.Nombre_Representante} 
      />

      <AccountEditForm isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} onSave={handleUpdateAccount} initialData={account} />
      
      <ContactForm 
        isOpen={isContactModalOpen} 
        onClose={() => { setIsContactModalOpen(false); setSelectedContact(null); }} 
        onSave={handleSaveContact} 
        initialData={selectedContact} 
        accountId={account.ID}
      />
    </div>
  );
};

export default AccountDetails;