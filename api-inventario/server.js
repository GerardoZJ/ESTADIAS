const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// Configuración de la base de datos utilizando un pool
const pool = mysql.createPool({
    host: 'srv1247.hstgr.io',
    user: 'u475816193_Inventario',
    password: 'Materiales123@',
    database: 'u475816193_Inventario',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Verificar la conexión inicial
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conexión exitosa a la base de datos');
    connection.release();
});

// Middleware simulado para verificar token de administrador (en producción usarías JWT)
const verificarAdmin = (req, res, next) => {
    const token = req.headers['authorization'];
    if (token === 'admin-token') {
        next(); // Permitir acceso a las rutas si el token es correcto
    } else {
        return res.status(403).json({ message: 'No tienes permiso para realizar esta acción' });
    }
};

// Login del administrador
app.post('/login', (req, res) => {
    const { usuario, contraseña } = req.body;
    const sql = 'SELECT * FROM Administrador WHERE Usuario = ?';
    pool.query(sql, [usuario], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error al consultar la base de datos' });
        }
        if (results.length > 0) {
            const storedPassword = results[0].contraseña;
            if (storedPassword === contraseña) {
                const token = 'admin-token'; 
                return res.json({ token, isAdmin: true });
            } else {
                return res.status(401).json({ message: 'Credenciales inválidas' });
            }
        } else {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }
    });
});

// Obtener todos los productos (disponible para cualquier usuario)
app.get('/Materiales', (req, res) => {
    const sql = 'SELECT * FROM Materiales';
    pool.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener materiales:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Crear un producto (solo administrador) - SIN unidad
app.post('/Materiales', verificarAdmin, (req, res) => {
    const { nombre, metros_disponibles, precio, imagen_url } = req.body;
    const sql = 'INSERT INTO Materiales (nombre, metros_disponibles, precio, imagen_url) VALUES (?, ?, ?, ?)';
    pool.query(sql, [nombre, metros_disponibles, precio, imagen_url], (err, results) => {
        if (err) {
            console.error('Error al insertar Materiales', err);
            return res.status(500).json({ error: err.message });
        }
        // Registrar el movimiento en la tabla de movimientos
        const movimientoSql = `INSERT INTO MovimientosInventario (id_material, tipo_movimiento, cantidad, fecha_movimiento, descripcion) VALUES (?, "CREAR", ?, NOW(), ?)`;
        pool.query(movimientoSql, [results.insertId, metros_disponibles, `Se creó el material ${nombre}`], (err) => {
            if (err) {
                console.error("Error al registrar movimiento", err);
            }
        });
        res.status(201).json({ id: results.insertId, nombre, metros_disponibles, precio, imagen_url });
    });
});

// Actualizar un producto (solo administrador) - SIN unidad
app.put('/Materiales/:id_material', verificarAdmin, (req, res) => {
    const { id_material } = req.params; 
    const { nombre, metros_disponibles, precio, imagen_url } = req.body;
    const sql = 'UPDATE Materiales SET nombre = ?, metros_disponibles = ?, precio = ?, imagen_url = ? WHERE id_material = ?';
    pool.query(sql, [nombre, metros_disponibles, precio, imagen_url, id_material], (err, results) => {
        if (err) {
            console.error("Error al actualizar", err);
            return res.status(500).json({ error: err.message });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: "Material no encontrado" });
        }

        // Registrar el movimiento en la tabla de movimientos
        const movimientoSql = `INSERT INTO MovimientosInventario (id_material, tipo_movimiento, cantidad, fecha_movimiento, descripcion) VALUES (?, "ACTUALIZAR", ?, NOW(), ?)`;
        pool.query(movimientoSql, [id_material, metros_disponibles, `Se actualizó el material ${nombre}`], (err) => {
            if (err) {
                console.error("Error al registrar movimiento", err);
            }
        });

        res.json({ message: 'Material actualizado' });
    });
});

// Eliminar un producto (solo administrador) - SIN unidad
app.delete('/Materiales/:id_material', verificarAdmin, (req, res) => {
    const { id_material } = req.params;

    // Primero eliminar los movimientos asociados al material
    const deleteMovimientosSql = 'DELETE FROM MovimientosInventario WHERE id_material = ?';
    pool.query(deleteMovimientosSql, [id_material], (err, results) => {
        if (err) {
            console.error("Error al eliminar movimientos", err);
            return res.status(500).json({ error: 'Error al eliminar movimientos asociados' });
        }

        // Luego eliminar el material
        const deleteMaterialSql = 'DELETE FROM Materiales WHERE id_material = ?';
        pool.query(deleteMaterialSql, [id_material], (err, results) => {
            if (err) {
                console.error("Error al eliminar material", err);
                return res.status(500).json({ error: 'Error al eliminar material' });
            }
            res.json({ message: 'Material y movimientos asociados eliminados' });
        });
    });
});

// Obtener el historial de movimientos (solo administrador)
app.get('/historial', verificarAdmin, (req, res) => {
    const sql = `
        SELECT MovimientosInventario.*, Materiales.nombre 
        FROM MovimientosInventario 
        JOIN Materiales ON MovimientosInventario.id_material = Materiales.id_material 
        ORDER BY fecha_movimiento DESC`;
    
    pool.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener el historial de movimientos:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results); // Enviar los movimientos obtenidos al frontend
    });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto: ${port}`);
});
