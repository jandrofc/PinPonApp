


// Crea un archivo Excel con las siguientes columnas:

// producto (nombre del producto)
// marca
// formato (ej: "Botella 1L")
// cantidad (stock inicial)
// codigo_barra (código único)
// precio (precio del producto)
// stock_min (stock mínimo, opcional)
// imagen_url (URL de imagen, opcional)
// npm install xlsx mysql2



const XLSX = require('xlsx');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
};

async function cargarProductosDesdeExcel(archivoExcel) {
  let connection;
  
  try {
    // Conectar a la base de datos
    connection = await mysql.createConnection(dbConfig);
    console.log('Conectado a la base de datos');

    // Leer el archivo Excel
    const workbook = XLSX.readFile(archivoExcel);
    const sheetName = workbook.SheetNames[0]; // Primera hoja
    const worksheet = workbook.Sheets[sheetName];
    
    // Convertir a JSON
    const datos = XLSX.utils.sheet_to_json(worksheet);
    console.log(`Se encontraron ${datos.length} filas en el Excel`);

    let productosCreados = 0;
    let formatosCreados = 0;
    let errores = 0;

    for (const fila of datos) {
      try {
        await connection.beginTransaction();

        // Extraer datos de la fila (ajusta los nombres según tu Excel)
        const {
          producto,
          marca,
          formato,
          cantidad = 0,
          codigo_barra,
          precio,
          stock_min = 5,
          imagen_url = null
        } = fila;

        // Validar datos obligatorios
        if (!producto || !marca || !formato || !codigo_barra || precio === undefined) {
          console.error(`Fila omitida por datos faltantes:`, fila);
          errores++;
          continue;
        }

        // Verificar si ya existe el código de barras
        const [existingProduct] = await connection.execute(
          'SELECT id FROM formato_producto WHERE codigo_barra = ?',
          [codigo_barra]
        );

        if (existingProduct.length > 0) {
          console.log(`Código de barras ${codigo_barra} ya existe, omitiendo...`);
          continue;
        }

        // Buscar o crear el producto
        let [productoExistente] = await connection.execute(
          'SELECT id FROM producto WHERE producto = ? AND marca = ?',
          [producto, marca]
        );

        let producto_id;

        if (productoExistente.length > 0) {
          producto_id = productoExistente[0].id;
          console.log(`Producto existente encontrado: ${producto} - ${marca} (ID: ${producto_id})`);
        } else {
          // Crear nuevo producto
          const [resultado] = await connection.execute(
            'INSERT INTO producto (producto, marca, habilitado) VALUES (?, ?, 1)',
            [producto, marca]
          );
          producto_id = resultado.insertId;
          productosCreados++;
          console.log(`Nuevo producto creado: ${producto} - ${marca} (ID: ${producto_id})`);
        }

        // Crear formato_producto
        await connection.execute(
          `INSERT INTO formato_producto 
           (producto_id, formato, cantidad, codigo_barra, precio, stock_min, imagen_url, habilitado) 
           VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
          [producto_id, formato, cantidad, codigo_barra, precio, stock_min, imagen_url]
        );
        
        formatosCreados++;
        console.log(`Formato creado: ${formato} - Código: ${codigo_barra}`);

        await connection.commit();

      } catch (error) {
        await connection.rollback();
        console.error(`Error procesando fila:`, fila, error.message);
        errores++;
      }
    }

    console.log('\n=== RESUMEN ===');
    console.log(`Productos nuevos creados: ${productosCreados}`);
    console.log(`Formatos creados: ${formatosCreados}`);
    console.log(`Errores: ${errores}`);

  } catch (error) {
    console.error('Error general:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Conexión cerrada');
    }
  }
}

// Función principal
async function main() {
  const archivoExcel = process.argv[2];
  
  if (!archivoExcel) {
    console.log('Uso: node cargar_productos_excel.js <ruta_archivo_excel>');
    console.log('Ejemplo: node cargar_productos_excel.js productos.xlsx');
    return;
  }

  console.log(`Cargando productos desde: ${archivoExcel}`);
  await cargarProductosDesdeExcel(archivoExcel);
}

// Ejecutar el script
main();
