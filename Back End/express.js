// index.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./.pinponClaveCuenta.json');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config();

// Crear directorio
const uploadDir = './uploads/productos';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurar multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/productos/');
  },
  filename: (req, file, cb) => {
    // Usar código de barras + timestamp para evitar duplicados
    const codigoBarra = req.body.codigo_barra || Date.now();
    const extension = path.extname(file.originalname) || '.jpg';
    cb(null, `${codigoBarra}_${Date.now()}${extension}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'));
    }
  }
});

// Crear la conexión a la base de datos
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});


const app = express();
app.use(cors({
  origin: ['http://localhost:8100','capacitor://localhost','*'], // IP de tu notebook con el frontend
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

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

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

// Servir archivos estáticos
app.use('/uploads', express.static('uploads'));

// Endpoint para subir imagen individual
app.post('/upload/imagen-producto', upload.single('imagen'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ninguna imagen' });
    }

    const codigoBarra = req.body.codigo_barra;
    const imagenAnterior = req.body.imagen_anterior;
    
    // Construir la ruta relativa de la nueva imagen
    const nuevaImagenUrl = `/uploads/productos/${req.file.filename}`;
    
    if (imagenAnterior && imagenAnterior !== nuevaImagenUrl) {
      const rutaImagenAnterior = path.join(__dirname, 'uploads', 'productos', path.basename(imagenAnterior));
      
      if (fs.existsSync(rutaImagenAnterior)) {
        try {
          fs.unlinkSync(rutaImagenAnterior);
        } catch (deleteError) {
          console.warn('No se pudo eliminar imagen anterior:', deleteError);
        }
      }
    }

    // ACTUALIZAR base de datos
    if (codigoBarra) {
      const updateQuery = `
        UPDATE formato_producto 
        SET imagen_url = ? 
        WHERE codigo_barra = ?
      `;
      
      db.query(updateQuery, [nuevaImagenUrl, codigoBarra], (err, result) => {
        if (err) {
          console.error(' Error actualizando BD:', err);
          return res.status(500).json({ 
            error: 'Error actualizando base de datos',
            imageUrl: nuevaImagenUrl // Devolver URL aunque haya error en BD
          });
        }
        
        console.log(' Base de datos actualizada');
        console.log(' Filas afectadas:', result.affectedRows);
        
        res.json({
          success: true,
          message: 'Imagen subida y actualizada correctamente',
          imageUrl: nuevaImagenUrl,
          affectedRows: result.affectedRows
        });
      });
    } else {
      // Si no hay código de barras, solo devolver la URL
      res.json({
        success: true,
        message: 'Imagen subida correctamente',
        imageUrl: nuevaImagenUrl
      });
    }

  } catch (error) {
    console.error(' Error en upload:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para eliminar imagen
app.delete('/api/delete/imagen-producto/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, 'uploads', 'productos', filename);
  
  fs.unlink(filepath, (err) => {
    if (err) {
      console.error('Error eliminando imagen:', err);
      return res.status(500).json({ error: 'Error eliminando imagen' });
    }
    res.json({ success: true, message: 'Imagen eliminada' });
  });
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
                    FP.stock_min,
                    FP.codigo_barra,
                    FP.fecha_creacion,
                    FP.fecha_actualizado,
                    FP.imagen_url
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
app.post('/api/post/producto', async (req, res) => {
    const productos = Array.isArray(req.body) ? req.body : [req.body];
    
    if (productos.length === 0) {
        return res.status(400).json({ error: 'No se enviaron productos para registrar' });
    }

    const resultados = [];

    try {
        for (let idx = 0; idx < productos.length; idx++) {
            const productoObj = productos[idx];
            const { producto, marca, formato, cantidad, codigo_barra, precio, stock_min, imagen_url } = productoObj;

            // Validar campos obligatorios
            if (!producto || !marca || !formato || cantidad == null || !codigo_barra || precio == null || stock_min == null) {
                resultados.push({ 
                    idx, 
                    error: 'Faltan datos obligatorios en el body', 
                    producto: productoObj 
                });
                continue;
            }

            try {
                // Verificar si el código ya existe
                const codigoExistente = await new Promise((resolve, reject) => {
                    const codigoQuery = `SELECT * FROM formato_producto WHERE codigo_barra = ?`;
                    db.query(codigoQuery, [codigo_barra], (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    });
                });

                if (codigoExistente.length > 0) {
                    const formato = codigoExistente[0];
                    if (formato.habilitado === 1) {
                        // Sumar cantidad a formato existente
                        const nuevaCantidad = Number(formato.cantidad) + Number(cantidad);
                        await new Promise((resolve, reject) => {
                            const updateQuery = `UPDATE formato_producto SET cantidad = ? WHERE id = ?`;
                            db.query(updateQuery, [nuevaCantidad, formato.id], (err, result) => {
                                if (err) reject(err);
                                else resolve(result);
                            });
                        });
                        
                        resultados.push({
                            idx,
                            success: true,
                            message: 'Cantidad sumada a formato existente',
                            formato: { ...formato, cantidad: nuevaCantidad }
                        });
                        continue;
                    } else {
                        // Reactivar formato deshabilitado
                        await new Promise((resolve, reject) => {
                            const updateQuery = `UPDATE formato_producto SET habilitado = 1, cantidad = ? WHERE id = ?`;
                            db.query(updateQuery, [cantidad, formato.id], (err, result) => {
                                if (err) reject(err);
                                else resolve(result);
                            });
                        });
                        
                        resultados.push({
                            idx,
                            success: true,
                            message: 'Formato reactivado correctamente',
                            formato: { ...formato, habilitado: 1, cantidad }
                        });
                        continue;
                    }
                }

                // Verificar si el producto genérico existe
                const productoExistente = await new Promise((resolve, reject) => {
                    const checkQuery = `SELECT id FROM producto WHERE producto = ? AND marca = ?`;
                    db.query(checkQuery, [producto, marca], (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    });
                });

                let productoId;

                if (productoExistente.length > 0) {
                    // Usar producto existente
                    productoId = productoExistente[0].id;
                } else {
                    // Crear nuevo producto
                    const nuevoProducto = await new Promise((resolve, reject) => {
                        const insertProdQ = `INSERT INTO producto (producto, marca) VALUES (?, ?)`;
                        db.query(insertProdQ, [producto, marca], (err, result) => {
                            if (err) reject(err);
                            else resolve(result);
                        });
                    });
                    productoId = nuevoProducto.insertId;
                }

                // Insertar formato
                const nuevoFormato = await new Promise((resolve, reject) => {
                    const insertFmtQ = `
                      INSERT INTO formato_producto (producto_id, formato, cantidad, codigo_barra, precio, stock_min, imagen_url)
                      VALUES (?, ?, ?, ?, ?, ?, ?)
                    `;
                    db.query(insertFmtQ, [productoId, formato, cantidad, codigo_barra, precio, stock_min, imagen_url || null], (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });

                resultados.push({
                    idx,
                    success: true,
                    message: productoExistente.length > 0 
                        ? 'Formato agregado a producto existiente' 
                        : 'Producto y formato creados correctamente',
                    formatoId: nuevoFormato.insertId,
                    productoId: productoId
                });

            } catch (error) {
                console.error(`Error procesando producto ${idx}:`, error);
                resultados.push({ 
                    idx, 
                    error: 'Error al procesar producto', 
                    details: error.message, 
                    producto: productoObj 
                });
            }
        }

        // Enviar respuesta una sola vez al final
        res.json({ 
            success: true, 
            message: `Procesados ${productos.length} productos`,
            resultados 
        });

    } catch (error) {
        console.error('Error general:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor', 
            details: error.message 
        });
    }
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
    precio,
    stock_min,
    imagen_url
  } = req.body;

  // Validación de datos dependiendo de si esta vacio o no es String o numero negativos
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
  if (stock_min == null || isNaN(Number(stock_min)) || Number(stock_min) < 0) {
    return res.status(400).json({ error: 'Stock mínimo inválido' });
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
      fp.stock_min         = ?,
      fp.fecha_actualizado = NOW(),
      p.producto           = ?,
      fp.imagen_url        = ?
    WHERE fp.id = ?
  `;

  const params = [
    producto_id,
    formato,
    cantidad,
    codigo_barra,
    precio,
    stock_min,
    nombre_producto,
    imagen_url || null, // Permitir que imagen_url sea nulo si no se proporciona
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
      FP.codigo_barra,
      FP.imagen_url
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

// Función para enviar notificaciones a todos los tokens
function notificarStockBajo(productos) {
  db.query('SELECT token FROM fcm_tokens', (err, results) => {
    if (err) return;
    const tokens = results.map(r => r.token);
    
    if (tokens.length === 0) return;  
    const notification = {
      notification: {
        title: '¡Stock bajo!',
        body: `Productos: ${productos.map(p => p.nombre).join(', ')}`
      }
    };

    tokens.forEach(token => {
      const mensaje = { ...notification, token };
      console.log('Enviando notificación FCM a:', token, JSON.stringify(mensaje, null, 2));
      admin.messaging().send(mensaje)
        .then(response => {
          console.log('Notificación enviada a', token, response);
        })
        .catch(error => {
          console.error('Error enviando a', token, error);
        });
    });
  });
}

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
    console.log('No se enviaron productos para la compra');
    return res.status(400).json({ error: 'Debes enviar productos' });
  }

  // Calcula el total de la venta
  const total = productos.reduce((acc, p) => acc + (p.cantidad * p.precio), 0);
  console.log('Iniciando compra. Productos:', productos, 'Total:', total);

  db.getConnection((err, connection) => {
    if (err) {
      console.error('Error de conexión a la base de datos:', err);
      return res.status(500).json({ error: 'Error de conexión', details: err });
    }

    connection.beginTransaction(err => {
      if (err) {
        console.error('Error al iniciar la transacción:', err);
        connection.release();
        return res.status(500).json({ error: 'Error al iniciar la compra', details: err });
      }

      // 1. Insertar la venta
      const insertVenta = 'INSERT INTO venta (total) VALUES (?)';
      connection.query(insertVenta, [total], (err, resultVenta) => {
        if (err) {
          console.error('Error al insertar venta:', err);
          return rollback(connection, res, 'Error al insertar venta', err);
        }
        if (!resultVenta || !resultVenta.insertId) {
          console.error('No se pudo obtener el ID de la venta');
          return rollback(connection, res, 'No se pudo obtener el ID de la venta', new Error('insertId indefinido'));
        }

        const idVenta = resultVenta.insertId;
        console.log('Venta insertada con ID:', idVenta);

        // 2. Insertar los detalles de la venta
        const insertDetalle = 'INSERT INTO detalle_venta (id_venta, id_formato_producto, cantidad, precio_unitario) VALUES ?';
        const detalleValues = productos.map(p => [idVenta, p.id_formato, p.cantidad, p.precio]);

        connection.query(insertDetalle, [detalleValues], (err) => {
          if (err) {
            console.error('Error al insertar detalle de venta:', err);
            return rollback(connection, res, 'Error al insertar detalle', err);
          }
          console.log('Detalles de venta insertados:', detalleValues);

          // 3. Descontar stock de cada producto
          const updates = productos.map(p => {
            return new Promise((resolve, reject) => {
              const updateStock = `
                UPDATE formato_producto
                SET cantidad = cantidad - ?
                WHERE id = ? AND cantidad >= ?`;
              connection.query(updateStock, [p.cantidad, p.id_formato, p.cantidad], (err, result) => {
                if (err) {
                  console.error('Error al actualizar stock para formato:', p.id_formato, err);
                  return reject(err);
                }
                if (result.affectedRows === 0) {
                  console.error('Stock insuficiente para el producto', p.id_formato);
                  return reject(new Error('Stock insuficiente para el producto ' + p.id_formato));
                }
                console.log('Stock actualizado para formato:', p.id_formato);
                resolve();
              });
            });
          });

          Promise.all(updates)
            .then(() => {
              connection.commit(err => {
                if (err) {
                  console.error('Error al confirmar la transacción:', err);
                  return rollback(connection, res, 'Error al confirmar', err);
                }
                connection.release();
                console.log('Transacción confirmada. Consultando productos con stock bajo...');

                // 4. Consultar SOLO los productos comprados que quedaron bajo stock y notificar
                const idsFormatos = productos.map(p => p.id_formato);
                if (idsFormatos.length === 0) {
                  return res.status(201).json({ mensaje: 'Venta registrada', id_venta: idVenta });
                }
                const queryStockBajo = `
                  SELECT fp.id, p.producto AS nombre, fp.cantidad, fp.formato, fp.codigo_barra, fp.precio, fp.stock_min
                  FROM formato_producto fp
                  INNER JOIN producto p ON fp.producto_id = p.id
                  WHERE fp.id IN (${idsFormatos.map(() => '?').join(',')}) AND fp.cantidad < fp.stock_min
                `;
                db.query(queryStockBajo,idsFormatos, (err, productosBajoStock) => {
                  if (err) {
                    console.error('Error al consultar productos con stock bajo:', err);
                  } else if (productosBajoStock.length > 0) {
                    console.log('Productos con stock bajo encontrados:', productosBajoStock);
                    notificarStockBajo(productosBajoStock);
                  } else {
                    console.log('No hay productos con stock bajo.');
                  }
                  res.status(201).json({ mensaje: 'Venta registrada', id_venta: idVenta });
                });
              });
            })
            .catch(err => {
              console.error('Error al actualizar stock:', err);
              rollback(connection, res, 'Error al actualizar stock', err);
            });
        });
        });
    });
  });
});


// Endpoint para guardar el token de FCM
app.post('/api/post/fcm_token', (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Falta el token' });
  }
  const query = 'INSERT IGNORE INTO fcm_tokens (token) VALUES (?)';
  db.query(query, [token], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error al guardar el token', details: err });
    }
    res.json({ success: true, message: 'Token guardado' });
  });
});

// Endpoint para obtener productos con stock bajo
app.get('/api/get/productos_stock_bajo', (req, res) => {
  const query = 'SELECT * FROM productos WHERE stock < stock_min';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error al consultar productos', details: err });
    }
    res.json(results);
  });
});


// Endpoint para recibir logs desde la app
app.post('/api/log', express.json(), (req, res) => {
  // const { log } = req.body;
  // console.log('Log recibido desde la app:', log);
  res.json({ status: 'ok' });
});

// Endpoint para obtener todas las ventas con sus detalles
app.get('/api/get/ventas_con_detalles', (req, res) => {
  const { fecha_inicio, fecha_fin, filtro_producto } = req.query;

  let query = `
    SELECT 
      v.id AS id_venta,
      v.fecha,
      v.total,
      dv.id AS id_detalle,
      dv.id_formato_producto,
      dv.cantidad AS cantidad_vendida,
      dv.precio_unitario,
      fp.formato,
      fp.codigo_barra,
      fp.precio AS precio_formato,
      fp.stock_min,
      p.producto AS nombre_producto,
      p.marca
    FROM venta v
    LEFT JOIN detalle_venta dv ON v.id = dv.id_venta
    LEFT JOIN formato_producto fp ON dv.id_formato_producto = fp.id
    LEFT JOIN producto p ON fp.producto_id = p.id
  `;
  const where = [];
  const params = [];

  if (fecha_inicio && fecha_inicio !== '') {
    where.push('DATE(v.fecha) >= ?');
    params.push(fecha_inicio);
  }
  if (fecha_fin && fecha_fin !== '') {
    where.push('DATE(v.fecha) <= ?');
    params.push(fecha_fin);
  }
  if (filtro_producto && filtro_producto !== '') {
    where.push('LOWER(p.producto) LIKE ?');
    params.push(`%${filtro_producto.toLowerCase()}%`);
  } 

  if (where.length) {
    query += ' WHERE ' + where.join(' AND ');
  }

  query += ' ORDER BY v.fecha DESC, v.id DESC, dv.id ASC';

  // Consulta para los totales
  let resumenQuery = `
    SELECT 
      COUNT(DISTINCT v.id) AS total_boletas,
      SUM(dv.cantidad) AS total_productos,
      SUM(v.total) AS total_ventas
    FROM venta v
    LEFT JOIN detalle_venta dv ON v.id = dv.id_venta
    LEFT JOIN formato_producto fp ON dv.id_formato_producto = fp.id
    LEFT JOIN producto p ON fp.producto_id = p.id
  `;
  if (where.length) {
    resumenQuery += ' WHERE ' + where.join(' AND ');
  }

  // Ejecutar ambas consultas
  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error al obtener ventas y detalles:', err);
      return res.status(500).json({ error: 'Error al obtener ventas y detalles', details: err });
    }

    db.query(resumenQuery, params, (err, resumenResults) => {
      if (err) {
        console.error('Error al obtener resumen:', err);
        return res.status(500).json({ error: 'Error al obtener resumen', details: err });
      }

      // Procesar resultados para agrupar detalles por venta
      const ventas = [];
      const ventasMap = {};

      results.forEach(row => {
        if (!ventasMap[row.id_venta]) {
          ventasMap[row.id_venta] = {
            id_venta: row.id_venta,
            fecha: row.fecha,
            total: row.total,
            detalle: []
          };
          ventas.push(ventasMap[row.id_venta]);
        }
        if (row.id_detalle) {
          ventasMap[row.id_venta].detalle.push({
            id_formato_producto: row.id_formato_producto,
            cantidad_vendida: row.cantidad_vendida,
            precio_unitario: row.precio_unitario,
            formato: row.formato,
            precio_formato: row.precio_formato,
            stock_min: row.stock_min,
            nombre_producto: row.nombre_producto,
            marca: row.marca
          });
        }
      });

      // Resumen
      const resumen = resumenResults[0] || { total_boletas: 0, total_productos: 0, total_ventas: 0 };

      res.json({ 
        success: true, 
        ventas,
        resumen
      });
    });
  });
});

// Endpoint para obtener todos los productos con la cantidad de 
app.get('/api/get/productos_mas_vendidos', (req, res) => {
  const { fecha_inicio, fecha_fin, filtro_producto } = req.query;

  let query = `
    SELECT
      p.producto AS nombre_producto,
      p.marca,
      fp.formato,
      fp.codigo_barra,
      SUM(dv.cantidad) AS cantidad_total_vendida,
      dv.precio_unitario,
      SUM(dv.cantidad * dv.precio_unitario) AS total_ventas
    FROM venta v
    LEFT JOIN detalle_venta dv ON v.id = dv.id_venta
    LEFT JOIN formato_producto fp ON dv.id_formato_producto = fp.id
    LEFT JOIN producto p ON fp.producto_id = p.id
  `;

  const where = [];
  const params = [];

  if (fecha_inicio && fecha_inicio !== '') {
    where.push('DATE(v.fecha) >= ?');
    params.push(fecha_inicio);
  }
  if (fecha_fin && fecha_fin !== '') {
    where.push('DATE(v.fecha) <= ?');
    params.push(fecha_fin);
  }

  if (filtro_producto && filtro_producto !== '') {
    where.push('LOWER(p.producto) LIKE ?');
    params.push(`%${filtro_producto.toLowerCase()}%`);
  }

  if (where.length) {
    query += ' WHERE ' + where.join(' AND ');
  }

  query += `
    GROUP BY p.id, fp.id, dv.precio_unitario
    ORDER BY total_ventas DESC
  `;

  // Consulta de resumen
  let resumenQuery = `
    SELECT 
      COUNT(DISTINCT v.id) AS total_boletas,
      SUM(dv.cantidad) AS total_productos,
      SUM(v.total) AS total_ventas
    FROM venta v
    LEFT JOIN detalle_venta dv ON v.id = dv.id_venta
    LEFT JOIN formato_producto fp ON dv.id_formato_producto = fp.id
    LEFT JOIN producto p ON fp.producto_id = p.id
  `;
  if (where.length) {
    resumenQuery += ' WHERE ' + where.join(' AND ');
  }

  db.query(query, params, (err, productos) => {
    if (err) {
      console.error('Error al obtener productos más vendidos:', err);
      return res.status(500).json({ error: 'Error al obtener productos más vendidos', details: err });
    }
    db.query(resumenQuery, params, (err, resumenResults) => {
      if (err) {
        console.error('Error al obtener resumen:', err);
        return res.status(500).json({ error: 'Error al obtener resumen', details: err });
      }
      const resumen = resumenResults[0] || { total_productos: 0, total_ventas: 0 };
      res.json({
        success: true,
        productos,
        resumen
      });
    });
  });
});

//endpoint para mostrar las ultimas 3 boletas

app.get('/api/ultimas_boletas', (req, res) => {
  const query = `
    SELECT 
      v.id AS boleta_id,
      v.fecha,
      v.total,
      p.producto,
      dv.cantidad
    FROM venta v
    INNER JOIN detalle_venta dv ON v.id = dv.id_venta
    INNER JOIN formato_producto fp ON dv.id_formato_producto = fp.id
    INNER JOIN producto p ON fp.producto_id = p.id
    WHERE DATE(v.fecha) = CURDATE()
    ORDER BY v.fecha DESC, v.id DESC
    LIMIT 3
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al consultar boletas:', err);
      return res.status(500).json({ error: 'Error al obtener boletas', details: err });
    }

    // Agrupar productos por boleta
    const boletasMap = {};
    results.forEach(row => {
      if (!boletasMap[row.boleta_id]) {
        boletasMap[row.boleta_id] = {
          id: row.boleta_id,
          fecha: row.fecha,
          total: row.total,
          productos: []
        };
      }
      boletasMap[row.boleta_id].productos.push({
        nombre: row.producto,
        cantidad: row.cantidad
      });
    });

    // Tomar las últimas 3 boletas
    const ultimas3 = Object.values(boletasMap).slice(0, 3);

    res.json({ boletas: ultimas3 });
  });
});

//obtener el total de las ventas del dia actual

app.get('/api/ventas_total_hoy', (req, res) => {
  const query = `
    SELECT IFNULL(SUM(total), 0) AS total_ventas
    FROM venta
    WHERE DATE(fecha) = CURDATE()
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener total de ventas de hoy:', err);
      return res.status(500).json({ error: 'Error al consultar total de ventas', details: err });
    }

    const total = results[0].total_ventas;
    res.json({ total });
  });
});

//sumar la cantidad de las boletas del dia actual
app.get('/api/cantidad_productos_vendidos_hoy', (req, res) => {
  const query = `
    SELECT IFNULL(SUM(dv.cantidad), 0) AS total_productos
    FROM detalle_venta dv
    INNER JOIN venta v ON dv.id_venta = v.id
    WHERE DATE(v.fecha) = CURDATE()
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener cantidad de productos vendidos hoy:', err);
      return res.status(500).json({ error: 'Error al consultar cantidad de productos vendidos', details: err });
    }

    const total = results[0].total_productos;
    res.json({ total });
  });
});


//endpoint para mostrar los productos mas vendido en los ultimo 7 dias 
app.get('/api/productos_mas_vendidos_7dias', (req, res) => {
  const query = `
    SELECT 
      p.producto AS nombre,
      SUM(dv.cantidad) AS total_vendido
    FROM detalle_venta dv
    INNER JOIN venta v ON dv.id_venta = v.id
    INNER JOIN formato_producto fp ON dv.id_formato_producto = fp.id
    INNER JOIN producto p ON fp.producto_id = p.id
    WHERE DATE(v.fecha) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    GROUP BY p.id, p.producto
    ORDER BY total_vendido DESC
    LIMIT 5
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener productos más vendidos en 7 días:', err);
      return res.status(500).json({ error: 'Error al consultar productos más vendidos', details: err });
    }
    const productos = results.map(row => ({
      nombre: row.nombre,
      total_vendido: row.total_vendido
    }));
    res.json({ productos });
  });
});


//endpoint para mostrar los productos menos vendido en los ultimo 7 dias 
app.get('/api/productos_menos_vendidos_7dias', (req, res) => {
  const query = `
    SELECT 
      p.producto AS nombre,
      SUM(dv.cantidad) AS total_vendido
    FROM detalle_venta dv
    INNER JOIN venta v ON dv.id_venta = v.id
    INNER JOIN formato_producto fp ON dv.id_formato_producto = fp.id
    INNER JOIN producto p ON fp.producto_id = p.id
    WHERE DATE(v.fecha) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    GROUP BY p.id, p.producto
    ORDER BY total_vendido ASC
    LIMIT 5
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener productos más vendidos en 7 días:', err);
      return res.status(500).json({ error: 'Error al consultar productos más vendidos', details: err });
    }
    const productos = results.map(row => ({
      nombre: row.nombre,
      total_vendido: row.total_vendido
    }));
    res.json({ productos });
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
