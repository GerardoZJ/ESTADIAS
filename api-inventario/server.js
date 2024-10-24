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
    connectionLimit: 10,  // Define cuántas conexiones pueden ser creadas
    queueLimit: 0         // Sin límite en la cola de peticiones
});

// Verificar la conexión inicial
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conexión exitosa a la base de datos');
    connection.release(); // Liberar la conexión de nuevo al pool
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
    pool.query(sql, [usuario], (err, results) => { // Utilizando el pool para las consultas
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
    pool.query(sql, (err, results) => { // Utilizando el pool para las consultas
        if (err) {
            console.error('Error al obtener materiales:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Crear un producto (solo administrador)
app.post('/Materiales', verificarAdmin, (req, res) => {
    const { nombre, unidad, metros_disponibles, precio, imagen_url } = req.body;

    const sql = 'INSERT INTO Materiales (nombre, unidad, metros_disponibles, precio, imagen_url) VALUES (?, ?, ?, ?, ?)';
    pool.query(sql, [nombre, unidad, metros_disponibles, precio, imagen_url], (err, results) => { // Utilizando el pool para las consultas
        if (err) {
            console.error('Error al insertar Materiales', err);
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: results.insertId, nombre, unidad, metros_disponibles, precio, imagen_url });
    });
});

// Actualizar un producto (solo administrador) - Usar id_material en lugar de id
app.put('/Materiales/:id_material', verificarAdmin, (req, res) => {
    const { id_material } = req.params; 
    const { nombre, unidad, metros_disponibles, precio } = req.body;

    const sql = 'UPDATE Materiales SET nombre = ?, unidad = ?, metros_disponibles = ?, precio = ? WHERE id_material = ?';
    pool.query(sql, [nombre, unidad, metros_disponibles, precio, id_material], (err, results) => { // Utilizando el pool para las consultas
        if (err) {
            console.error("Error al actualizar", err);
            return res.status(500).json({ error: err.message });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: "Material no encontrado" });
        }
        res.json({ message: 'Material actualizado' });
    });
});

// Eliminar un producto (solo administrador) - Usar id_material en lugar de id
app.delete('/Materiales/:id_material', verificarAdmin, (req, res) => {
    const { id_material } = req.params; 

    const sql = 'DELETE FROM Materiales WHERE id_material = ?';
    pool.query(sql, [id_material], (err, results) => { // Utilizando el pool para las consultas
        if (err) {
            console.error("Error al eliminar", err);
            return res.status(500).json({ error: err.message });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: "Material no encontrado" });
        }
        res.json({ message: 'Material eliminado' });
    });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto: ${port}`);
});
