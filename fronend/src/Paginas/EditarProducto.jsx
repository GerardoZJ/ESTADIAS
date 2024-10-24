import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const EditarProducto = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [nombre, setNombre] = useState('');
    const [unidad, setUnidad] = useState('');
    const [metros, setMetros] = useState('');
    const [precio, setPrecio] = useState('');
    const [imagenUrl, setImagenUrl] = useState('');

    useEffect(() => {
        const fetchProducto = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/Materiales/${id}`);
                const producto = response.data;
                setNombre(producto.nombre);
                setUnidad(producto.unidad);
                setMetros(producto.metros_disponibles);
                setPrecio(producto.precio);
                setImagenUrl(producto.imagen_url);
            } catch (error) {
                console.error('Error al cargar el producto:', error);
            }
        };

        fetchProducto();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.put(`http://localhost:3000/Materiales/${id}`, {
                nombre,
                unidad,
                metros_disponibles: metros,
                precio,
                imagen_url: imagenUrl
            });
            console.log('Producto actualizado:', response.data);
            navigate('/productos');
        } catch (error) {
            console.error('Error al actualizar producto:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Editar Producto</h2>
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
            <button type="submit">Actualizar Producto</button>
        </form>
    );
};

export default EditarProducto;
