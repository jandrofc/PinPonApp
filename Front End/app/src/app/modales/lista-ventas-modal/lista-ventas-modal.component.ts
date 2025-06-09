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

import { VentaDetalleItem, boleta, Resumen, IndividualProduct, RespuestaAPI } from "src/app/modelos/ventas.interfaces"




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
      'close-outline': closeOutline,
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
  selectedDate = ''
  searchProduct = ''
  showDateModal = false;

  // indica el estado de la vista de las ventas, receipts / products
  activeTab: string = 'receipts'; // Pestaña activa por defecto



  public switchTab(tabName: string): void {
    this.activeTab = tabName;
    console.log(`Cambiando a la pestaña: ${tabName}`);

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

  products: any[] = []; // Array para almacenar los productos
  
  
  
  loading: boolean = true; // Indicador de carga

  

  ngOnInit() {
    this.loadReceiptsData(); // Cargar datos iniciales
  }

  public async closeModal(): Promise<void> {
      this.OutPuts_Emergentes.dismissModal({
        
      });
    }


  applyFilters(): void {
    if (this.activeTab === "receipts")
      this.loadReceiptsData()
    else if (this.activeTab === "products"){
      this.loadProductsData()
    }
  }

  clearFilters(): void {
    this.selectedDate = ""
    this.searchProduct = ""
    this.applyFilters()
  }

  clearDateFilter(): void {
    this.selectedDate = ""
    this.applyFilters()
  }

  clearProductFilter(): void {
    this.searchProduct = ""
    this.applyFilters()
  }

  hasActiveFilters(): boolean {
    return !!(this.selectedDate || this.searchProduct)
  }

  onDateChange(): void {
    this.selectedDate = this.selectedDate.split("T")[0];
    this.applyFilters()
  }

  onProductSearch(): void {
    this.applyFilters()
  }


  



  // Cargar datos de boletas
  private async loadReceiptsData(): Promise<void> {
    this.loading = true;
    
    this.conexionBackend.getBoletas(this.searchProduct,this.selectedDate)
    .subscribe({
      next: (data: RespuestaAPI) =>{
        this.resumen= data.resumen;
        this.salesData = data.ventas
        console.log(this.salesData)
        this.loading = false;
      },
      error: (err) => {
        throw new Error(err);
      }
    })
  }

  private async loadProductsData(): Promise<void>{
    this.loading = true;

    this.conexionBackend.getProductos(this.searchProduct,this.selectedDate)
    .subscribe({
      next: (data: RespuestaAPI) =>{
        this.resumen= data.resumen;
        this.salesData = data.ventas
        
        this.loading = false;
      },
      error: (err) => {
        throw new Error(err);
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



  // Cargar datos de productos
  // private loadProductsData(): void {
  //   console.log('Cargando datos de productos...');
  //   this.loading = true;
    
  //   // Simulación de datos - reemplazar con servicio real
  //   setTimeout(() => {
  //     this.products = [
  //       {
  //         id: 1,
  //         name: 'Producto A',
  //         category: 'Electrónicos',
  //         sold: 25,
  //         revenue: 750.00,
  //         stock: 15
  //       },
  //       {
  //         id: 2,
  //         name: 'Producto B',
  //         category: 'Ropa',
  //         sold: 40,
  //         revenue: 1200.00,
  //         stock: 8
  //       }
  //     ];
  //     this.loading = false;
  //   }, 1000);
  // }





}
