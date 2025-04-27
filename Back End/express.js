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
app.get('/api', (req, res) => {
  db.query('SELECT * FROM producto WHERE id = 1', (err, result) => {
    if (err) {
      console.error('Error conectando a MySQL:', err);
      return res.status(500).json({ error: 'Error de conexión' });
    }
    res.json({ success: true, resultado: result[0] });
  });
});


app.get('/api/get/lista_productos', (req, res) => {
  const categoria = req.query.categoria || 'todas';
  const orden = req.query.orden === 'desc' ? 'DESC' : 'ASC'; // ascendente por defecto
  let query = `
    SELECT 
      FT.nombre as nombre_producto,
      C.nombre as categoria,
      FT.cantidad as cantidad,
      FT.precio_unitario as precio
    FROM fichatecnica AS FT
    INNER JOIN producto AS P
    USING (ficha_id)
    INNER JOIN CATEGORIA AS C
    USING (categoria_id)
  `;
  const parametros= [];

  if(categoria!=='todas'){
    query +=`WHERE C.nombre = ?`;
    parametros.push(categoria);
  }
  query +=`ORDER BY FT.cantidad ${orden}`;
  db.query(query,parametros,(err, results) => {
      if (err) {
        console.error('Error al obtener productos:', err);
        return res.status(500).json({ error: 'Error al obtener productos' });
      }
      res.json({ success: true, productos: results });
    }
  );
});


// Arrancar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
