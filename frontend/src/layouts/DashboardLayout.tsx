import { Outlet } from 'react-router-dom';

// Importamos sin llaves {} porque son export default
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* 1. SIDEBAR */}
      {/* Se renderiza fijo a la izquierda (según sus propios estilos internos) */}
      <Sidebar />

      {/* 2. CONTENEDOR PRINCIPAL */}
      {/* CORRECCIÓN: Agregamos 'md:ml-64' para dejar espacio al Sidebar */}
      <div className="flex flex-col md:ml-64 min-h-screen transition-all duration-300">
        
        {/* Encabezado Superior */}
        <Header />

        {/* Área de Contenido Scrollable */}
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-7xl animate-in fade-in duration-300">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;