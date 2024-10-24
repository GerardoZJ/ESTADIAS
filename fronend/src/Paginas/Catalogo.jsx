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
  const [token, setToken] = useState(''); // Guardar el token de autenticación
  const [editingProduct, setEditingProduct] = useState(null); // Estado para manejar la edición
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [unidad, setUnidad] = useState('');
  const [metrosDisponibles, setMetrosDisponibles] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await axios.get('http://localhost:3000/Materiales');
        setProductos(response.data);
      } catch (error) {
        console.error('Error al cargar los productos:', error.message);
      }
    };

    fetchProductos();
  }, []);

  // Función de inicio de sesión
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/login', {
        usuario,
        contraseña,
      });
      setLoggedIn(true);
      setIsAdmin(response.data.isAdmin);
      setToken(response.data.token); // Guardar el token
      setError('');
    } catch (error) {
      setError('Credenciales inválidas');
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setIsAdmin(false);
    setToken(''); // Limpiar el token al cerrar sesión
    setUsuario('');
    setContraseña('');
    setEditingProduct(null); // Limpiar el estado de edición al cerrar sesión
    limpiarFormularioEdicion(); // Limpiar los campos del formulario
  };

  const limpiarFormularioEdicion = () => {
    setNombre('');
    setPrecio('');
    setUnidad('');
    setMetrosDisponibles('');
    setImagenUrl('');
  };

  // Función para eliminar un producto
  const eliminarProducto = async (id_material) => {
    try {
      if (!id_material) {
        console.error('ID del producto no válido:', id_material);
        return;
      }
      console.log("ID para eliminar:", id_material); // Verificar el ID que se está enviando
      await axios.delete(`http://localhost:3000/Materiales/${id_material}`, {
        headers: {
          Authorization: token, // Enviar token en los headers
        },
      });
      setProductos(productos.filter((producto) => producto.id_material !== id_material));
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
    }
  };

  // Función para abrir el formulario de edición y establecer los valores del producto en edición
  const abrirEditarProducto = (producto) => {
    setEditingProduct(producto); // Establecer el producto en edición
    setNombre(producto.nombre); // Actualizar el estado de los campos
    setPrecio(producto.precio);
    setUnidad(producto.unidad);
    setMetrosDisponibles(producto.metros_disponibles);
    setImagenUrl(producto.imagen_url);
    console.log("Producto a editar:", producto); // Comprobar si el producto tiene un id_material válido
  };

  // Función para enviar la actualización del producto
  const editarProducto = async (e) => {
    e.preventDefault();

    if (!editingProduct || !editingProduct.id_material) {
      console.error("ID del producto a editar no está definido.");
      return;
    }

    const updatedProduct = {
      nombre: nombre,
      unidad: unidad,
      metros_disponibles: metrosDisponibles,
      precio: precio,
      imagen_url: imagenUrl,
    };

    try {
      await axios.put(`http://localhost:3000/Materiales/${editingProduct.id_material}`, updatedProduct, {
        headers: {
          Authorization: token, // Enviar token en los headers
        },
      });
      setProductos(productos.map((prod) => (prod.id_material === editingProduct.id_material ? { ...prod, ...updatedProduct } : prod)));
      setEditingProduct(null); // Resetear el estado de edición
      limpiarFormularioEdicion(); // Limpiar los campos después de la edición
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
    }
  };

  // Función para crear un producto
  const crearProducto = async (e) => {
    e.preventDefault();

    const nuevoProducto = {
      nombre: e.target.nombre.value,
      unidad: e.target.unidad.value,
      metros_disponibles: e.target.metros_disponibles.value,
      precio: e.target.precio.value,
      imagen_url: e.target.imagen_url.value,
    };

    try {
      const response = await axios.post('http://localhost:3000/Materiales', nuevoProducto, {
        headers: {
          Authorization: token, // Enviar token en los headers
        },
      });

      setProductos([...productos, response.data]); // Añadir el nuevo producto a la lista de productos

      // Limpiar los campos del formulario
      e.target.nombre.value = '';
      e.target.unidad.value = '';
      e.target.metros_disponibles.value = '';
      e.target.precio.value = '';
      e.target.imagen_url.value = '';
    } catch (error) {
      console.error('Error al crear el producto:', error);
    }
  };


  return (
    <div>
      {/* Barra de navegación para login */}
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
                  <p className="producto-unidad">Unidad: {producto.unidad}</p> {/* Mostrar unidades */}
                  <p className="producto-metros">Metros disponibles: {producto.metros_disponibles}</p> {/* Mostrar metros */}
                  <p className="producto-descripcion">{producto.descripcion || 'Sin descripción disponible'}</p>

                  {/* Mostrar botones de edición/eliminación solo si el usuario es admin */}
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

      {/* Formulario de edición si está editando un producto */}
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
              type="text"
              name="unidad"
              value={unidad}
              onChange={(e) => setUnidad(e.target.value)}
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

      {/* Formulario para crear productos solo si el usuario es admin */}
      {isAdmin && (
        <div className="crear-producto">
          <h3>Crear Nuevo Producto</h3>
          <form onSubmit={crearProducto}>
            <input type="text" name="nombre" placeholder="Nombre del producto" required />
            <input type="number" name="precio" placeholder="Precio" required />
            <input type="text" name="unidad" placeholder="Unidad" required />
            <input type="number" name="metros_disponibles" placeholder="Metros disponibles" required />
            <input type="text" name="imagen_url" placeholder="URL de imagen" required />
            <button type="submit">Crear Producto</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Catalogo;

