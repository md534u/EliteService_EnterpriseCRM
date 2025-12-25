import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building, 
  User, 
  MapPin, 
  ArrowLeft, 
  FileText, 
  Briefcase, 
  Smartphone, 
  MessageSquare, 
  Edit, 
  Save 
} from 'lucide-react';
import clsx from 'clsx';
import { API_URL } from '../config';
import OpportunityList from '../components/OpportunityList';
import OpportunityForm from '../components/OpportunityForm';

const AccountDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [quotes, setQuotes] = useState([]);
  
  const [activeTab, setActiveTab] = useState('expediente');
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  const [isOpFormOpen, setIsOpFormOpen] = useState(false);
  const [editingOp, setEditingOp] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const accRes = await axios.get(`${API_URL}/accounts/${id}`);
      setAccount(accRes.data);
      setEditForm(accRes.data);

      const conRes = await axios.get(`${API_URL}/contacts/?account_id=${id}`);
      setContacts(conRes.data);

      const servRes = await axios.get(`${API_URL}/services/?account_id=${id}`);
      setServices(servRes.data);

      const opRes = await axios.get(`${API_URL}/opportunities/?account_id=${id}`);
      setOpportunities(opRes.data);

      const qtRes = await axios.get(`${API_URL}/quotes/?account_id=${id}`);
      setQuotes(qtRes.data);

    } catch (e) {
      console.error(e);
      alert("Error cargando datos de la cuenta.");
    }
  };

  const handleUpdateAccount = async () => {
    try {
      await axios.put(`${API_URL}/accounts/${id}`, editForm);
      setAccount(editForm);
      setEditMode(false);
      alert("Cuenta actualizada.");
    } catch (e) { alert("Error al actualizar"); }
  };

  const handleCreateOp = () => {
    setEditingOp(null);
    setIsOpFormOpen(true);
  };

  const handleEditOp = (op: any) => {
    setEditingOp(op);
    setIsOpFormOpen(true);
  };

  const handleSaveOp = async (opData: any) => {
    try {
      if (editingOp) {
        await axios.put(`${API_URL}/opportunities/${editingOp.ID}`, opData);
        alert('Oportunidad actualizada');
      } else {
        await axios.post(`${API_URL}/opportunities/`, { ...opData, ID_Cuenta_FK: id });
        alert('Oportunidad creada');
      }
      setIsOpFormOpen(false);
      fetchData(); // Refresh data
    } catch (e) {
      console.error(e);
      alert('Error al guardar oportunidad');
    }
  };

  if (!account) return <div className="p-10 text-center">Cargando...</div>;

  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={clsx(
        "flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors border-b-2",
        activeTab === id 
          ? "border-att-blue text-att-blue" 
          : "border-transparent text-gray-500 hover:text-gray-700"
      )}
    >
      <Icon size={16} />
      {label}
    </button>
  );

  return (
    <div>
      <button onClick={() => navigate('/universe')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-4 transition-colors">
        <ArrowLeft size={18} />
        Volver al Universo
      </button>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{account.Nombre_Cuenta}</h1>
          <div className="text-sm text-gray-500 mt-1 flex gap-4">
             <span>ID: {account.ID}</span>
             <span>•</span>
             <span>RFC: {account.RFC}</span>
             <span>•</span>
             <span className="bg-green-100 text-green-800 px-2 rounded-full text-xs font-bold py-0.5">{account.Segmento_Tipo}</span>
          </div>
        </div>
        <button 
           onClick={() => editMode ? handleUpdateAccount() : setEditMode(true)}
           className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium"
        >
          {editMode ? <Save size={18} /> : <Edit size={18} />}
          {editMode ? "Guardar Cambios" : "Editar Información"}
        </button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="google-card p-5">
           <div className="flex items-center gap-2 mb-3 text-att-blue font-bold uppercase text-xs tracking-wider">
             <Building size={16} /> Identidad
           </div>
           {editMode ? (
             <div className="space-y-2">
               <input className="input-field h-8 text-sm" value={editForm.Nombre_Cuenta} onChange={e => setEditForm({...editForm, Nombre_Cuenta: e.target.value})} placeholder="Nombre" />
               <input className="input-field h-8 text-sm" value={editForm.Giro_Empresa} onChange={e => setEditForm({...editForm, Giro_Empresa: e.target.value})} placeholder="Giro" />
             </div>
           ) : (
             <div className="space-y-1">
               <div className="font-medium text-gray-800">{account.Nombre_Cuenta}</div>
               <div className="text-sm text-gray-500">{account.Giro_Empresa || "Giro no registrado"}</div>
             </div>
           )}
        </div>

        <div className="google-card p-5">
           <div className="flex items-center gap-2 mb-3 text-att-blue font-bold uppercase text-xs tracking-wider">
             <MapPin size={16} /> Ubicación
           </div>
           {editMode ? (
             <input className="input-field h-8 text-sm" value={editForm.Domicilio_Fiscal} onChange={e => setEditForm({...editForm, Domicilio_Fiscal: e.target.value})} placeholder="Domicilio" />
           ) : (
             <div className="text-sm text-gray-600">
               {account.Domicilio_Fiscal || "Sin domicilio registrado"}
             </div>
           )}
        </div>

        <div className="google-card p-5">
           <div className="flex items-center gap-2 mb-3 text-att-blue font-bold uppercase text-xs tracking-wider">
             <User size={16} /> Representante Principal
           </div>
           {contacts.length > 0 ? (
             <div className="space-y-1">
               <div className="font-medium text-gray-800">{contacts[0].Nombre} {contacts[0].Apellido_Paterno}</div>
               <div className="text-sm text-gray-500">{contacts[0].Email}</div>
               <div className="text-sm text-gray-500">{contacts[0].Telefono}</div>
             </div>
           ) : (
             <div className="text-sm text-gray-400 italic">No hay contactos registrados</div>
           )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-t-xl border-b border-gray-200 flex px-4">
        <TabButton id="expediente" label="Expediente" icon={FileText} />
        <TabButton id="contactos" label="Contactos" icon={User} />
        <TabButton id="ops" label="Oportunidades" icon={Briefcase} />
        <TabButton id="servicios" label="Suscripciones" icon={Smartphone} />
        <TabButton id="cotizaciones" label="Cotizaciones" icon={MessageSquare} />
      </div>

      <div className="bg-white min-h-[400px] p-6 rounded-b-xl shadow-sm border border-gray-200 border-t-0">
        {activeTab === 'ops' && (
          <OpportunityList 
            opportunities={opportunities} 
            onCreate={handleCreateOp} 
            onEdit={handleEditOp}
            accountData={account}    // <--- AQUÍ ESTÁ LA MAGIA
            contacts={contacts}      // <--- Y AQUÍ
          />
        )}

        {activeTab === 'servicios' && (
          <div>
            <h3 className="text-lg font-bold text-gray-700 mb-4">Líneas Contratadas</h3>
            {services.length === 0 ? <p className="text-gray-400">No hay líneas activas.</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 uppercase text-xs font-bold text-gray-500">
                    <tr>
                      <th className="px-4 py-2">DN</th>
                      <th className="px-4 py-2">Plan</th>
                      <th className="px-4 py-2">Plazo</th>
                      <th className="px-4 py-2">Inicio</th>
                      <th className="px-4 py-2">Fin</th>
                      <th className="px-4 py-2">Renta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {services.map((s: any) => (
                      <tr key={s.ID_Servicio} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono font-medium">{s.DN || s.Línea_o_Circuito}</td>
                        <td className="px-4 py-3">{s.Plan_Contratado}</td>
                        <td className="px-4 py-3">{s.Plazo_Contratacion}</td>
                        <td className="px-4 py-3">{s.Inicio_Contrato}</td>
                        <td className="px-4 py-3 text-orange-600">{s.Fecha_Vencimiento}</td>
                        <td className="px-4 py-3 font-bold">${s.Costo_Mensual}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'expediente' && (
           <div className="text-center py-10 text-gray-500">
             <FileText size={48} className="mx-auto mb-4 text-gray-300" />
             <p>Gestión de documentos (Constancia Fiscal, INE, Acta Constitutiva).</p>
             <p className="text-xs mt-2">Funcionalidad de carga pendiente de migración completa.</p>
           </div>
        )}
         
        {activeTab === 'contactos' && (
            <div>
              {contacts.map((c: any) => (
                 <div key={c.ID} className="p-4 border border-gray-100 rounded mb-2 flex justify-between">
                    <div>
                       <div className="font-bold">{c.Nombre} {c.Apellido_Paterno}</div>
                       <div className="text-sm text-gray-500">{c.Rol}</div>
                    </div>
                    <div className="text-right text-sm">
                       <div>{c.Email}</div>
                       <div>{c.Telefono}</div>
                    </div>
                 </div>
              ))}
            </div>
        )}

        {activeTab === 'cotizaciones' && (
             <div>
               <h3 className="font-bold mb-4">Historial de Cotizaciones</h3>
               {quotes.map((q: any) => (
                  <div key={q.ID} className="flex justify-between items-center p-3 border-b hover:bg-gray-50">
                     <div>
                        <div className="font-medium text-att-blue">Cotización v{q.Version}</div>
                        <div className="text-xs text-gray-500">{q.Fecha_Emision}</div>
                     </div>
                     <div className="font-bold text-gray-800">${q.Total_Mensual} / mes</div>
                  </div>
               ))}
             </div>
        )}
      </div>

      <OpportunityForm 
        isOpen={isOpFormOpen}
        onClose={() => setIsOpFormOpen(false)}
        onSave={handleSaveOp}
        initialData={editingOp}
      />
    </div>
  );
};

export default AccountDetail;