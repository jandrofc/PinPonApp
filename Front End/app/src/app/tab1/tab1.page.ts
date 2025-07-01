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
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

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
  imagen_url: string;
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [    FormsModule, CommonModule,IonicModule],
})
export class Tab1Page implements OnInit, OnDestroy{
  configService: any;
  imagePreview: string | null = null;
  selectedImageUrl: string | null = null;
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
  imagen_url: '',
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

async guardarCambios() {
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

    let loading: HTMLIonLoadingElement | null = null;

    if (this.imagePreview) {
      try {
        loading = await this.outputsEmergentesService.showLoading({
          message: 'Subiendo imagen...'
        });

        await this.uploadImageToServer(this.imagePreview, this.productoSeleccionado.codigo);
        if (this.selectedImageUrl) {
          this.productoSeleccionado.imagen_url = this.selectedImageUrl;
        }

        if (loading) {
          await loading.dismiss();
          loading = null;
        }
      } catch (error) {
        console.error('Error subiendo imagen:', error);
        this.outputsEmergentesService.showErrorAlert({
          message: 'Error subiendo la imagen'
        });
        if (loading) {
          await loading.dismiss();
          loading = null;
        }

        this.outputsEmergentesService.showErrorAlert({
          message: 'Error subiendo la imagen'
        });
        return;
      }
    }

    // Mostrar loading para guardar cambios
    loading = await this.outputsEmergentesService.showLoading({
      message: 'Guardando cambios...'
    });

    // Llamamos al PUT
    this.apiService.putData('put/formato', this.productoSeleccionado)
      .subscribe({
        next: async (res: any) => {
          if (loading) {
            await loading.dismiss();
          }

          if (res.success) {
            const idx = this.productos.findIndex(p => p.id_formato === this.productoSeleccionado.id_formato);
            if (idx > -1) {
              this.productos[idx] = { ...this.productoSeleccionado };
              console.log(' Producto actualizado en lista local:', this.productos[idx]);
            }

            // RECARGAR productos desde servidor
            this.obtenerProductos();

            this.modoEdicion = false;
            this.imagePreview = null;
            this.selectedImageUrl = null;

            console.log(' Formato actualizado correctamente');
          } else {
            console.error('Error al actualizar formato:', res);
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

async selectImage() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt, // Permite elegir entre cámara y galería
        width: 800,
        height: 800
      });

      if (image.dataUrl) {
        this.imagePreview = image.dataUrl;
      }
    } catch (error) {
      this.outputsEmergentesService.showErrorAlert({
        message: 'Error al seleccionar la imagen'
      });
    }
  }

  removeImage() {
    this.imagePreview = null;
    this.selectedImageUrl = null;
    this.productoSeleccionado.imagen_url = '';
  }

  private async uploadImageToServer(base64Data: string, codigoProducto: string): Promise<void> {
    try {
      // Extraer solo la parte base64 (sin el prefijo data:image/...)
      const base64Image = base64Data.split(',')[1];
      const mimeType = base64Data.split(',')[0].split(':')[1].split(';')[0];

      // Convertir base64 a blob
      const response = await fetch(`data:${mimeType};base64,${base64Image}`);
      const blob = await response.blob();

      // Crear FormData
      const formData = new FormData();
      formData.append('imagen', blob, `${codigoProducto || Date.now()}.jpg`);
      formData.append('codigo_barra', codigoProducto || '');

      if (this.productoSeleccionado.imagen_url) {
        formData.append('imagen_anterior', this.productoSeleccionado.imagen_url);
      }

      // Subir al servidor
      const baseUrl = this.apiService.getIPFILE().replace('/api/', '');
      const fullUrl = `${baseUrl}/upload/imagen-producto`;

      const uploadResponse = await fetch(fullUrl, {
        method: 'POST',
        body: formData
      });

      if (uploadResponse.ok) {
        const result = await uploadResponse.json();
        this.selectedImageUrl = result.imageUrl;
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (error) {
      throw error;
    }
  }

  cancelarEdicion() {
    this.modoEdicion = false; // Cancela la edición y vuelve a la lista
    this.imagePreview = null; // Limpia la vista previa de la imagen
    this.selectedImageUrl = null; // Limpia la URL de la imagen seleccionada
    this.iniciarAutoRefresh(); // Reinicia el auto-refresh al cerrar el modal
  }

  getImageSrc(imagenUrl: string): string {

    if (!imagenUrl) return '';

    if (imagenUrl.startsWith('http')) return imagenUrl;

    // Construir URL directamente
    const baseUrl = this.apiService.getIPFILE().replace('/api/', '');
    const fullUrl = `${baseUrl}${imagenUrl}`;

    return fullUrl;
  }

  onImageError(event: any) {
    event.target.style.display = 'none';
  }

  async doRefresh(event: any) {
    try{
      await this.obtenerProductos();
      console.log('Productos refrescados correctamente');
    }
  catch (error) {
    console.error('Error al refrescar productos:', error);
  } finally {
      event.target.complete(); // Completa el evento de refresco
  }
  }
}
