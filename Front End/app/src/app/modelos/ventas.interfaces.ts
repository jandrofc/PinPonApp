export interface VentaDetalleItem {
  id_detalle: number;
  id_formato_producto: number;
  cantidad_vendida: number;
  precio_unitario: string; // Puede venir como string o número
  formato: string;
  codigo_barra: string;
  precio_formato: number;
  stock_min: number;
  nombre_producto: string;
  marca: string;
}

export interface boleta {
  id_venta: string
  fecha: string
  total: number
  detalle: VentaDetalleItem[]
}


export interface Resumen {
  total_boletas: number
  total_productos: number
  total_ventas: number
}


export interface IndividualProduct {
  name: string
  price: number
  quantity: number
  customer: string
  time: string
  boletaId: string
}

export interface RespuestaAPI{
  success: true
  resumen: Resumen
  ventas: boleta[]
}
