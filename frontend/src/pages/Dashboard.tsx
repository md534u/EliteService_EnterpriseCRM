import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  Ticket,
  Activity,
  AlertTriangle,
  BarChart,
  ArrowRight,
  Database,
  HardDrive,
  RefreshCw,
  ClipboardList,
  FolderOpen
} from 'lucide-react';
import { API_URL } from '../config';
import { StatsCard } from '../components/StatsCard';

interface DashboardStats {
  active_leads: number;
  open_tickets: number;
  pipeline_value: number;
  risk_alerts: any[];
}

// Interfaz actualizada para el nuevo Backend de Gestiones
interface Gestion {
  id: number | string;
  Folio: string;
  tipo_gestion: string;
  nombre_cuenta: string;
  etapa: string;
  prioridad: string;
}

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats>({
    active_leads: 0,
    open_tickets: 0,
    pipeline_value: 0,
    risk_alerts: []
  });

  // Estado actualizado para Gestiones
  const [gestiones, setGestiones] = useState<Gestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado para el Backup Simplificado
  const [backupInfo, setBackupInfo] = useState<any>(null);
  const [checkingSpace, setCheckingSpace] = useState(false);
  const [updatingBackup, setUpdatingBackup] = useState(false);
  const [showBackupFiles, setShowBackupFiles] = useState(false);

  // Estados para ZIP Viewer
  const [zipContents, setZipContents] = useState<string[]>([]);
  const [activeZip, setActiveZip] = useState<string | null>(null);
  const [loadingZip, setLoadingZip] = useState(false);

  useEffect(() => {
    fetchData();
    fetchBackupStatus();
  }, []);

  const fetchZipContents = async (filename: string) => {
    try {
      // Si ya está abierto, lo cerramos
      if (activeZip === filename) {
        setActiveZip(null);
        setZipContents([]);
        return;
      }

      setLoadingZip(true);
      setActiveZip(filename);

      const res = await axios.get(
        `${API_URL}/backups/${filename}/contents`
      );

      setZipContents(Array.isArray(res.data.files) ? res.data.files : []);
    } catch (e) {
      console.error("Error leyendo contenido del ZIP", e);
      alert("No se pudo leer el contenido del respaldo.");
      setZipContents([]);
    } finally {
      setLoadingZip(false);
    }
  };

  const buildTree = (paths: string[]) => {
    const tree: any = {};
    paths.forEach(path => {
      const parts = path.split('/');
      let current = tree;
      parts.forEach(part => {
        if (!current[part]) current[part] = {};
        current = current[part];
      });
    });
    return tree;
  };

  const TreeView = ({ data, level = 0 }: any) => {
    return (
      <ul className="ml-4 border-l border-gray-200 pl-3 space-y-1">
        {Object.keys(data).map((key) => {
          const isFile = Object.keys(data[key]).length === 0;
          return (
            <li key={key}>
              <div className="flex items-center gap-2 text-xs text-gray-700">
                <span>{isFile ? '📄' : '📁'}</span>
                <span className={isFile ? 'font-mono' : 'font-semibold'}>
                  {key}
                </span>
              </div>
              {!isFile && (
                <TreeView data={data[key]} level={level + 1} />
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Stats Generales
      const resStats = await axios.get(`${API_URL}/stats`);
      const statsData = resStats.data ?? {};

      setStats({
        active_leads: statsData.active_leads ?? 0,
        open_tickets: statsData.open_tickets ?? 0,
        pipeline_value: statsData.pipeline_value ?? 0,
        risk_alerts: Array.isArray(statsData.risk_alerts) ? statsData.risk_alerts : []
      });

      // 2. Gestiones Recientes (CORREGIDO: Ya no llama a /opportunities)
      const resGestiones = await axios.get(`${API_URL}/gestiones/`);
      const dataGestiones = Array.isArray(resGestiones.data) ? resGestiones.data : [];
      
      // Tomamos las 5 más recientes
      setGestiones(dataGestiones.slice(0, 5));

    } catch (err) {
      console.error('Error fetching data', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBackupStatus = async () => {
    try {
      const res = await axios.get(`${API_URL}/stats/backups-size`);
      setBackupInfo({
        ...res.data,
        files: Array.isArray(res.data.files) ? res.data.files : []
      });
    } catch (e) { console.error("Error info backup", e); }
  };

  const handleCheckSpace = async () => {
    setCheckingSpace(true);
    await fetchBackupStatus();
    setTimeout(() => setCheckingSpace(false), 800);
  };

  const handleUpdateBackup = async () => {
    if (!window.confirm("¿Deseas sobrescribir el respaldo actual con los datos más recientes?")) return;
    
    setUpdatingBackup(true);
    try {
      await axios.post(`${API_URL}/create-backup`);
      await fetchBackupStatus();
      alert("Respaldo actualizado correctamente.");
    } catch (e) { alert("Error al crear respaldo"); }
    finally { setUpdatingBackup(false); }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 space-y-6 pb-10">

      {/* Header */}
      <div className="bg-white rounded-3xl p-8 shadow-sm text-center border border-gray-300 mb-8">
        <h1 className="text-3xl font-extrabold text-metal-titanio">
        CRM Servicio Elite B2B
        </h1>
        <p className="text-gray-800 text-xs uppercase tracking-widest">
          Panel de Control General
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Prospectos Activos"
          value={stats.active_leads}
          icon={<Users size={24} />}
          iconWrapperClassName="bg-blue-100 text-blue-600"
        />
        <StatsCard
          title="Gestiones Activas" // Actualizado texto
          value={gestiones.length} // Usamos length de gestiones o el stat real si el backend lo envía
          icon={<Activity size={24} />}
          iconWrapperClassName="bg-green-100 text-green-600"
        />
        <StatsCard
          title="Tickets Abiertos"
          value={stats.open_tickets}
          icon={<Ticket size={24} />}
          iconWrapperClassName="bg-orange-100 text-orange-600"
        />
      </div>

      {/* Alertas y Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-300 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4 border-b pb-3">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 uppercase">
              <AlertTriangle size={18} className="text-red-500" />
              Alertas de Vencimiento
            </h3>
            <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded-full">
              {stats.risk_alerts.length} CRÍTICAS
            </span>
          </div>

          {stats.risk_alerts.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">
              ✅ Todo en orden.
            </p>
          ) : (
            <table className="w-full text-xs">
              <tbody>
                {stats.risk_alerts.map((alert, idx) => (
                  <tr key={idx}>
                    <td className="py-1">{alert.Nombre_Cuenta}</td>
                    <td className="py-1">{alert.DN}</td>
                    <td className="py-1 text-red-600 font-bold">
                      {alert.Dias_Para_Vencer} días
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-300 shadow-sm flex flex-col items-center justify-center p-8">
          <BarChart size={48} className="text-gray-200 mb-4" />
          <p className="text-gray-400 text-xs">Análisis de rendimiento (Próximamente)</p>
        </div>
      </div>

      {/* Tabla de Gestiones Recientes (Antes Oportunidades) */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between bg-gray-200">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <ClipboardList size={16} /> Gestiones Recientes
          </h3>
          <Link to="/gestiones" className="text-xs font-bold text-blue-600 flex gap-1">
            Ver todas <ArrowRight size={14} />
          </Link>
        </div>

        {gestiones.length === 0 && !loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No hay gestiones recientes.
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-white border-b">
              <tr>
                <th className="px-6 py-3">Folio</th>
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3">Cuenta</th>
                <th className="px-6 py-3">Etapa</th>
                <th className="px-6 py-3 text-right">Prioridad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {gestiones.map((gestion) => (
                <tr key={gestion.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-gray-600">
                    <Link
                      to={`/gestion/${gestion.id}`}
                      className="hover:text-blue-600 hover:underline"
                    >
                      {gestion.Folio || `GO-${gestion.id}`}
                    </Link>
                  </td>
                  <td className="px-6 py-4">{gestion.tipo_gestion}</td>
                  <td className="px-6 py-4">{gestion.nombre_cuenta || 'Sin Asignar'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                      gestion.etapa === 'Completada' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {gestion.etapa}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-xs font-bold ${gestion.prioridad === 'Alta' ? 'text-red-600' : 'text-gray-500'}`}>
                      {gestion.prioridad}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* GESTIÓN DE BACKUP */}
      <div className="bg-white rounded-xl border border-gray-300 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-300 pb-4">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Database size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Respaldo del Sistema</h3>
            <p className="text-xs text-gray-500">Gestión de copia de seguridad.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-gray-600">Estado del Archivo:</p>
            {backupInfo?.last_backup ? (
              <p className="text-lg font-bold text-emerald-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Actualizado: {backupInfo.last_backup}
              </p>
            ) : (
              <p className="text-sm text-orange-500 font-bold">No existe respaldo aún.</p>
            )}
            <p className="text-xs text-gray-400">Incluye: Base de datos CSV y Adjuntos.</p>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={handleCheckSpace}
              disabled={checkingSpace}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg border border-gray-200 font-bold text-xs hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <HardDrive size={16} />
              {checkingSpace ? "Verificando..." : `Espacio (${backupInfo?.live_size_mb || 0} MB)`}
            </button>
            
            <button 
              onClick={handleUpdateBackup}
              disabled={updatingBackup}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all active:scale-95 disabled:opacity-70"
            >
              <RefreshCw size={16} className={updatingBackup ? "animate-spin" : ""} />
              {updatingBackup ? "Actualizando..." : "Actualizar Backup"}
            </button>
          </div>
        </div>

        {/* Lista desplegable de archivos */}
        {backupInfo && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            {backupInfo.files && backupInfo.files.length > 0 ? (
              <>
                <button
                  onClick={() => setShowBackupFiles(!showBackupFiles)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-2 transition-colors"
                >
                  <FolderOpen size={14}/>
                  {showBackupFiles
                    ? 'Ocultar lista de archivos'
                    : `Ver archivos disponibles (${backupInfo.files.length})`}
                </button>

                {showBackupFiles && (
                  <div className="mt-3 bg-gray-50 rounded-lg border border-gray-100 p-3 max-h-96 overflow-y-auto">
                    <ul className="space-y-2">
                      {backupInfo.files.map((file: string, idx: number) => (
                        <li key={idx}>
                          <div
                            onClick={() => fetchZipContents(file)}
                            className="text-xs text-gray-600 flex items-center gap-2 font-mono cursor-pointer hover:text-blue-600 bg-white p-2 rounded border border-gray-200 hover:border-blue-300 transition-colors"
                          >
                            <span>📦</span> {file}
                          </div>

                          {/* Visor de Contenido del ZIP */}
                          {activeZip === file && (
                            <div className="ml-4 mt-2 bg-white border border-gray-200 rounded-lg p-3 shadow-inner">
                              {loadingZip ? (
                                <p className="text-xs text-gray-400 flex items-center gap-2">
                                  <RefreshCw size={12} className="animate-spin"/> Leyendo estructura...
                                </p>
                              ) : zipContents.length === 0 ? (
                                <p className="text-xs text-gray-400 italic">El archivo ZIP parece estar vacío.</p>
                              ) : (
                                <TreeView data={buildTree(zipContents)} />
                              )}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-gray-400 italic mt-2">
                No hay archivos de respaldo físicos disponibles para descargar.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;