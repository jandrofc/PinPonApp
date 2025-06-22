import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';

import {
  NgxApexchartsModule,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexTitleSubtitle,
  ApexPlotOptions,
  ApexDataLabels,
  ApexStroke,
  ApexLegend
} from 'ngx-apexcharts';

import { ConexionBackendService } from '../../services/conexion-backend.service';
import { addIcons } from 'ionicons';
import { closeCircle } from 'ionicons/icons';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  legend: ApexLegend;
};

@Component({
  selector: 'app-graficos',
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    NgxApexchartsModule
  ],
  templateUrl: './graficos.component.html',
  styleUrls: ['./graficos.component.scss']
})
export class GraficosComponent implements OnInit {
  public chartOptions!: ChartOptions; // Usamos ! para inicializar después
  public MenosOptions!: ChartOptions;

    mostrarTop: boolean = true;
  mostrarMenos: boolean = false;
  constructor(
    private backend: ConexionBackendService,
    private modalController: ModalController
  ) {addIcons({
        "close-circle": closeCircle});}


  ngOnInit() {
    this.backend.getProductosMasVendidos7Dias().subscribe({
      next: res => {
        const nombres = res.productos.map(p => p.nombre);
        const cantidades = res.productos.map(p => p.total_vendido);

        // Reemplaza el objeto completo para forzar redibujo correcto
        this.chartOptions = {
          series: [{ name: 'Vendidos', data: cantidades }],
          chart: {
            type: 'bar',
            height: 350,
            toolbar: { show: false },
            zoom: { enabled: false }
          },
          plotOptions: { bar: { horizontal: false, columnWidth: '50%' } },
          dataLabels: { enabled: false },
          stroke: { show: true, width: 2 },
          title: { text: 'Productos más vendidos (7 días)' },
          xaxis: { categories: nombres },
          legend: { position: 'top' }
        };
      },
      error: err => console.error('Error en gráfico:', err)
    });

    this.backend.getProductosMenosVendidos7Dias().subscribe({
      next: res => {
        const nombresMenos = res.productos.map(p => p.nombre);
        const cantidadesMenos = res.productos.map(p => p.total_vendido);

        // Reemplaza el objeto completo para forzar redibujo correcto
        this.MenosOptions = {
          series: [{ name: 'Vendidos', data: cantidadesMenos }],
          chart: {
            type: 'bar',
            height: 350,
            toolbar: { show: false },
            zoom: { enabled: false }
          },
          plotOptions: { bar: { horizontal: false, columnWidth: '50%' } },
          dataLabels: { enabled: false },
          stroke: { show: true, width: 2 },
          title: { text: 'Productos menos vendidos (7 días)' },
          xaxis: { categories: nombresMenos },
          legend: { position: 'top' }
        };
      },
      error: err => console.error('Error en gráfico:', err)
    });
  }

  closeModal() {
    this.modalController.dismiss();
  }
}
