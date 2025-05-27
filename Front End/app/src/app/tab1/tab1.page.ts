import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router'; //navegacion entre paginas


import { ConexionBackendService} from 'src/app/services/conexion-backend.service';
import { IonicModule } from '@ionic/angular';

export interface Producto {
  id_formato:  number;
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
  imports: [    FormsModule, CommonModule,IonicModule],
})
export class Tab1Page implements OnInit{
  constructor(
    private apiService: ConexionBackendService,
    private router: Router,
    private params: ActivatedRoute) {}




  ngOnInit() {
    this.obtenerProductos();
  }


    // DEBUG
    apiUrl: string = this.apiService.getIPFILE();
    response: any;



  modoEdicion: boolean = false;
  productos: Producto[] = [];

  productoSeleccionado: Producto = {
  id_formato: 0,
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




  mostrarError(): string {
  return JSON.stringify(this.response, null, 2); // Convierte el objeto a JSON con formato
  }




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
        this.response = error;
        console.error('Error al obtener productos:', error);
      }
    );
  }

  get filteredProducts() {
    return this.productos.filter(producto =>
      producto.nombre_producto.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }
  escanear_Productos_Nuevos(){
    this.router.navigate(['/registro-producto']);
  }

  activarEdicion(producto: Producto) {
    this.productoSeleccionado = { ...producto }; // Clonar el producto para evitar modificarlo directamente
    this.modoEdicion = true; // Activa el modo de edición
  }

guardarCambios() {
    if (!this.productoSeleccionado) return;

    // Validación de datos antes de enviar al backend
    const p = this.productoSeleccionado;
    if (!p.id_formato) {
      alert('Falta el id_formato');
      return;
    }
    if (!p.producto_id) {
      alert('Falta el producto_id');
      return;
    }
    if (!p.nombre_producto || typeof p.nombre_producto !== 'string' || p.nombre_producto.trim() === '') {
      alert('Falta el nombre del producto o es inválido');
      return;
    }
    if (!p.formato || typeof p.formato !== 'string' || p.formato.trim() === '') {
      alert('Falta el formato o es inválido');
      return;
    }
    if (p.cantidad == null || isNaN(Number(p.cantidad)) || Number(p.cantidad) < 0) {
      alert('Cantidad inválida');
      return;
    }
    if (p.precio == null || isNaN(Number(p.precio)) || Number(p.precio) < 0) {
      alert('Precio inválido');
      return;
    }

    // Llamamos al PUT
    this.apiService.putData('put/formato', this.productoSeleccionado)
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            this.obtenerProductos();
            const idx = this.productos.findIndex(p => p.id_formato === this.productoSeleccionado.id_formato);
            if (idx > -1) this.productos[idx] = { ...this.productoSeleccionado };
            this.modoEdicion = false;
            alert('Cambios realizados con éxito'); // Mensaje de éxito
            console.log('Formato actualizado correctamente');
          }
        },
        error: err => {
          console.error('Error al actualizar formato:', err);
        }
      });
  }


  //metodo para deshabilitar un formato

  eliminarProducto(idFormato: number) {
    const ok = confirm('¿Seguro que quieres eliminar (deshabilitar) este producto?');
    if (!ok) {
      return;
    }

    this.apiService.deshabilitarFormato('patch/formato/',idFormato)
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            // Refresca la lista para ocultar el deshabilitado
            this.obtenerProductos();
            alert('Producto deshabilitado correctamente.');
          } else {
            alert('No se pudo deshabilitar el producto.');
          }
        },
        error: (err) => {
          console.error('Error al deshabilitar formato:', err);
          alert('Error al deshabilitar: ' + (err.error?.message || 'Error desconocido'));
        }
      });
  }




  cancelarEdicion() {
    this.modoEdicion = false; // Cancela la edición y vuelve a la lista
  }
}

