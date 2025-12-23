import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Eye, Briefcase, Building2 } from 'lucide-react';
import { API_URL } from '../config';

const Universe = () => {
  const [activeTab, setActiveTab] = useState('leads');
  const [leads, setLeads] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeads();
    fetchAccounts();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await axios.get(`${API_URL}/leads/?status=ACTIVO`);
      setLeads(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchAccounts = async () => {
    try {
      const res = await axios.get(`${API_URL}/accounts/`);
      setAccounts(res.data);
    } catch (e) { console.error(e); }
  };

  const convertLead = async (folio: string) => {
    if (!confirm('¿Confirma la conversión de este prospecto a Cliente?')) return;
    try {
      await axios.post(`${API_URL}/leads/convert/${folio}`);
      alert("Prospecto convertido exitosamente.");
      fetchLeads();
      fetchAccounts();
      setActiveTab('accounts');
    } catch (e) { alert("Error al convertir"); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Building2 className="text-att-blue" />
        Universo de Ventas B2B
      </h1>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'leads' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('leads')}
        >
          Prospectos Activos
          {activeTab === 'leads' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
        </button>
        <button
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'accounts' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('accounts')}
        >
          Clientes Empresariales
          {activeTab === 'accounts' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
        </button>
      </div>

      <div className="google-card min-h-[400px]">
        {activeTab === 'leads' && (
          <div>
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-lg font-bold text-gray-700">Listado de Prospectos a Calificar</h2>
               <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">{leads.length} Registros</span>
            </div>
            {leads.length === 0 ? (
              <p className="text-gray-400 text-center py-10">No hay prospectos activos.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs">
                    <tr>
                      <th className="px-4 py-3">Folio</th>
                      <th className="px-4 py-3">Razón Social / Nombre</th>
                      <th className="px-4 py-3">Teléfono</th>
                      <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {leads.map((lead: any) => (
                      <tr key={lead.Folio} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-gray-600">{lead.Folio}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {lead.Razon_Social || `${lead.Nombre} ${lead.Apellido_Paterno}`}
                          <div className="text-xs text-gray-400 font-normal">{lead.Segmento}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{lead.Telefono}</td>
                        <td className="px-4 py-3 text-right">
                          <button 
                            onClick={() => convertLead(lead.Folio)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-xs font-bold transition-colors shadow-sm"
                          >
                            Convertir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'accounts' && (
          <div>
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-lg font-bold text-gray-700">Cartera de Clientes</h2>
               <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">{accounts.length} Cuentas</span>
            </div>
            {accounts.length === 0 ? (
              <p className="text-gray-400 text-center py-10">No hay cuentas registradas.</p>
            ) : (
              <div className="grid gap-4">
                {accounts.map((acc: any) => (
                  <div key={acc.ID} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-all bg-white flex justify-between items-center group">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-att-blue transition-colors">{acc.Nombre_Cuenta}</h3>
                      <div className="flex gap-4 text-sm text-gray-500 mt-1">
                        <span>RFC: {acc.RFC}</span>
                        <span>•</span>
                        <span>ID: {acc.ID}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(`/universe/${acc.ID}`)}
                      className="bg-gray-100 text-gray-600 hover:bg-att-blue hover:text-white p-2 rounded-full transition-all"
                    >
                      <Eye size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Universe;
