import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular'; // Import IonicModule for Ionic components
import { closeOutline, receipt, cube, logoUsd, timeOutline, pricetagOutline } from 'ionicons/icons'; // Import the close icon
import { OutputsEmergentesService } from '../../services/outputs-emergentes/outputs-emergentes.service';
import { addIcons,  } from 'ionicons';


import { BehaviorSubject, type Observable } from 'rxjs';
export interface SaleItem {
  name: string
  price: number
  quantity: number
}

export interface Receipt {
  id: string
  customer: string
  date_time: string
  total: number
  items: SaleItem[]
  status: "completed" | "pending"
}

export interface SalesData {
  today: {
    total: number
    count: number
    receipts: Receipt[]
  }
}

export interface IndividualProduct {
  name: string
  price: number
  quantity: number
  customer: string
  time: string
  receiptId: string
}


@Component({
  selector: 'app-lista-ventas-modal',
  templateUrl: './lista-ventas-modal.component.html',
  styleUrls: ['./lista-ventas-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ListaVentasModalComponent  implements OnInit {



  private salesDataSubject = new BehaviorSubject<SalesData>({
    today: {
      total: 492.24,
      count: 3,
      receipts: [
        {
          id: "R001",
          customer: "María González",
          date_time: "10:30",
          total: 156.5,
          items: [
            { name: "Laptop HP", price: 120.0, quantity: 1 },
            { name: "Mouse Inalámbrico", price: 18.25, quantity: 2 },
          ],
          status: "completed",
        },
        {
          id: "R002",
          customer: "Carlos Ruiz",
          date_time: "14:15",
          total: 89.99,
          items: [{ name: "Teclado Mecánico", price: 89.99, quantity: 1 }],
          status: "completed",
        },
        {
          id: "R003",
          customer: "Ana Martínez",
          date_time: "16:45",
          total: 245.75,
          items: [
            { name: 'Monitor 24"', price: 199.99, quantity: 1 },
            { name: "Cable HDMI", price: 15.99, quantity: 1 },
            { name: "Soporte Monitor", price: 29.77, quantity: 1 },
          ],
          status: "pending",
        },
      ],
    },
  })

  selectedReceipt: string | null = null
  selectedSegment = "receipts"





  activeTab: string = 'receipts'; // Pestaña activa por defecto

  salesData: SalesData | null = null

  products: any[] = []; // Array para almacenar los productos
  loading: boolean = true; // Indicador de carga

  constructor(
    private readonly OutPuts_Emergentes: OutputsEmergentesService
  ) {
    addIcons({
      'close-outline': closeOutline,
      'cash-outline': logoUsd,
      'receipt': receipt,
      'package': cube,
      'time-outline': timeOutline,
      'pricetag-outline': pricetagOutline
    });
   }

  ngOnInit() {
    this.loadReceiptsData(); // Cargar datos iniciales
  }

  public async closeModal(): Promise<void> {
      this.OutPuts_Emergentes.dismissModal({
        
      });
    }


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



  // Cargar datos de boletas
  private loadReceiptsData(): void {
    console.log('Cargando datos de boletas...');
    this.loading = true;
    // Simulación de datos - reemplazar con servicio real
    setTimeout(() => {
      this.salesData = this.salesDataSubject.value;
      this.loading = false;
    }, 1000);
  }


  generateReceiptTitle(receipt: Receipt): string {
  if (!receipt.items || receipt.items.length === 0) {
    return 'Sin productos';
  }

  if (receipt.items.length === 1) {
    return receipt.items[0].name;
  }

  if (receipt.items.length === 2) {
    return `${receipt.items[0].name}, ${receipt.items[1].name}`;
  }

  // Más de 2 productos
  return `${receipt.items[0].name}, ${receipt.items[1].name}...`;
}



  toggleReceiptDetail(receiptId: string) {
    this.selectedReceipt = this.selectedReceipt === receiptId ? null : receiptId
  }



  // Cargar datos de productos
  private loadProductsData(): void {
    console.log('Cargando datos de productos...');
    this.loading = true;
    
    // Simulación de datos - reemplazar con servicio real
    setTimeout(() => {
      this.products = [
        {
          id: 1,
          name: 'Producto A',
          category: 'Electrónicos',
          sold: 25,
          revenue: 750.00,
          stock: 15
        },
        {
          id: 2,
          name: 'Producto B',
          category: 'Ropa',
          sold: 40,
          revenue: 1200.00,
          stock: 8
        }
      ];
      this.loading = false;
    }, 1000);
  }





}
