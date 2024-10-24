import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '../Paginas/Login';
import Catalogo from '../Paginas/Catalogo';
import Crear from '../Paginas/Crear';
import EditarProducto from '../Paginas/EditarProducto';
import PrivateRoute from './PrivateRouter';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Catalogo />} /> {/* Ruta raíz */}
      <Route path="/login" element={<Login />} />
      <Route 
        path="/crear" 
        element={
          <PrivateRoute>
            <Crear />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/editar-producto/:id" 
        element={
          <PrivateRoute>
            <EditarProducto />
          </PrivateRoute>
        } 
      />
    </Routes>
  );
};

export default AppRoutes;
