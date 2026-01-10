import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, Search, MoreVertical, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const avatarStyles = [
  { bg: 'bg-indigo-50', text: 'text-indigo-500' },
  { bg: 'bg-emerald-50', text: 'text-emerald-500' },
  { bg: 'bg-amber-50', text: 'text-amber-500' },
  { bg: 'bg-rose-50', text: 'text-rose-500' },
  { bg: 'bg-sky-50', text: 'text-sky-500' },
  { bg: 'bg-violet-50', text: 'text-violet-500' },
];

interface Account {
  ID?: string | number;
  id?: string | number;
  Nombre_Cuenta?: string;
  nombre?: string;
  RFC?: string;
  rfc?: string;
  Giro_Empresa?: string;
  giro?: string;
}

const Universe = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAccounts = async () => {
    try {
      const response = await axios.get('https://crm-backend-56gq.onrender.com/accounts/');
      setAccounts(response.data);
    } catch (error) {
      console.error("Error cargando cuentas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccounts(); }, []);

  const getAvatarColor = (id: string | number, index: number) => {
    const numericId = typeof id === 'number' ? id : parseInt(String(id)) || index;
    return avatarStyles[numericId % avatarStyles.length];
  };

  const getName = (acc: Account) => acc.Nombre_Cuenta || acc.nombre || "Sin Nombre";
  const getRFC = (acc: Account) => acc.RFC || acc.rfc || "N/A";
  const getGiro = (acc: Account) => acc.Giro_Empresa || acc.giro || "No especificado";
  const getID = (acc: Account) => acc.ID || acc.id || "?";

  const filteredAccounts = accounts.filter(acc => 
    getName(acc).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getRFC(acc).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 font-sans bg-gray-100 min-h-screen text-gray-900">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 tracking-tight">
            <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
                <Building2 size={28} />
            </div>
            Universo de Cuentas
          </h1>
          <p className="text-gray-500 text-sm mt-2 font-medium ml-1">Gestión integral de la cartera empresarial y directorio.</p>
        </div>
        <Link to="/register" className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-black flex items-center gap-2 text-sm font-bold transition-all shadow-lg active:scale-95">
          <Plus size={18} /> Nueva Cuenta
        </Link>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 mb-8 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por Razón Social, RFC o ID..." 
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm text-gray-700 font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-20 text-center text-gray-400 text-sm font-medium">Cargando cuentas...</div>
        ) : (
          <table className="w-full">
            <thead>
              {/* HEADER DE TABLA: Dark Header para combinar con Sidebar */}
              <tr className="bg-gray-900 text-white border-b border-gray-800">
                <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-wider">Razón Social</th>
                <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider">Giro Comercial</th>
                <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider">RFC</th>
                <th className="px-6 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAccounts.map((account, index) => {
                const colors = getAvatarColor(getID(account), index);
                return (
                  <tr key={getID(account)} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <Link to={`/universe/${getID(account)}`} className="flex items-center">
                        <div className={`h-10 w-10 ${colors.bg} ${colors.text} rounded-full flex items-center justify-center text-sm font-bold transition-transform duration-300 group-hover:scale-110 shadow-sm`}>
                          {getName(account).charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors leading-tight">
                              {getName(account)}
                          </div>
                          <div className="text-[11px] text-gray-400 mt-1 font-medium uppercase tracking-wider">ID: {getID(account)}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-5">
                        <span className="text-sm text-gray-600 font-medium bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                            {getGiro(account)}
                        </span>
                    </td>
                    <td className="px-6 py-5">
                        <span className="text-xs font-mono font-bold text-gray-500">
                            {getRFC(account)}
                        </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="text-gray-300 hover:text-blue-600 p-2 transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Universe;