import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Cargando permisos...</div>;
  }

  // 1. Si no está logueado, mandar al Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Si se especifican roles y el usuario NO tiene uno de ellos
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. Si pasa las validaciones, mostrar el contenido
  return children ? children : <Outlet />;
};

export default ProtectedRoute;