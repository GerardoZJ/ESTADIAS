import React from 'react';
import { Navigate } from 'react-router-dom';  // Solo importamos Navigate
import { useAuth } from './AuthContext';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;  // Si no está autenticado, redirige al login
  }

  return children;  // Si está autenticado, renderiza el contenido
};

export default PrivateRoute;
