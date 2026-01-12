import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { Bell, Menu, Search, X, CheckCircle, AlertCircle, Info, AlertTriangle, Clock, LogOut } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { toasts, removeToast } = useToast();
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Efecto para actualizar el reloj cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      // Limpiamos el almacenamiento local (tokens, datos de usuario, etc.)
      localStorage.clear();
      // Redirigimos a la pantalla de login o inicio (ajusta la ruta si es diferente)
      window.location.href = '/login';
    }
  };

  return (
    // CAMBIO 1: Fondo gris (bg-gray-100) y borde más marcado para diferenciar
    <header className="bg-gray-100 border-b border-gray-300 h-16 flex items-center justify-between px-6 sticky top-0 z-30 font-sans shadow-sm">
        
        {/* IZQUIERDA: Menú y Buscador */}
        <div className="flex items-center gap-4">
            <button onClick={onMenuClick} className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg lg:hidden">
                <Menu size={20} />
            </button>
            <div className="relative hidden md:block">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                {/* Ajuste: Fondo blanco en el input para resaltar sobre el header gris */}
                <input 
                    type="text" 
                    placeholder="Buscar clientes, folios..." 
                    className="pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-all placeholder-gray-400 text-gray-700 shadow-sm"
                />
            </div>
        </div>

        {/* DERECHA: Notificaciones y Reloj */}
        <div className="flex items-center gap-4">
            
            {/* CAMPANA DE NOTIFICACIONES */}
            <div className="relative">
                <button 
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-200 relative transition-colors"
                >
                    <Bell size={20} />
                    {toasts?.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
                    )}
                </button>

                {/* Dropdown de Notificaciones */}
                {showDropdown && (
                    <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Notificaciones</h3>
                            <button onClick={() => setShowDropdown(false)}><X size={14} className="text-gray-400 hover:text-gray-600"/></button>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            {toasts?.length === 0 ? (
                                <div className="p-6 text-center">
                                    <p className="text-xs text-gray-400 italic">No hay notificaciones activas</p>
                                </div>
                            ) : (
                                <ul>
                                    {toasts?.map((t) => (
                                        <li key={t.id} className="p-3 border-b border-gray-50 hover:bg-gray-50 flex gap-3 items-start">
                                            <div className={`mt-0.5 ${
                                                t.type === 'success' ? 'text-emerald-500' : 
                                                t.type === 'error' ? 'text-red-500' : 
                                                t.type === 'warning' ? 'text-orange-500' : 'text-blue-500'
                                            }`}>
                                                {t.type === 'success' && <CheckCircle size={14} />}
                                                {t.type === 'error' && <AlertCircle size={14} />}
                                                {t.type === 'warning' && <AlertTriangle size={14} />}
                                                {t.type === 'info' && <Info size={14} />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-700 font-medium leading-tight">{t.message}</p>
                                                <p className="text-[10px] text-gray-400 mt-1">Hace un momento</p>
                                            </div>
                                            <button 
                                                onClick={() => removeToast(t.id)}
                                                className="text-gray-300 hover:text-red-500"
                                                title="Cerrar"
                                            >
                                                <X size={12} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            <div className="h-8 w-px bg-gray-300 mx-2 hidden sm:block"></div>
            
            {/* CAMBIO: RELOJ DIGITAL (En lugar del Usuario) */}
            <div className="hidden sm:flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-300 shadow-sm text-gray-700">
                <Clock size={16} className="text-blue-600" />
                <span className="text-sm font-mono font-bold tracking-wide">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
            </div>

            {/* Botón Cerrar Sesión */}
            <button 
                onClick={handleLogout}
                className="ml-2 p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Cerrar Sesión"
            >
                <LogOut size={20} />
            </button>

        </div>
    </header>
  );
};

export default Header;