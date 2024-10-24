import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './Rutas/Rutas';
import { AuthProvider } from './Rutas/AuthContext';  // Asegúrate de que el AuthProvider esté configurado correctamente

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />  {/* Aquí van todas las rutas */}
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
