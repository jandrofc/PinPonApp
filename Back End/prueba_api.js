// URL de tu API (ajústala si tu puerto o ruta son diferentes)
const apiUrl = 'http://localhost/api/post/producto';

// Datos de ejemplo: si el producto no existe, creará ambos registros.
// Si el producto ya existe (mismo nombre y marca), solo insertará el formato.
const nuevoProducto = {
  producto: 'leche',
  marca: 'colun',
  formato: 'Paquete',
  cantidad: 20,
  codigo_barra: '1234567890145',
  precio: 1500
};

fetch('http://localhost:3000/api/post/producto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nuevoProducto)
  })
    .then(async response => {
      console.log('Status:', response.status);
      console.log('Content-Type:', response.headers.get('Content-Type'));
      const text = await response.text();
      console.log('Body:', text);
  
      // Sólo parsear si es JSON
      if (response.headers.get('Content-Type')?.includes('application/json')) {
        const data = JSON.parse(text);
        console.log('JSON:', data);
      } else {
        console.error('La respuesta no es JSON');
      }
    })
    .catch(err => {
      console.error('Error de red o al parsear:', err);
    });