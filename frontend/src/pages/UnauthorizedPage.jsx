import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100 transform transition-all hover:scale-[1.01]">
        
        {/* Icono Animado */}
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <ShieldAlert className="text-red-500" size={48} />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Acceso Denegado</h1>
        <p className="text-gray-500 mb-8 text-lg leading-relaxed">
          Lo sentimos, tu usuario no tiene los permisos necesarios para ver esta sección.
        </p>

        <div className="space-y-3">
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 flex items-center justify-center gap-2 active:scale-95"
          >
            <Home size={20} />
            Ir al Inicio
          </button>
          
          <button 
            onClick={() => navigate(-1)}
            className="w-full bg-white text-gray-600 py-3.5 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft size={20} />
            Regresar
          </button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400 font-medium">Código de error: 403_FORBIDDEN</p>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;