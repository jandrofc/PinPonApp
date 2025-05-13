// index.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: 'localhost:8100', // IP de tu notebook con el frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

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
                    P.producto AS nombre_producto,
                    FP.formato,
                    P.marca,
                    FP.cantidad,
                    FP.precio,
                    FP.codigo_barra,
                    FP.fecha_creacion,
                    FP.fecha_actualizado
              FROM formato_producto AS FP
              INNER JOIN producto AS P
              ON FP.producto_id = P.id `;
    const parametros= [];
    const wheres = [];
    // Condicinal para productos y formato habilitados 
    wheres.push('FP.habilitado = 1');
    wheres.push('P.habilitado = 1');

    if(marca!=='any'){
      wheres.push(`P.marca = ?`);
      parametros.push(marca);
    }

    // Armeos el WHERE con todos los filtros acumulados
    if (wheres.length) {
      query += 'WHERE ' + wheres.join(' AND ') + '\n';
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
app.post('/api/post/producto', (req, res) => {
    const {
      producto,
      marca,
      formato,
      cantidad,
      codigo_barra,
      precio
    } = req.body;

    // 1) Validar campos obligatorios
    if (!producto || !marca || !formato || cantidad == null || !codigo_barra || precio == null) {
      return res.status(400).json({ error: 'Faltan datos obligatorios en el body' });
    }


  // 2) Comprobar unicidad de código de barras
    const codigoQuery = `SELECT id FROM formato_producto WHERE codigo_barra = ?`;
    db.query(codigoQuery, [codigo_barra], (err, codigoRes) => {
    if (err) {
      console.error('Error comprobando código de barras:', err);
      return res.status(500).json({ error: 'Error en la validación de código de barras' });
    }
    if (codigoRes.length > 0) {
      return res.status(400).json({ error: 'Código de barras ya registrado' });
    }

    // 3) Comprobar si existe el producto genérico
    const checkQuery = `SELECT id FROM producto WHERE producto = ? AND marca = ?`;
    db.query(checkQuery, [producto, marca], (err, prodRes) => {
      if (err) {
        console.error('Error comprobando producto:', err);
        return res.status(500).json({ error: 'Error al comprobar producto' });
      }

      const insertarFormato = (productId) => {
        const insertFmtQ = `
          INSERT INTO formato_producto
            (producto_id, formato, cantidad, codigo_barra, precio)
          VALUES (?, ?, ?, ?, ?)
        `;
        db.query(
          insertFmtQ,
          [productId, formato, cantidad, codigo_barra, precio],
          (err, fmtRes) => {
            if (err) {
              console.error('Error al insertar formato:', err);
              return res.status(500).json({ error: 'Error al insertar formato' });
            }
            res.json({
              success: true,
              message: prodRes.length > 0
                ? 'Formato agregado a producto existente'
                : 'Producto y formato creados correctamente',
              formatoId: fmtRes.insertId,
              productoId: productId
            });
          }
        );
      };

      if (prodRes.length > 0) {
        // a) Producto ya existe → sólo insertamos formato
        const existingId = prodRes[0].id;
        insertarFormato(existingId);
      } else {
        // b) Producto no existe → insertamos producto y luego formato
        const insertProdQ = `INSERT INTO producto (producto, marca) VALUES (?, ?)`;
        db.query(insertProdQ, [producto, marca], (err, prodInsertRes) => {
          if (err) {
            console.error('Error al insertar producto:', err);
            return res.status(500).json({ error: 'Error al crear producto' });
          }
          const newProductId = prodInsertRes.insertId;
          insertarFormato(newProductId);
        });
      }
    });
  });
});

//Valida que el codigo de barra exista en la DB

app.get('/api/get/validar_codigo/:codigo', (req, res) => {
  const codigo = req.params.codigo;

  if (!codigo) {
    return res.status(400).json({ error: 'Falta el código de barra' });
  }

  const query = 'SELECT * FROM formato_producto WHERE codigo_barra = ? ';

  db.query(query, [codigo], (err, results) => {
    if (err) {
      console.error('Error al buscar el código de barra:', err);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }

    if (results.length  === 1) {
      // Ya existe un producto con este código
      res.json({ mensaje: 'Producto ya existente' });
    } else {
      // No existe
      res.json({ mensaje: 'Producto no existente' });
    }
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

//Para actualizar los datos del producto
app.put('/api/put/formato', (req, res) => {
  const {
    id_formato, //pete
    producto_id,
    nombre_producto,  // <-- nombre que quieres dejar en producto.producto
    formato,
    cantidad,
    codigo_barra,
    precio
  } = req.body;

  if (!id_formato) {
    return res.status(400).json({ error: 'Falta el id_formato' });
  }

  const updateQuery = `
    UPDATE formato_producto AS fp
    JOIN producto AS p
      ON fp.producto_id = p.id
    SET
      fp.producto_id       = ?,
      fp.formato           = ?,
      fp.cantidad          = ?,
      fp.codigo_barra      = ?,
      fp.precio            = ?,
      fp.fecha_actualizado = NOW(),
      p.producto           = ?
    WHERE fp.id = ?
  `;

  const params = [
    producto_id,
    formato,
    cantidad,
    codigo_barra,
    precio,
    nombre_producto,
    id_formato
  ];

  db.query(updateQuery, params, (err, result) => {
    if (err) {
      console.error('Error al actualizar:', err);
      return res
        .status(500)
        .json({ error: 'Error al actualizar formato y producto', consoleErr: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Formato o producto no encontrado' });
    }
    res.json({ success: true, message: 'Formato y nombre de producto actualizados correctamente' });
  });
});

//deshabilita el formato de un producto y la fecha en el que fue deshabilitado

app.patch('/api/patch/formato/:id', (req, res) => {
  const id = req.params.id;

  // Validación básica
  if (!id) {
    return res.status(400).json({ error: 'Falta el ID del producto' });
  }

  // Actualizamos el campo habilitado a 0 y la fecha de actualización
  const query = `
    UPDATE formato_producto
    SET habilitado = 0,
        fecha_actualizado = NOW()
    WHERE id = ?
  `;

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error al deshabilitar producto:', err);
      return res.status(500).json({ error: 'Error en la base de datos', details: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ success: true, message: 'Producto deshabilitado correctamente' });
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
    ],
    PATCH: [
      '/api/patch/formato/:id'
    ]
  };

  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada. Aquí están los endpoints disponibles:',
    endpoints
  });
});




const os = require('os');
console.log(getIPv4Address());
// Arrancar el servidor
 const PORT = process.env.PORT || 3000;
 app.listen(PORT,'0.0.0.0', () => {
   console.log(`Servidor escuchando en http://localhost:3000`);
 });



//openssl req -nodes -new -x509 -keyout key.pem -out cert.pem -days 365

// const https = require('https');
// const fs = require('fs');


// const options = {
//   key: fs.readFileSync('firma_openssl/key.pem'),
//   cert: fs.readFileSync('firma_openssl/cert.pem')
// };

function getIPv4Address() {
  const networkInterfaces = os.networkInterfaces();

  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];

    for (const iface of interfaces) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }

  return 'No se encontró una dirección IPv4';
}

// const ipv4Address = getIPv4Address();
// https.createServer(options, app).listen(3000, '0.0.0.0', () => {
//   console.log(`Servidor escuchando en https://${getIPv4Address()}:3000`);
// });
