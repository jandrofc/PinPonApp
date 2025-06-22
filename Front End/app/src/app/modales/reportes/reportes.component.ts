import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConexionBackendService } from 'src/app/services/conexion-backend.service';
import { FormsModule } from '@angular/forms';

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
  ) { }

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

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Stock');

    worksheet.addRow([]);

    // --- Título del reporte ---
    const tituloRow = worksheet.addRow(['', 'Reporte de Stock']);
    worksheet.mergeCells(`B${tituloRow.number}:L${tituloRow.number}`);
    tituloRow.font = { bold: true, size: 18 };
    tituloRow.alignment = { horizontal: 'center', vertical: 'middle' };

    // --- Subtítulo ---
    const subtituloRow = worksheet.addRow(['', 'Minimarket Pinpon']);
    worksheet.mergeCells(`B${subtituloRow.number}:L${subtituloRow.number}`);
    subtituloRow.font = { italic: true, size: 14 };
    subtituloRow.alignment = { horizontal: 'center', vertical: 'middle' };

    // --- Espacio antes de la tabla ---
    worksheet.addRow([]);

    const headers = ['id_formato', 'producto_id', 'nombre_producto', 'formato', 'marca', 'cantidad', 'precio', 'stock_min', 'codigo_barra', 'fecha_creacion', 'fecha_actualizado'];
    const headerNames = ['ID Formato', 'ID Producto', 'Producto', 'Formato', 'Marca', 'Cantidad', 'Precio', 'Stock Minimo', 'Codigo de Barra', 'Fecha de Creacion', 'Fecha de Actualizacion'];

    // --- Encabezados con estilos ---
    const headerRow = worksheet.addRow(['', ...headerNames]);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.alignment = { horizontal: 'center' };
    headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (colNumber > 1) { // Solo aplica bordes a las columnas de la tabla
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '2c3182' }
        };
        cell.border = {
          top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}
        };
      }
      cell.alignment = { wrapText: true, horizontal: 'center', vertical: 'middle' };
    });

  // --- Datos ---
  datosFiltrados.forEach((dato, idx) => {
    const fila = headers.map(h => {
      if (h === 'fecha_creacion' || h === 'fecha_actualizado') {
        const fecha = dato[h];
        if (fecha) {
          const d = new Date(fecha);
          const dia = String(d.getDate()).padStart(2, '0');
          const mes = String(d.getMonth() + 1).padStart(2, '0');
          const anio = d.getFullYear();
          return `${dia}/${mes}/${anio}`;
        }
        return '';
      }
      return dato[h];
    });
    const row = worksheet.addRow(['', ...fila]);
    row.height = 25;

    // Intercala color de fondo
    const isEven = idx % 2 === 0;
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (colNumber > 1) { // Solo aplica estilos a las columnas de la tabla
        cell.border = {
          top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}
        };
        cell.fill = isEven
          ? { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F0FF' } } // azul claro
          : { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }; // blanco
      }
      cell.alignment = { wrapText: true, vertical: 'middle' };
    });
  });

    // --- Ajustar ancho de columnas ---
    worksheet.columns.forEach((column, idx) => {
      // Índices de columnas que quieres más pequeñas
      const columnasPequeñas = [1, 2, 6, 7, 8];
      if (columnasPequeñas.includes(idx)) {
        column.width = 10; // ancho pequeño
      } else {
        column.width = 16; // ancho normal
      }
    });

    // --- Guardar archivo ---
    const fecha = new Date();
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    const fechaStr = `${dia}-${mes}-${anio}`; // dd-mm-yyyy
    const nombreArchivo = `reporte_stock_${fechaStr}.xlsx`;
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), nombreArchivo);
    this.dismiss();
  }

}
