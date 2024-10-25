import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Catalogo.css';

function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [usuario, setUsuario] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [metrosDisponibles, setMetrosDisponibles] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [historial, setHistorial] = useState([]);

  // Cargar los productos al cargar la página
// Cargar los productos y el historial al cargar la página
useEffect(() => {
  const fetchProductos = async () => {
    try {
      const response = await axios.get('http://localhost:3000/Materiales');
      setProductos(response.data);
    } catch (error) {
      console.error('Error al cargar los productos:', error.message);
    }
  };

  const fetchHistorialInicial = async () => {
    try {
      const response = await axios.get('http://localhost:3000/historial', {
        headers: { Authorization: token },
      });
      setHistorial(response.data);
    } catch (error) {
      console.error('Error al cargar el historial:', error.message);
    }
  };

  fetchProductos();

  if (isAdmin) {
    fetchHistorialInicial();  // Cargar el historial al cargar la página si es admin
  }
}, [isAdmin, token]);


  // Cargar el historial cuando se inicia sesión o hay un cambio en productos
  const fetchHistorial = async () => {
    if (isAdmin) {
      try {
        const response = await axios.get('http://localhost:3000/historial', {
          headers: { Authorization: token },
        });
        setHistorial(response.data);
      } catch (error) {
        console.error('Error al cargar el historial:', error.message);
      }
    }
  };

  // Mantener la sesión después de un reinicio de página
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedIsAdmin = localStorage.getItem('isAdmin');
    if (storedToken && storedIsAdmin) {
      setToken(storedToken);
      setIsAdmin(storedIsAdmin === 'true');
      setLoggedIn(true);
      fetchHistorial(); // Cargar el historial
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/login', {
        usuario,
        contraseña,
      });
      setLoggedIn(true);
      setIsAdmin(response.data.isAdmin);
      setToken(response.data.token);
      setError('');
      setDeleteError('');

      // Guardar token e información en localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('isAdmin', response.data.isAdmin);

      // Cargar el historial después de iniciar sesión
      fetchHistorial();
    } catch (error) {
      setError('Credenciales inválidas');
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setIsAdmin(false);
    setToken('');
    setUsuario('');
    setContraseña('');
    setEditingProduct(null);
    limpiarFormularioEdicion();
    setDeleteError('');

    // Limpiar localStorage al cerrar sesión
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
  };

  const limpiarFormularioEdicion = () => {
    setNombre('');
    setPrecio('');
    setMetrosDisponibles('');
    setImagenUrl('');
  };

  const eliminarProducto = async (id_material) => {
    if (editingProduct && editingProduct.id_material === id_material) {
      setDeleteError('No puedes eliminar mientras estás editando este producto. Guarda o cancela la edición primero.');
      return;
    } else if (editingProduct) {
      // Si se está editando otro producto, permitimos eliminar este
      setDeleteError('');
    }
  
    try {
      await axios.delete(`http://localhost:3000/Materiales/${id_material}`, {
        headers: { Authorization: token },
      });
  
      setProductos(productos.filter((producto) => producto.id_material !== id_material));
      await fetchHistorial();  // Actualizar historial
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
    }
  };
  

  const abrirEditarProducto = (producto) => {
    setEditingProduct(producto);
    setNombre(producto.nombre);
    setPrecio(producto.precio);
    setMetrosDisponibles(producto.metros_disponibles);
    setImagenUrl(producto.imagen_url);
    setDeleteError('');
  };

  const editarProducto = async (e) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.id_material) {
      console.error('ID del producto a editar no está definido.');
      return;
    }

    const updatedProduct = {
      nombre,
      metros_disponibles: metrosDisponibles,
      precio,
      imagen_url: imagenUrl,
    };

    try {
      await axios.put(`http://localhost:3000/Materiales/${editingProduct.id_material}`, updatedProduct, {
        headers: { Authorization: token },
      });
      setProductos(productos.map((prod) => (prod.id_material === editingProduct.id_material ? { ...prod, ...updatedProduct } : prod)));
      setEditingProduct(null);
      limpiarFormularioEdicion();
      setDeleteError('');

      // Actualizar el historial después de editar
      await fetchHistorial();
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
    }
  };

  const crearProducto = async (e) => {
    e.preventDefault();
    const nuevoProducto = {
      nombre: e.target.nombre.value,
      metros_disponibles: e.target.metros_disponibles.value,
      precio: e.target.precio.value,
      imagen_url: e.target.imagen_url.value,
    };

    try {
      const response = await axios.post('http://localhost:3000/Materiales', nuevoProducto, {
        headers: { Authorization: token },
      });

      setProductos([...productos, response.data]);
      e.target.nombre.value = '';
      e.target.metros_disponibles.value = '';
      e.target.precio.value = '';
      e.target.imagen_url.value = '';

      // Actualizar el historial después de crear
      await fetchHistorial();
    } catch (error) {
      console.error('Error al crear el producto:', error);
    }
  };

  return (
    <div>
      <div className="navbar">
        {loggedIn ? (
          <button onClick={handleLogout} className="btn-logout">
            Cerrar Sesión
          </button>
        ) : (
          <form onSubmit={handleLogin} className="login-form">
            <input
              type="text"
              placeholder="Usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              required
            />
            <button type="submit" className="btn-login">
              Iniciar Sesión
            </button>
            {error && <p className="error">{error}</p>}
          </form>
        )}
      </div>

      <h2>Productos Disponibles</h2>
      <div className="productos-container">
        <div className="productos-grid">
          {productos.length > 0 ? (
            productos.map((producto) => (
              <div key={producto.id_material || producto.nombre} className="producto-card">
                <img
                  src={producto.imagen_url || 'default_image_url.jpg'}
                  alt={producto.nombre}
                  className="producto-imagen"
                />
                <div className="producto-detalles">
                  <h3 className="producto-titulo">{producto.nombre}</h3>
                  <p className="producto-precio">Precio: ${producto.precio}</p>
                  <p className="producto-metros">Metros disponibles: {producto.metros_disponibles}</p>
                  <p className="producto-descripcion">{producto.descripcion || 'Sin descripción disponible'}</p>

                  {isAdmin && (
                    <div className="producto-acciones">
                      <button className="btn-editar" onClick={() => abrirEditarProducto(producto)}>
                        Editar
                      </button>
                      <button className="btn-eliminar" onClick={() => eliminarProducto(producto.id_material)}>
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No hay productos disponibles.</p>
          )}
        </div>
      </div>

      {deleteError && <p className="error">{deleteError}</p>}

      {editingProduct && (
        <div className="editar-producto">
          <h3>Editar Producto</h3>
          <form onSubmit={editarProducto}>
            <input
              type="text"
              name="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
            <input
              type="number"
              name="precio"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              required
            />
            <input
              type="number"
              name="metros_disponibles"
              value={metrosDisponibles}
              onChange={(e) => setMetrosDisponibles(e.target.value)}
              required
            />
            <input
              type="text"
              name="imagen_url"
              value={imagenUrl}
              onChange={(e) => setImagenUrl(e.target.value)}
              required
            />
            <button type="submit">Actualizar Producto</button>
          </form>
        </div>
      )}

      {isAdmin && (
        <div className="crear-producto">
          <h3>Crear Nuevo Producto</h3>
          <form onSubmit={crearProducto}>
            <input type="text" name="nombre" placeholder="Nombre del producto" required />
            <input type="number" name="precio" placeholder="Precio" required />
            <input type="number" name="metros_disponibles" placeholder="Metros disponibles" required />
            <input type="text" name="imagen_url" placeholder="URL de imagen" required />
            <button type="submit">Crear Producto</button>
          </form>
        </div>
      )}

      {isAdmin && (
        <div className="historial-container">
          <h2>Historial de Movimientos</h2>
          {historial.length > 0 ? (
            <ul className="historial-lista">
              {historial.map((movimiento) => (
                <li key={movimiento.id_movimiento}>
                  <p><strong>Tipo:</strong> {movimiento.tipo_movimiento}</p>
                  <p><strong>Material:</strong> {movimiento.nombre}</p>
                  <p><strong>Cantidad:</strong> {movimiento.cantidad}</p>
                  <p><strong>Fecha:</strong> {movimiento.fecha_movimiento}</p>
                  <p><strong>Descripción:</strong> {movimiento.descripcion}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay movimientos registrados.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Catalogo;
