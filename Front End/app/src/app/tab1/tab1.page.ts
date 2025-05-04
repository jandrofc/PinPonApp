import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';



import { ConexionBackendService} from 'src/app/services/conexion-backend.service';

export interface Producto {
  id:  number;
  producto_id: number;
  nombre_producto: string;
  formato: string;
  marca: string;
  cantidad: string;
  precio: string;
  codigo: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
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

  modoEdicion: boolean = false;
  productos: Producto[] = [];
  productoSeleccionado: Producto = {
  id: 0,
  producto_id: 0,
  nombre_producto: '',
  formato: '',
  marca: '',
  cantidad: '',
  precio: '',
  codigo: '',
  fecha_creacion: '',
  fecha_actualizacion: '',
  imagen: '',
};
  searchQuery: string = '';

  obtenerProductos() : void {
    // Llamar al servicio para obtener los productos
    this.apiService.getListaProducto('get/lista_productos','desc').subscribe(
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

  get filteredProducts() {
    return this.productos.filter(producto =>
      producto.nombre_producto.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  activarEdicion(producto: Producto) {
    this.productoSeleccionado = { ...producto }; // Clonar el producto para evitar modificarlo directamente
    this.modoEdicion = true; // Activa el modo de edición
  }

  guardarCambios() {
    if (this.productoSeleccionado) {
      const index = this.productos.findIndex((p) => p.id === this.productoSeleccionado?.id);
      if (index !== -1) {
        this.productos[index] = { ...this.productoSeleccionado }; // Actualizar el producto en la lista
      }
    }
    this.modoEdicion = false; // Vuelve a la lista de productos
    console.log('Cambios guardados:', this.productos);
  }

  cancelarEdicion() {
    this.modoEdicion = false; // Cancela la edición y vuelve a la lista
  }
}

