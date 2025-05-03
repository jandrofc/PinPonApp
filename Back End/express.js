// index.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

// const helmet = require('helmet');
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"],
//       connectSrc: ["'self'", "https://localhost:3000"]
//     }
//   })
// );

app.use(express.json());

// Crear la conexión a la base de datos
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});


app.get('/api/get/lista_productos', (request, response) => {
  const marca =  request.query.marca || 'any';
  const orden =  request.query.orden  === 'desc' ? 'DESC' : 'ASC';

  let query= `SELECT 
                    FP.id AS id_formato,
                    FP.producto_id,
                    P.producto,
                    FP.formato,
                    P.marca,
                    FP.cantidad,
                    FP.precio,
                    FP.codigo_barra,
                    FP.fecha_creacion,
                    FP.fecha_actualizado
              FROM formato_producto AS FP
              INNER JOIN producto AS P
              ON FP.producto_id = P.id \n`;
    const parametros= [];

    if(marca!=='any'){
      query +=`WHERE P.marca = ?\n`;
      parametros.push(marca);
    }
    query +=`ORDER BY FP.cantidad ${orden};`;
    db.query(query,parametros,(err, results) => {
        if (err) {
          console.error('Error al obtener productos:', err);
          return response.status(500).json({ error: 'Error al obtener productos', consoleErr: err});
        }
        response.json({ success: true, productos: results });
      }
    );

});
//curl -X POST http://localhost:3000/api/post/producto
app.post('/api/post/producto', (request, response) => {
  const { producto, marca } = request.body; // Recibir datos del cuerpo de la solicitud

  if (!producto || !marca) {
    return response.status(400).json({ error: 'Faltan datos: producto o marca' });
  }

  // Comprobar si el producto ya existe
  const checkQuery = `SELECT * FROM producto WHERE producto = ? AND marca = ?`;
  const checkParams = [producto, marca];

  db.query(checkQuery, checkParams, (err, results) => {
    if (err) {
      console.error('Error al comprobar producto:', err);
      return response.status(500).json({ error: 'Error al comprobar producto', consoleErr: err });
    }

    if (results.length > 0) {
      // El producto ya existe
      return response.status(400).json({ error: 'El producto ya existe' });
    }

    // Si no existe, insertar el producto
    const insertQuery = `INSERT INTO producto (producto, marca) VALUES (?, ?)`;
    const insertParams = [producto, marca];

    db.query(insertQuery, insertParams, (err, results) => {
      if (err) {
        console.error('Error al insertar producto:', err);
        return response.status(500).json({ error: 'Error al insertar producto', consoleErr: err });
      }
      response.json({ success: true, message: 'Producto insertado correctamente', results });
    });
  });
});


app.post('/api/post/formato',(request,response)=>{
  const {producto_id,formato,cantidad,codigo_barra,precio}  = request.body;
  if (!producto_id){
    return response.status(400).json({ error: 'Faltan datos: producto' });
  }
  const checkQuery = `SELECT * FROM producto WHERE id = ?`;
  const checkParams = [producto_id];

  db.query(checkQuery, checkParams, (err, results) => {
    if (err) {
      console.error('Error al comprobar producto:', err);
      return response.status(500).json({ error: 'Error al comprobar producto', consoleErr: err });
    }

    if (results.length < 0) {
      // El producto ya existe
      return response.status(400).json({ error: 'El producto no existe... hay que crearlo' });
    }

    const insertQuery = `INSERT INTO formato_producto (producto_id, formato, cantidad, codigo_barra, precio) 
                        VALUES (?, ?,?,?,?);`;
    const insertParams = [producto_id, formato, cantidad,codigo_barra,precio];
    
    db.query(insertQuery, insertParams, (err, results) => {
      if (err) {
        console.error('Error al insertar producto:', err);
        return response.status(500).json({ error: 'Error al insertar el formato', consoleErr: err });
      }
      response.json({ success: true, message: 'Formato insertado correctamente', results });
    });
  });
});


// Middleware para manejar rutas no definidas
app.use((req, res) => {
  const endpoints = {
    GET: [
      '/api', 
      '/api/get/lista_productos?marca={marca}&orden={asc|desc}'
    ],
    POST: [
      '/api/post/producto'
    ]
  };

  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada. Aquí están los endpoints disponibles:',
    endpoints
  });
});

// Arrancar el servidor
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Servidor escuchando en http://localhost:${PORT}`);
// });



//openssl req -nodes -new -x509 -keyout key.pem -out cert.pem -days 365

const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('firma_openssl/key.pem'),
  cert: fs.readFileSync('firma_openssl/cert.pem')
};

https.createServer(options, app).listen(3000, () => {
  console.log('Servidor escuchando en https://localhost:3000');
});
