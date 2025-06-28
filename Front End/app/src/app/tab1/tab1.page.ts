import { Component, CUSTOM_ELEMENTS_SCHEMA, OnDestroy, OnInit} from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router'; //navegacion entre paginas

import { ModalController } from '@ionic/angular';
import { Ipv4Component } from '../modales/ipv4/ipv4.component';
import { addIcons  } from 'ionicons';
import { settings} from 'ionicons/icons'
import { ConexionBackendService} from 'src/app/services/conexion-backend.service';
import { IonicModule } from '@ionic/angular';

import { OutputsEmergentesService } from '../services/outputs-emergentes/outputs-emergentes.service';
import { HTMLIonOverlayElement } from '@ionic/core';

export interface Producto {
  id_formato:  number;
  producto_id: number;
  nombre_producto: string;
  formato: string;
  marca: string;
  cantidad: string;
  precio: string;
  stock_min: string;
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
export class Tab1Page implements OnInit, OnDestroy{
  constructor(
    private apiService: ConexionBackendService,
    private router: Router,
    private params: ActivatedRoute,
    private readonly outputsEmergentesService: OutputsEmergentesService,
    private modalController: ModalController,
  ){addIcons({
        'settings': settings,
      });}
    
  async ngOnDestroy() {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
      console.log('Auto-refresh detenido');
    }  
  }


  async ionViewDidEnter(){
    this.CargarDatos();
    this.iniciarAutoRefresh(); // Inicia el auto-refresh al cargar la página
  }

  async ionViewWillLeave() {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
      console.log('Auto-refresh detenido al salir de la página');
    }
  }

  async ngOnInit() {
    // ngOnInit puede quedar vacío ya que la lógica de carga y auto-refresh se mueve a ionViewDidEnter
  }
  private autoRefreshInterval: any;
  private REFRESH_INTERVAL = 30000 // 1 minuto
  private intentos_error = 0; // Contador de intentos de error


async ipv4_modal(){
  if (this.autoRefreshInterval) {
    clearInterval(this.autoRefreshInterval);
    console.log('Auto-refresh detenido por apertura de modal');
  }
  const modal = await this.modalController.create({
        component: Ipv4Component
      });
  await modal.present();
  await modal.onDidDismiss(); // Espera a que el modal se cierre
  this.iniciarAutoRefresh(); // Reinicia el auto-refresh al cerrar el modal
}


  iniciarAutoRefresh(): void {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
    }
    if (this.intentos_error > 8) {
      return;
    }
    this.autoRefreshInterval = setInterval(() => {
      // adjust selector to fit your needs
      const overlays = document.querySelectorAll('ion-alert');
      const overlaysArr = Array.from(overlays) as HTMLIonOverlayElement[];
      overlaysArr.forEach(o => o.dismiss());

      console.log(`Auto-refresh iniciado cada ${this.REFRESH_INTERVAL / 1000} segundos`);
      this.obtenerProductos(); // Llama al método para obtener productos
    }, this.REFRESH_INTERVAL);

    
  }



  async CargarDatos(): Promise<void> {
    const loading = await this.outputsEmergentesService.showLoading({
      message: 'Cargando productos...',
    });
    this.obtenerProductos()
    loading.dismiss(); // Cierra el loading una vez que se cargan los productos
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
  stock_min: '',
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
          this.REFRESH_INTERVAL = 30000
        }
      },
      (error: any) => {
        this.intentos_error++;
        this.REFRESH_INTERVAL = 30000 + this.REFRESH_INTERVAL; // Si hay error, reduce el intervalo a 10 segundos
        throw error;
      }
      );
  }

  get filteredProducts() {
    return this.productos
      .filter(producto =>
        producto.nombre_producto.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        producto.marca.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        producto.formato.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
      .sort((a, b) => a.nombre_producto.localeCompare(b.nombre_producto));
  }

  private limpiarRecursos() {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
      console.log('Auto-refresh detenido manualmente');
    }
  }
  escanear_Productos_Nuevos(){
    this.limpiarRecursos()
    this.router.navigate(['/registro-producto']);
  }

  activarEdicion(producto: Producto) {
    this.productoSeleccionado = { ...producto }; // Clonar el producto para evitar modificarlo directamente
    this.modoEdicion = true; // Activa el modo de edición
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
    }
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
    this.iniciarAutoRefresh(); // Reinicia el auto-refresh al cerrar el modal
  }
}
