import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Ticket, Activity, AlertTriangle, BarChart } from 'lucide-react';
import { API_URL } from '../config';

interface DashboardStats {
  active_leads: number;
  open_tickets: number;
  pipeline_value: number;
  risk_alerts: any[];
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    active_leads: 0,
    open_tickets: 0,
    pipeline_value: 0,
    risk_alerts: []
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/stats`);
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats", err);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="google-card flex items-center gap-4">
      <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
        <Icon size={32} className={color.replace('bg-', 'text-')} />
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="card-bienvenida bg-white rounded-3xl p-10 shadow-lg text-center border border-gray-100 mb-8 animate-fade-in-up">
        <h1 className="text-4xl font-extrabold text-[#1a73e8] mb-2 tracking-tight">EliteService CRM</h1>
        <div className="text-green-600 font-bold text-xl tracking-widest mb-6 animate-pulse">ACCESO CONCEDIDO</div>
        <p className="text-gray-500 uppercase tracking-widest text-xs">Sistema Listo Para Operaciones</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Prospectos Activos" 
          value={stats.active_leads} 
          icon={Users} 
          color="bg-blue-500 text-blue-600" 
        />
        <StatCard 
          title="Pipeline (Ponderado)" 
          value={`$${stats.pipeline_value.toLocaleString()}`} 
          icon={Activity} 
          color="bg-green-500 text-green-600" 
        />
        <StatCard 
          title="Tickets Abiertos" 
          value={stats.open_tickets} 
          icon={Ticket} 
          color="bg-orange-500 text-orange-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="google-card">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
             <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
               <AlertTriangle size={20} className="text-red-500" />
               Alertas: Líneas por Vencer (90 días)
             </h3>
             <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full">
               {stats.risk_alerts.length} Críticas
             </span>
          </div>
          
          <div className="overflow-auto max-h-64">
            {stats.risk_alerts.length === 0 ? (
              <p className="text-center text-gray-400 py-8">✅ No hay líneas en riesgo.</p>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2">Cuenta</th>
                    <th className="px-3 py-2">DN</th>
                    <th className="px-3 py-2">Vence</th>
                    <th className="px-3 py-2">Días</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.risk_alerts.map((alert, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium">{alert.Nombre_Cuenta}</td>
                      <td className="px-3 py-2">{alert.DN}</td>
                      <td className="px-3 py-2 text-red-600">{alert.Fecha_Vencimiento}</td>
                      <td className="px-3 py-2 font-bold text-red-600">{alert.Dias_Para_Vencer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="google-card flex flex-col items-center justify-center text-center p-8">
           <BarChart size={64} className="text-gray-200 mb-4" />
           <h3 className="text-xl font-bold text-gray-700">Analytics de Pipeline</h3>
           <p className="text-gray-500 text-sm mt-2">Visualización de etapas próximamente.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
