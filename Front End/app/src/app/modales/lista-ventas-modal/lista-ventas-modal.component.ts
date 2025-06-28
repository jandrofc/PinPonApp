import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular'; // Import IonicModule for Ionic components
import { closeOutline, receipt, cube, logoUsd, timeOutline, pricetagOutline,
calendarOutline, searchOutline  } from 'ionicons/icons'; // Import the close icon
import { OutputsEmergentesService } from '../../services/outputs-emergentes/outputs-emergentes.service';
import { addIcons,  } from 'ionicons';
import { FormsModule } from '@angular/forms';

import { BehaviorSubject, type Observable } from 'rxjs';
import { ConexionBackendService } from 'src/app/services/conexion-backend.service';
import { error } from 'console';

import {  boleta, Resumen, productosResumen } from "src/app/modelos/ventas.interfaces"




@Component({
  selector: 'app-lista-ventas-modal',
  templateUrl: './lista-ventas-modal.component.html',
  styleUrls: ['./lista-ventas-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class ListaVentasModalComponent  implements OnInit {
  constructor(
    private readonly OutPuts_Emergentes: OutputsEmergentesService,
    private readonly conexionBackend: ConexionBackendService
  ) {
    addIcons({
      'close-circle': closeOutline,
      'cash-outline': logoUsd,
      'receipt': receipt,
      'package': cube,
      'time-outline': timeOutline,
      'pricetag-outline': pricetagOutline,
      'lupa': searchOutline,
      'calendario': calendarOutline
    });
   }



  

  // FILTROS
  maxDate = new Date().toISOString().split('T')[0]; // formato 'YYYY-MM-DD'
  startDate: string = '';
  endDate: string = '';
  searchProduct = '';
  showDateModal = false;
  tempStartDate: string = '';
  tempEndDate: string = '';

  // indica el estado de la vista de las ventas, receipts / products
  activeTab: string = 'receipts'; // Pestaña activa por defecto



  public switchTab(tabName: string): void {
    this.activeTab = tabName;
    this.errorMessage = null;
    // Cargar datos según la pestaña activa
    if (tabName === 'receipts') {
      this.loadReceiptsData();
    } else if (tabName === 'products') {
      this.loadProductsData();
    }
  }



  // Indica la boleta que se secciono
  selectedReceipt: string | null = null

  


  // Obtiene la informacion de las boletas como productos
  salesData: boleta[] | null = null
  resumen: Resumen | null = null

  products: productosResumen[] | null = null; // Array para almacenar los productos
  
  
  
  loading: boolean = true; // Indicador de carga
  errorMessage: string | null = null; // Propiedad para almacenar mensajes de error

  

  ngOnInit() {
    this.loadReceiptsData(); // Cargar datos iniciales
  }

  public async closeModal(): Promise<void> {
      this.OutPuts_Emergentes.dismissModal({
        
      });
    }

  // Método para inicializar tempStartDate y tempEndDate cuando se abre el modal
  public openDateModal(): void {
    this.tempStartDate = this.startDate;
    this.tempEndDate = this.endDate;
    this.showDateModal = true;
  }

  // Métodos para rangos predefinidos
  setDateRange(range: string): void {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (range) {
      case 'today':
        // Hoy: desde el inicio del día hasta el final del día
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'yesterday':
        // Ayer: desde el inicio del día de ayer hasta el final del día de ayer
        start.setDate(today.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(today.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        // Esta semana: desde el lunes de esta semana hasta hoy
        start = new Date(today.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1))); // Lunes de esta semana
        start.setHours(0, 0, 0, 0);
        end = new Date(); // Hoy
        end.setHours(23, 59, 59, 999);
        break;
      case 'month':
        // Este mes: desde el primer día de este mes hasta hoy
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        start.setHours(0, 0, 0, 0);
        end = new Date(); // Hoy
        end.setHours(23, 59, 59, 999);
        break;
      case 'lastMonth':
        // Mes pasado: desde el primer día del mes pasado hasta el último día del mes pasado
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        start.setHours(0, 0, 0, 0);
        end = new Date(today.getFullYear(), today.getMonth(), 0); // Último día del mes pasado
        end.setHours(23, 59, 59, 999);
        break;
      default:
        // Si no se reconoce el rango, no se aplica ningún filtro
        this.tempStartDate = '';
        this.tempEndDate = '';
        return;
    }

    this.tempStartDate = start.toISOString().split('T')[0];
    this.tempEndDate = end.toISOString().split('T')[0];
  }

  // Método para aplicar el rango de fechas seleccionado
  applyDateRange(): void {
    this.startDate = this.tempStartDate.split('T')[0];;
    this.endDate = this.tempEndDate.split('T')[0];;
    this.applyFilters();
    this.showDateModal = false; // Cerrar el modal después de aplicar
  }


  applyFilters(): void {
    if (this.activeTab === "receipts") {
      this.loadReceiptsData();
    } else if (this.activeTab === "products") {
      this.loadProductsData();
    }
  }

  clearFilters(): void {
    this.startDate = '';
    this.endDate = '';
    this.searchProduct = '';
    this.applyFilters();
  }

  clearDateFilter(): void {
    this.startDate = '';
    this.endDate = '';
    this.applyFilters();
  }

  clearProductFilter(): void {
    this.searchProduct = '';
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!(this.startDate || this.endDate || this.searchProduct);
  }


  onProductSearch(): void {
    this.applyFilters()
  }


  



  // Cargar datos de boletas
  private async loadReceiptsData(): Promise<void> {
    this.loading = true;
    
    this.conexionBackend.getBoletas(this.searchProduct, this.startDate, this.endDate)
    .subscribe({
      next: (data) =>{
        this.resumen= data.resumen;
        this.salesData = data.ventas
        this.loading = false;
        this.errorMessage = null; 
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Error al cargar las ventas: ' + (err.message || 'Error desconocido');
      }
    })
  }

  private async loadProductsData(): Promise<void>{
    this.loading = true;

    this.conexionBackend.getProductos(this.searchProduct, this.startDate, this.endDate)
    .subscribe({
      next: (data) =>{
        this.resumen= data.resumen;
        this.products= data.productos
        this.loading = false;
        this.errorMessage = null; 
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Error al cargar los productos: ' + (err.message || 'Error desconocido');
      }
    })
  }



  formatFecha(fecha: string): string {
  if (!fecha) return '';
  const d = new Date(fecha);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

  generateReceiptTitle(receipt: boleta): string {
  if (!receipt.detalle || receipt.detalle.length === 0) {
    return 'Sin productos';
  }

  if (receipt.detalle.length === 1) {
    return receipt.detalle[0].nombre_producto;
  }

  if (receipt.detalle.length === 2) {
    return `${receipt.detalle[0].nombre_producto}, ${receipt.detalle[1].nombre_producto}`;
  }

  // Más de 2 productos
  return `${receipt.detalle[0].nombre_producto}, ${receipt.detalle[1].nombre_producto}...`;
}

  toggleReceiptDetail(receiptId: string) {
    this.selectedReceipt = this.selectedReceipt === receiptId ? null : receiptId
  }







}
