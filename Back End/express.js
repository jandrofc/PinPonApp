// index.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Crear la conexión a la base de datos
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

// Ruta de prueba para comprobar conexión
app.get('/test-db', (req, res) => {
  db.query('SELECT * FROM producto WHERE id = 1', (err, result) => {
    if (err) {
      console.error('Error conectando a MySQL:', err);
      return res.status(500).json({ error: 'Error de conexión' });
    }
    res.json({ success: true, resultado: result[0] });
  });
});

// Arrancar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});