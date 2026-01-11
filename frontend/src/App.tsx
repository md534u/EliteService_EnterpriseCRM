import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { io } from 'socket.io-client';

// Layouts y Páginas
import LoginPage from './pages/LoginPage'; // <--- IMPORTANTE: Importamos la página nueva
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
import { AuthProvider, useAuth } from './context/AuthContext'; // <--- Importamos useAuth también

// Hooks y Contextos
import { useNotifications } from './hooks/useNotifications';
import { ToastProvider, useToast } from './context/ToastContext';

// Inicialización del Socket (fuera del componente)
const socket = io("https://crm-backend-56gq.onrender.com", {
  transports: ["websocket", "polling"], 
  withCredentials: true
});

// --- COMPONENTE ESCUCHA (EL CEREBRO DE LA NOTIFICACIÓN) ---
const SocketListener = () => {
  const { addToast } = useToast();
  const { fetchNotifications } = useNotifications(null);

  useEffect(() => {
    socket.on('new_mail_notification', (data) => {
      console.log("🔔 Notificación recibida:", data);
      if (fetchNotifications) {
        fetchNotifications();
      }
      addToast(`De: ${data.from} - Asunto: ${data.subject}`, 'info');
    });

    return () => {
      socket.off('new_mail_notification');
    };
  }, [addToast, fetchNotifications]);

  return null;
};

// --- COMPONENTE GUARDIÁN (PROTECTED ROUTE) ---
// Este componente verifica si tienes token. Si no, te manda al Login.
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  
  if (loading) return <div>Cargando...</div>; // O un spinner bonito
  
  if (!token) {
    // Si no hay token, redirigir a Login
    return <Navigate to="/login" replace />;
  }

  // Si hay token, mostrar la página protegida (el Dashboard)
  return children;
};

// --- APP PRINCIPAL ---
function App() {
  return (
    <ToastProvider>
      <SocketListener />
      
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            
            {/* 1. RUTA PÚBLICA: LOGIN (Sin Sidebar, Pantalla completa) */}
            <Route path="/login" element={<LoginPage />} />

            {/* 2. RUTAS PRIVADAS: DASHBOARD (Protegidas) */}
            <Route path="/" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
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
        </AuthProvider>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;