import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { io } from 'socket.io-client';

// Layouts y Páginas
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import RegisterClient from './pages/RegisterClient';
import Universe from './pages/Universe';
import AccountDetail from './pages/AccountDetail';
import SearchPage from './pages/SearchPage';
import TicketsPage from './pages/TicketsPage';
import CreateTicketPage from './pages/CreateTicketPage';
import InteractionsPage from './pages/InteractionsPage';
import LeadUniverse from './pages/LeadUniverse';
import ProductList from './components/ProductList';
import GestionDetail from './pages/GestionDetail'; 
import GestionesPage from './pages/GestionesPage'; 

// Hooks y Contextos
import { useNotifications } from './hooks/useNotifications';
// IMPORTAMOS TU CONTEXTO REAL
import { ToastProvider, useToast } from './context/ToastContext';

// Inicialización del Socket (fuera del componente)
const socket = io('http://localhost:4000');

// --- COMPONENTE ESCUCHA (EL CEREBRO DE LA NOTIFICACIÓN) ---
const SocketListener = () => {
  // 1. Usamos TU hook de diseño visual
  const { addToast } = useToast();
  
  // 2. Usamos el hook de datos para actualizar la campanita (si existe)
  const { fetchNotifications } = useNotifications(null);

  useEffect(() => {
    // Escuchamos el evento desde el servidor
    socket.on('new_mail_notification', (data: { from: string; subject: string }) => {
      console.log("🔔 Notificación recibida:", data);

      // A. Actualizamos los datos del CRM (la lista de notificaciones)
      if (fetchNotifications) {
        fetchNotifications();
      }

      // B. Disparamos TU TOAST PROFESIONAL
      // Usamos 'info' porque es un correo entrante
      addToast(`De: ${data.from} - Asunto: ${data.subject}`, 'info');
    });

    return () => {
      socket.off('new_mail_notification');
    };
  }, [addToast, fetchNotifications]);

  return null; // No renderiza nada, solo trabaja en el fondo
};

// --- APP PRINCIPAL ---
function App() {
  return (
    // Envolvemos todo en el ToastProvider para que funcione el addToast
    <ToastProvider>
      {/* El Listener debe estar adentro para poder usar useToast */}
      <SocketListener />
      
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="gestiones" element={<GestionesPage />} />
            <Route path="gestion/:id" element={<GestionDetail />} />
            <Route path="register" element={<RegisterClient />} />
            <Route path="universe" element={<Universe />} />
            <Route path="universe/:id" element={<AccountDetail />} />
            <Route path="products" element={<ProductList />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="tickets" element={<TicketsPage />} />
            <Route path="tickets/create" element={<CreateTicketPage />} />
            <Route path="leads" element={<LeadUniverse />} />
            <Route path="interactions" element={<InteractionsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;