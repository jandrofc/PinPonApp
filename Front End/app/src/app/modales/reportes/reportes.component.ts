import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
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

  producto?: string;

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

  generarExcel() {
    let datosFiltrados = this.stockData;
    if (this.producto) {
      datosFiltrados = datosFiltrados.filter(d => d.nombre_producto === this.producto!);
    }

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosFiltrados);
    const workbook: XLSX.WorkBook = { Sheets: { 'Stock': worksheet }, SheetNames: ['Stock'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(data, 'reporte_stock.xlsx');
    this.dismiss();
  }

}
