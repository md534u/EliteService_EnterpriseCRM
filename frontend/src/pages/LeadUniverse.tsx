import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, User, ArrowRight, CheckCircle, Search, Filter, Building2 } from 'lucide-react';
import { API_URL } from '../config';

const LeadUniverse = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/leads/`);
      const sorted = response.data.sort((a: any, b: any) => 
        new Date(b.Fecha_Registro).getTime() - new Date(a.Fecha_Registro).getTime()
      );
      setLeads(sorted);
    } catch (error) {
      console.error("Error al obtener leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToClient = async (lead: any) => {
    const businessName = lead.Razon_Social || `${lead.Nombre} ${lead.Apellido_Paterno}`;
    
    if (!window.confirm(`¿Confirmas la conversión de "${businessName}"?`)) return;

    try {
      setLoading(true);
      // USAMOS TU ENDPOINT REAL DE BACKEND (leads.py)
      const response = await axios.post(`${API_URL}/leads/convert/${lead.Folio}`);
      
      if (response.status === 200) {
        alert(`✅ Éxito: ${businessName} ahora es Cliente.`);
        fetchLeads(); // Recargamos para ver el estado "CONVERTIDO"
      }
    } catch (error: any) {
      console.error("Error en conversión:", error);
      alert(error.response?.data?.detail || "Error en el servidor al convertir lead.");
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(l => {
    const term = searchTerm.toLowerCase();
    const name = (l.Razon_Social || `${l.Nombre} ${l.Apellido_Paterno}`).toLowerCase();
    const rfc = (l.RFC_Empresa || l.RFC || "").toLowerCase();
    return name.includes(term) || rfc.includes(term) || (l.Folio || "").toLowerCase().includes(term);
  });

  if (loading && leads.length === 0) return <div className="p-10 text-center text-gray-500">Cargando prospectos...</div>;

  return (
    <div className="p-8 max-w-[1600px] mx-auto bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Filter size={24} className="text-blue-600"/> Universo de Prospectos
          </h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-800" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, folio o RFC..." 
            className="pl-10 pr-4 py-2 border rounded-lg outline-none w-80 text-sm bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-300 text-gray-600 font-bold uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4">Folio</th>
              <th className="px-6 py-4">Razón Social / Empresa</th>
              <th className="px-6 py-4">Representante</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredLeads.map((lead) => {
              const isConverted = lead.Estado_CRM === 'CONVERTIDO';
              const businessName = lead.Razon_Social || `${lead.Nombre} ${lead.Apellido_Paterno}`;

              return (
                <tr key={lead.Folio} className={isConverted ? 'opacity-60 bg-gray-50' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${isConverted ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {lead.Estado_CRM || 'NUEVO'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{lead.Folio}</td>
                  <td className="px-6 py-4 font-bold text-gray-800">
                    <Building2 size={14} className="inline mr-2 text-gray-400"/> {businessName}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{lead.Nombre} {lead.Apellido_Paterno}</td>
                  <td className="px-6 py-4 text-right">
                    {!isConverted && (
                      <button 
                        onClick={() => handleConvertToClient(lead)}
                        className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
                      >
                        Convertir <ArrowRight size={12} className="inline ml-1"/>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadUniverse;