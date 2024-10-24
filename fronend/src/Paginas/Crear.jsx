import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../Rutas/AuthContext';

const Crear = () => {
  const { user } = useAuth();
  const [nombre, setNombre] = useState('');
  const [unidad, setUnidad] = useState('');
  const [metros, setMetros] = useState('');
  const [precio, setPrecio] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/Materiales', {
        nombre,
        unidad,
        metros_disponibles: metros,
        precio,
        imagen_url: imagenUrl
      });
      alert('Producto creado');
    } catch (error) {
      console.error('Error al crear producto:', error);
    }
  };

  return (
    <div>
      <h2>Crear Producto</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Nombre" 
          value={nombre} 
          onChange={(e) => setNombre(e.target.value)} 
        />
        <input 
          type="text" 
          placeholder="Unidad" 
          value={unidad} 
          onChange={(e) => setUnidad(e.target.value)} 
        />
        <input 
          type="number" 
          placeholder="Metros disponibles" 
          value={metros} 
          onChange={(e) => setMetros(e.target.value)} 
        />
        <input 
          type="number" 
          placeholder="Precio" 
          value={precio} 
          onChange={(e) => setPrecio(e.target.value)} 
        />
        <input 
          type="text" 
          placeholder="URL de la Imagen" 
          value={imagenUrl} 
          onChange={(e) => setImagenUrl(e.target.value)} 
        />
        <button type="submit">Crear Producto</button>
      </form>
    </div>
  );
};

export default Crear;
