import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';



import { ConexionBackendService} from 'src/app/services/conexion-backend.service';

export interface Producto {
  nombre_producto: string;
  categoria: string;
  cantidad: string;
  precio: string;
  imagen: string;
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, FormsModule, CommonModule],
})
export class Tab1Page implements OnInit{
  constructor(private apiService: ConexionBackendService) {}


  ngOnInit() {
    this.obtenerProductos();
  }


  productos: Producto[] = [];

  obtenerProductos() : void {
    // Llamar al servicio para obtener los productos
    this.apiService.getListaProducto('get/lista_productos','todas', 'DESC').subscribe(
      (response: any) => {
        if (response.success) {
          this.productos = response.productos; // Asignar los productos a la variable
          console.log('Productos obtenidos:', this.productos);
        }
      },
      error => {
        console.error('Error al obtener productos:', error);
      }
    );
  }
  searchQuery: string = '';

  get filteredProducts() {
    return this.productos.filter(producto =>
      producto.nombre_producto.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

}

