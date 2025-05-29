// index.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: ['http://localhost:8100','capacitor://localhost',"*"], // IP de tu notebook con el frontend
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



const os = require('os');

// Arrancar el servidor
const PORT = process.env.PORT || 3000;
 app.listen(PORT,'0.0.0.0', () => {
   console.log(`Servidor escuchando en http://${getIPv4Address()}:${PORT}`);
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

// https.createServer(options, app).listen(3000, '0.0.0.0', () => {
//   console.log(`Servidor escuchando en https://${getIPv4Address()}:3000`);
// });










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
    // Permitir recibir un solo objeto o un array de productos
    const productos = Array.isArray(req.body) ? req.body : [req.body];
    const resultados = [];
    let procesados = 0;

    if (productos.length === 0) {
        return res.status(400).json({ error: 'No se enviaron productos para registrar' });
    }

    productos.forEach((productoObj, idx) => {
        const {
            producto,
            marca,
            formato,
            cantidad,
            codigo_barra,
            precio
        } = productoObj;

        // Validar campos obligatorios
        if (!producto || !marca || !formato || cantidad == null || !codigo_barra || precio == null) {
            resultados.push({ idx, error: 'Faltan datos obligatorios en el body', producto: productoObj });
            procesados++;
            if (procesados === productos.length) {
                return res.json({ resultados });
            }
            return;
        }

        // Comprobar unicidad de código de barras y estado habilitado
        const codigoQuery = `SELECT * FROM formato_producto WHERE codigo_barra = ?`;
        db.query(codigoQuery, [codigo_barra], (err, codigoRes) => {
            if (err) {
                resultados.push({ idx, error: 'Error en la validación de código de barras', details: err, producto: productoObj });
                procesados++;
                if (procesados === productos.length) {
                    return res.json({ resultados });
                }
                return;
            }
            if (codigoRes.length > 0) {
                const formato = codigoRes[0];
                if (formato.habilitado === 1) {
                    // Ya existe y está habilitado: sumar cantidad
                    const nuevaCantidad = Number(formato.cantidad) + Number(cantidad);
                    const updateCantidadQuery = `
                        UPDATE formato_producto
                        SET cantidad = ?
                        WHERE id = ?
                    `;
                    db.query(updateCantidadQuery, [nuevaCantidad, formato.id], (err, updateRes) => {
                        if (err) {
                            resultados.push({ idx, error: 'Error al actualizar cantidad', details: err, producto: productoObj });
                        } else {
                            resultados.push({
                                idx,
                                success: true,
                                message: 'Cantidad sumada a formato existente',
                                formato: { ...formato, cantidad: nuevaCantidad }
                            });
                        }
                        procesados++;
                        if (procesados === productos.length) {
                            return res.json({ resultados });
                        }
                    });
                    return;
                } else {
                    // Existe pero está deshabilitado, lo reactivamos
                    const updateQuery = `
                        UPDATE formato_producto
                        SET habilitado = 1, cantidad = ?
                        WHERE id = ?
                    `;
                    db.query(updateQuery, [cantidad, formato.id], (err, updateRes) => {
                        if (err) {
                            resultados.push({ idx, error: 'Error al reactivar formato', details: err, producto: productoObj });
                        } else {
                            resultados.push({
                                idx,
                                success: true,
                                message: 'Formato reactivado correctamente',
                                formato: { ...formato, habilitado: 1, cantidad }
                            });
                        }
                        procesados++;
                        if (procesados === productos.length) {
                            return res.json({ resultados });
                        }
                    });
                    return;
                }
            }

            // Comprobar si existe el producto genérico
            const checkQuery = `SELECT id FROM producto WHERE producto = ? AND marca = ?`;
            db.query(checkQuery, [producto, marca], (err, prodRes) => {
                if (err) {
                    resultados.push({ idx, error: 'Error al comprobar producto', details: err, producto: productoObj });
                    procesados++;
                    if (procesados === productos.length) {
                        return res.json({ resultados });
                    }
                    return;
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
                                resultados.push({ idx, error: 'Error al insertar formato', details: err, producto: productoObj });
                            } else {
                                resultados.push({
                                    idx,
                                    success: true,
                                    message: prodRes.length > 0
                                        ? 'Formato agregado a producto existente'
                                        : 'Producto y formato creados correctamente',
                                    formatoId: fmtRes.insertId,
                                    productoId: productId
                                });
                            }
                            procesados++;
                            if (procesados === productos.length) {
                                return res.json({ resultados });
                            }
                        }
                    );
                };

                if (prodRes.length > 0) {
                    // Producto ya existe → sólo insertamos formato
                    const existingId = prodRes[0].id;
                    insertarFormato(existingId);
                } else {
                    // Producto no existe → insertamos producto y luego formato
                    const insertProdQ = `INSERT INTO producto (producto, marca) VALUES (?, ?)`;
                    db.query(insertProdQ, [producto, marca], (err, prodInsertRes) => {
                        if (err) {
                            resultados.push({ idx, error: 'Error al crear producto', details: err, producto: productoObj });
                            procesados++;
                            if (procesados === productos.length) {
                                return res.json({ resultados });
                            }
                            return;
                        }
                        const newProductId = prodInsertRes.insertId;
                        insertarFormato(newProductId);
                    });
                }
            });
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
    id_formato,
    producto_id,
    nombre_producto,
    formato,
    cantidad,
    codigo_barra,
    precio
  } = req.body;

  // Validación de datos dependiendo de si esta vacion o no es String o numero negativos
  if (!id_formato) {
    return res.status(400).json({ error: 'Falta el id_formato' });
  }
  if (!producto_id) {
    return res.status(400).json({ error: 'Falta el producto_id' });
  }
  if (!nombre_producto || typeof nombre_producto !== 'string' || nombre_producto.trim() === '') {
    return res.status(400).json({ error: 'Falta el nombre_producto o es inválido' });
  }
  if (!formato || typeof formato !== 'string' || formato.trim() === '') {
    return res.status(400).json({ error: 'Falta el formato o es inválido' });
  }
  if (cantidad == null || isNaN(Number(cantidad)) || Number(cantidad) < 0) {
    return res.status(400).json({ error: 'Cantidad inválida' });
  }
  if (!codigo_barra || typeof codigo_barra !== 'string' || codigo_barra.trim() === '') {
    return res.status(400).json({ error: 'Falta el codigo_barra o es inválido' });
  }
  if (precio == null || isNaN(Number(precio)) || Number(precio) < 0) {
    return res.status(400).json({ error: 'Precio inválido' });
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


// Endpoint para obtener un producto por su código de barra
app.get('/api/get/producto_por_codigo/:codigo', (req, res) => {
  const codigo = req.params.codigo;
  if (!codigo) {
    return res.status(400).json({ error: 'Falta el código de barra' });
  }
  const query = `
    SELECT 
      FP.id AS id_formato,
      FP.producto_id,
      P.producto AS nombre_producto,
      FP.formato,
      P.marca,
      FP.cantidad,
      FP.precio,
      FP.codigo_barra
    FROM formato_producto FP
    INNER JOIN producto P ON FP.producto_id = P.id
    WHERE FP.codigo_barra = ? AND FP.habilitado = 1 AND P.habilitado = 1
    LIMIT 1
  `;
  db.query(query, [codigo], (err, results) => {
    if (err) {
      console.error('Error al buscar el producto:', err);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    if (results.length === 1) {
      res.json({ producto: results[0] });
    } else {
      res.status(404).json({ error: 'Producto no encontrado' });
    }
  });
});

// Endpoint para realizar una compra y actualizar el stock

// Esta función maneja la compra y hace rollback en caso de error
function rollback(connection, res, msg, err) {
  if (connection) {
    connection.rollback(() => {
      connection.release();
      res.status(500).json({ error: msg, details: err.message });
    });
  } else {
    res.status(500).json({ error: msg, details: err.message });
  }
}

app.post('/api/post/realizar_compra', (req, res) => {
  const { productos } = req.body;
  if (!productos || !Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ error: 'Debes enviar productos' });
  }

  // Calcula el total de la venta
  const total = productos.reduce((acc, p) => acc + (p.cantidad * p.precio), 0);

  db.getConnection((err, connection) => {
    if (err) return res.status(500).json({ error: 'Error de conexión', details: err });

    connection.beginTransaction(err => {
      if (err) {
        connection.release();
        return res.status(500).json({ error: 'Error al iniciar la compra', details: err });
      }

      // 1. Insertar la venta
      const insertVenta = 'INSERT INTO venta (total) VALUES (?)';
      connection.query(insertVenta, [total], (err, resultVenta) => {
        if (err) return rollback(connection, res, 'Error al insertar venta', err);
        if (!resultVenta || !resultVenta.insertId) {
          return rollback(connection, res, 'No se pudo obtener el ID de la venta', new Error('insertId indefinido'));
        }

        const idVenta = resultVenta.insertId;

        // 2. Insertar los detalles de la venta
        const insertDetalle = 'INSERT INTO detalle_venta (id_venta, id_formato_producto, cantidad, precio_unitario) VALUES ?';
        const detalleValues = productos.map(p => [idVenta, p.id_formato, p.cantidad, p.precio]);

        connection.query(insertDetalle, [detalleValues], (err) => {
          if (err) return rollback(connection, res, 'Error al insertar detalle', err);

          // 3. Descontar stock de cada producto
          const updates = productos.map(p => {
            return new Promise((resolve, reject) => {
              const updateStock = `
                UPDATE formato_producto
                SET cantidad = cantidad - ?
                WHERE id = ? AND cantidad >= ?`;
              connection.query(updateStock, [p.cantidad, p.id_formato, p.cantidad], (err, result) => {
                if (err) return reject(err);
                if (result.affectedRows === 0) return reject(new Error('Stock insuficiente para el producto ' + p.id_formato));
                resolve();
              });
            });
          });

          Promise.all(updates)
            .then(() => {
              connection.commit(err => {
                if (err) return rollback(connection, res, 'Error al confirmar', err);
                connection.release();
                res.status(201).json({ mensaje: 'Venta registrada', id_venta: idVenta });
              });
            })
            .catch(err => rollback(connection, res, 'Error al actualizar stock', err));
        });
      });
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

