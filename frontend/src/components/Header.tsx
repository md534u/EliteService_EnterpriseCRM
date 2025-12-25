import React, { useState, useEffect } from 'react';
import { Bell, Search, Menu } from 'lucide-react';

const Header = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // CORRECCIÓN AQUÍ: Cambiamos z-10 por z-50
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
      {/* Left: Breadcrumbs or Title (Placeholder) */}
      <div className="flex items-center gap-4">
         <div className="md:hidden text-gray-500">
            <Menu />
         </div>
         <div className="hidden md:flex gap-4 items-center text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">ID:</span>
              <span className="font-mono font-medium text-gray-800">MD534U</span>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <div className="font-medium text-att-blue">Región Centro-Norte</div>
         </div>
      </div>

      {/* Right: Actions & Time */}
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-md border border-blue-100">
          <span className="text-blue-400 text-xs font-bold uppercase tracking-wider">Hora Local</span>
          <span className="font-mono font-bold text-att-dark text-lg w-20 text-center">
            {time.toLocaleTimeString('es-MX', { hour12: false, hour: '2-digit', minute:'2-digit' })}
          </span>
        </div>

        <div className="h-8 w-px bg-gray-200"></div>

        <button className="relative p-2 text-gray-400 hover:text-att-blue transition-colors rounded-full hover:bg-gray-100">
           <Bell size={20} />
           <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;