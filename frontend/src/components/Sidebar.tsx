import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Ticket, 
  Phone, 
  FileText, 
  Search, 
  Globe 
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { icon: LayoutDashboard, label: 'Inicio', path: '/' },
    { icon: Users, label: 'Registrar Cliente', path: '/register' },
    { icon: Globe, label: 'Universo', path: '/universe' },
    { icon: Search, label: 'Búsqueda', path: '/search' },
    { icon: Ticket, label: 'Requerimientos', path: '/tickets' },
    { icon: Phone, label: 'Interacciones', path: '/interactions' },
    { icon: FileText, label: 'Cotizador', path: '/quotes' },
  ];

  return (
    <div className="w-64 bg-white h-screen fixed left-0 top-0 border-r border-gray-200 flex flex-col z-20 shadow-lg">
      <div className="p-6 border-b border-gray-100 flex flex-col items-start">
        <h1 className="text-2xl font-bold text-att-blue tracking-tight flex items-center gap-2">
           <Building2 size={28} className="text-att-dark" />
           EliteService
        </h1>
        <div className="mt-1 flex items-center gap-2">
           <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Online</span>
           <p className="text-xs text-gray-400">Enterprise CRM</p>
        </div>
      </div>

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
                  ? "bg-[#c2e7ff] text-[#001d35] font-bold shadow-sm" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-att-blue"
              )}
            >
              {isActive && (
                 <div className="absolute left-0 top-0 bottom-0 w-1 bg-att-blue rounded-r-full"></div>
              )}
              <Icon size={20} className={clsx("transition-transform group-hover:scale-110", isActive ? "text-[#0057b8]" : "text-gray-400 group-hover:text-att-blue")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-100 bg-gray-50">
         <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-att-blue text-white flex items-center justify-center font-bold text-xs">
               MD
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-sm font-medium text-gray-900 truncate">Marcos de la O</p>
               <p className="text-xs text-gray-500 truncate">Consultor Sr.</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Sidebar;
