import { 
  LayoutDashboard, 
  Users,
  Filter,
  UserPlus, 
  Building2, 
  Ticket, 
  Phone, 
  FileText, 
  Search, 
  Globe,
  Package
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';

const Sidebar = () => {
  const location = useLocation();
  
  // Aquí definimos las rutas.
  const menuItems = [
    { icon: LayoutDashboard, label: 'Inicio', path: '/' },
    
    // 👇 NUEVO: Universo de Prospectos (El paso intermedio)
    { icon: Filter, label: 'Prospectos (Leads)', path: '/leads' },
    
    { icon: Users, label: 'Registrar Cliente', path: '/register' },
    { icon: Package, label: 'Producto', path: '/products' },
    { icon: Globe, label: 'Universo', path: '/universe' },
    { icon: Search, label: 'Búsqueda', path: '/search' },
    { icon: Ticket, label: 'Requerimientos', path: '/tickets' },
    { icon: Phone, label: 'Interacciones', path: '/interactions' },
    
    // ❌ ELIMINADO: Ya no existe el acceso directo a Cotizador
    // { icon: FileText, label: 'Cotizador', path: '/quotes' }, 
  ];

  return (
    <div className="w-64 bg-gray-900 h-screen fixed left-0 top-0 border-r border-gray-800 flex flex-col z-20 shadow-lg">
      {/* Header del Sidebar */}
      <div className="p-6 border-b border-gray-800 flex flex-col items-start">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-metal">
          <Building2 size={20} className="text-white" />
          BO Simplificado
        </h1>
        <div className="mt-1 flex items-center gap-2">
           <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Online</span>
           <p className="text-xs text-white">Back Office Empresarial</p>
        </div>
      </div>

      {/* Menú de Navegación */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                isActive 
                  ? "bg-[#ec4899] text-white font-bold shadow-lg shadow-pink-500/30" 
                  : "text-gray-400 hover:bg-gray-800 hover:text-[#ec4899]"
              )}
            >
              <Icon size={20} className={clsx("transition-transform group-hover:scale-110", isActive ? "text-white" : "text-gray-400 group-hover:text-[#ec4899]")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      
      {/* Footer del Usuario */}
      <div className="p-4 border-t border-gray-800 bg-gray-900">
         <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-[#BF0CEA] text-white flex items-center justify-center font-bold text-xs">
               VC
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-sm font-medium text-white truncate">Victor de la O Cano</p>
               <p className="text-xs text-gray-400 truncate">Especialista Empresarial</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Sidebar;