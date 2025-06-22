import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import * as XLSX from 'xlsx';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConexionBackendService } from 'src/app/services/conexion-backend.service';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { closeCircle } from 'ionicons/icons';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule,
    FormsModule,
    IonicModule
  ]
})
export class ReportesComponent  implements OnInit {
  productos: string[] = [];
  stockData: any[] = [];

  producto: string[] = [];

  constructor(private modalCtrl: ModalController,
              private conexionBackend: ConexionBackendService,
              private cdr: ChangeDetectorRef
  ) {addIcons({
          "close-circle": closeCircle});}

  ngOnInit() {
    this.conexionBackend.getListaProducto('get/lista_productos').subscribe({
      next: (res: any) => {
        console.log('Respuesta productos:', res);
        this.stockData = res.productos;
        this.productos = [...new Set(this.stockData.map((p: any) => p.nombre_producto))];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error obteniendo productos:', err);
      }
    });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  async generarExcel() {
    let datosFiltrados = this.stockData;
    if (this.producto && this.producto.length > 0) {
      datosFiltrados = datosFiltrados.filter(d => this.producto.includes(d.nombre_producto));
    }

    // Prepara los datos para la hoja de Excel
    const headers = ['ID Formato', 'ID Producto', 'Producto', 'Formato', 'Marca', 'Cantidad', 'Precio', 'Stock Minimo', 'Codigo de Barra', 'Fecha de Creacion', 'Fecha de Actualizacion'];
    const datosParaExcel = datosFiltrados.map(dato => ({
      'ID Formato': dato.id_formato,
      'ID Producto': dato.producto_id,
      'Producto': dato.nombre_producto,
      'Formato': dato.formato,
      'Marca': dato.marca,
      'Cantidad': dato.cantidad,
      'Precio': dato.precio,
      'Stock Minimo': dato.stock_min,
      'Codigo de Barra': dato.codigo_barra,
      'Fecha de Creacion': dato.fecha_creacion,
      'Fecha de Actualizacion': dato.fecha_actualizado
    }));

    // Agrega título y subtítulo como filas extras
    const wsData = [
      [],
      ['Reporte de Stock'],
      ['Minimarket Pinpon'],
      [],
      headers,
      ...datosParaExcel.map(obj => headers.map(h => (obj as Record<string, any>)[h]))
    ];

    // Crea la hoja y el libro
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(wsData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stock');

    // Genera el archivo como base64
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });

    // Nombre del archivo
    const fecha = new Date();
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    const fechaStr = `${dia}-${mes}-${anio}`;
    const nombreArchivo = `reporte_stock_${fechaStr}.xlsx`;

    // Guarda el archivo en el dispositivo
    await Filesystem.writeFile({
      path: nombreArchivo,
      data: wbout,
      directory: Directory.Documents,
    });

    this.dismiss();
  }

  async generarPDF() {
    let datosFiltrados = this.stockData;
    if (this.producto && this.producto.length > 0) {
      datosFiltrados = datosFiltrados.filter(d => this.producto.includes(d.nombre_producto));
    }

    const headers = ['ID Formato', 'ID Producto', 'Producto', 'Formato', 'Marca', 'Cantidad', 'Precio', 'Stock Minimo', 'Codigo de Barra', 'Fecha de Creacion', 'Fecha de Actualizacion'];
    const datosParaPDF = datosFiltrados.map(dato => [
      dato.id_formato,
      dato.producto_id,
      dato.nombre_producto,
      dato.formato,
      dato.marca,
      dato.cantidad,
      dato.precio,
      dato.stock_min,
      dato.codigo_barra,
      dato.fecha_creacion,
      dato.fecha_actualizado
    ]);

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Reporte de Stock', 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Minimarket Pinpon', 105, 23, { align: 'center' });

    autoTable(doc, {
      head: [headers],
      body: datosParaPDF,
      startY: 30,
      styles: { fontSize: 8 }
    });

    const fecha = new Date();
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    const fechaStr = `${dia}-${mes}-${anio}`;
    const nombreArchivo = `reporte_stock_${fechaStr}.pdf`;

    // Guardar el PDF en el dispositivo usando Capacitor Filesystem
    const pdfOutput = doc.output('arraybuffer');
    const base64Pdf = this.arrayBufferToBase64(pdfOutput);

    await Filesystem.writeFile({
      path: nombreArchivo,
      data: base64Pdf,
      directory: Directory.Documents,
    });

    this.dismiss();
  }

  // Utilidad para convertir ArrayBuffer a base64
  arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

}
