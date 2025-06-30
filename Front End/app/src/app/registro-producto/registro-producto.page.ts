import { Component, NgZone ,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular'; // Importa IonicModule completo

// lo imrpotamos para poder subir imagenes para los productos
import { FilePicker } from '@capawesome/capacitor-file-picker';

// lo importamos para conocer si un dispotivo tiene la camara y obtener los valores del escaneo
import { BarcodeScanner, Barcode } from '@capacitor-mlkit/barcode-scanning';

// Importamos servicio para manejar el modal de la camara y quizas que otras cosas
import { OutputsEmergentesService } from '../services/outputs-emergentes/outputs-emergentes.service';

import { CameraScannerModalComponent } from '../modales/camera-scanner-modal/camera-scanner-modal.component';
import { camera, checkmarkSharp, closeCircle, createOutline, imageOutline,  } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { ModalController } from '@ionic/angular';
import { FormularioRegistroProductoModalComponent } from '../modales/formulario-registro-producto-modal/formulario-registro-producto-modal.component';

import { ConexionBackendService } from '../services/conexion-backend.service';


import { Router } from '@angular/router';



export interface ProductoEscaneado {
  codigo: string;
  nombre: string;
  marca: string;
  formato: string;
  cantidad: number | null;
  precio: number | null;
  stock_min: number | null;
  nuevo: boolean;
  existente: number;
  imagen_url?: string;
}

@Component({
  selector: 'app-registro-producto',
  templateUrl: './registro-producto.page.html',
  styleUrls: ['./registro-producto.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,

  ]

})
export class RegistroProductoPage implements OnInit {

  // Tiene el estado si barcode scanner es soportado
  public isSupported = false;
  // Tiene el estado si barcode scanner tiene permisos
  public isPermissionGranted = false;


  // Almacena los codigos de barras escaneados
  public productosEscaneados: ProductoEscaneado[] = [];

  // Almacena los codigos de barras escaneados para mostrar en la vista
  // debe borrarse, solo fue para pruebas
  public valoresEscaneados: string[] = [];
  configService: any;

  constructor(
    private outputsEmergentesService: OutputsEmergentesService,
    private modalController: ModalController,

    private conexionBackendService: ConexionBackendService,
    private router: Router


  ) { addIcons({ createOutline,
      closeCircle,
      camera,
      checkmarkSharp,
      imageOutline
   }) }


  async editarProducto(producto: any) {
    const modal = await this.modalController.create({
      component: FormularioRegistroProductoModalComponent,
      componentProps: { producto }
    });
    await modal.present();

    // manejar el resultado al cerrar el modal
    const { data } = await modal.onWillDismiss();
    if (data) {
      // Actualiza el producto en tu lista si es necesario
      const index = this.productosEscaneados.findIndex(p => p.codigo === data.codigo);
      if (index !== -1) {
        this.productosEscaneados[index] = data; // Actualiza el producto con los nuevos datos
        this.productosEscaneados = [...this.productosEscaneados]; // Forzar la actualización de la vista
      }
    }
  }

  async escanear_Productos() {
    const modal = await this.modalController.create({
      component: CameraScannerModalComponent,
      cssClass: 'barcode-scanning-modal',
      showBackdrop: false,
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    const codigo = data?.barcode?.rawValue;

    if (codigo && !this.productosEscaneados.some(p => p.codigo === codigo)) {
      // Consultar si el código existe en la base de datos
      this.conexionBackendService.obtenerProductoPorCodigo( codigo).subscribe({
        next: (resp) => {
          if (resp && resp.producto) {
            // Producto existente - usar los mismos nombres de campos que en el modal
            const producto = resp.producto;
            this.productosEscaneados.push({
              codigo,
              nombre: producto.nombre_producto,
              marca: producto.marca,
              formato: producto.formato,
              cantidad: 1,
              precio: producto.precio,
              stock_min: producto.stock_min ?? 5,
              nuevo: false,
              existente: producto.cantidad ?? 0
            });
          } else {
            // Producto no existe - es nuevo
            this.productosEscaneados.push({
              codigo,
              nombre: '',
              marca: '',
              formato: '',
              cantidad: 1,
              precio: null,
              stock_min: null,
              nuevo: true,
              existente: 0
            });
          }
        },
        error: (err) => {
          // Si hay error, agregarlo como nuevo
          this.productosEscaneados.push({
            codigo,
            nombre: '',
            marca: '',
            formato: '',
            cantidad: 1,
            precio: null,
            stock_min: null,
            nuevo: true,
            existente: 0
          });
        }
      });
    } else if (codigo && this.productosEscaneados.some(p => p.codigo === codigo)) {
      this.outputsEmergentesService.showErrorAlert({
        header: 'AVISO',
        message: 'El código ya fue escaneado',
        buttons: ['OK'],
      });
    }
  }

  public ngOnInit(): void {
    BarcodeScanner.isSupported().then((result) => {
      this.isSupported = result.supported;
    });
    BarcodeScanner.checkPermissions().then((result) => {
      this.isPermissionGranted = result.camera === 'granted';
    });
    BarcodeScanner.removeAllListeners().then(() => {
      if (this.productosEscaneados.length < 1) {
        this.startScan();
      }
      else {
        // Si ya hay codigos escaneados, no se escanea, probablemente quedaron productos sin registrar
        // por algun motivo como bug
      };
    });
  };


  public async startScan(): Promise<void> {
    const element = await this.outputsEmergentesService.showModal({
      component: CameraScannerModalComponent,
      // Set `visibility` to `visible` to show the modal (see `src/theme/variables.scss`)
      cssClass: 'barcode-scanning-modal',
      showBackdrop: false, // Set `showBackdrop` to `false` to hide the backdrop
    });
    element.onDidDismiss().then((result) => {
      const barcode: Barcode | undefined = result.data?.barcode;
      if (barcode && !this.productosEscaneados.some(p => p.codigo === barcode.rawValue)) {
        this.conexionBackendService.obtenerProductoPorCodigo(barcode.rawValue).subscribe({
          next: (resp) => {
            if (resp && resp.producto) {
              const producto = resp.producto;
              this.productosEscaneados.push({
                codigo: barcode.rawValue,
                nombre: producto.nombre_producto,
                marca: producto.marca,
                formato: producto.formato,
                cantidad: 1,
                precio: producto.precio,
                stock_min: producto.stock_min ?? 5,
                nuevo: false,
                existente: producto.cantidad ?? 0,
                imagen_url: producto.imagen_url
              });
            } else {
              this.productosEscaneados.push({
                codigo: barcode.rawValue,
                nombre: '',
                marca: '',
                formato: '',
                cantidad: 1,
                precio: null,
                stock_min: null,
                nuevo: true,
                existente: 0,
                imagen_url: ''
              });
            }
          },
          error: () => {
            this.productosEscaneados.push({
              codigo: barcode.rawValue,
              nombre: '',
              marca: '',
              formato: '',
              cantidad: 1,
              precio: null,
              stock_min: null,
              nuevo: true,
              existente: 0,
              imagen_url: ''
            });
          }
        });
      } else if (barcode && this.productosEscaneados.some(p => p.codigo === barcode.rawValue)) {
        this.outputsEmergentesService.showErrorAlert({
          header: 'AVISO',
          message: 'El código ya fue escaneado',
          buttons: ['OK'],
        });
      } else if (!barcode && this.productosEscaneados.length === 0) {
        this.router.navigate(['/tabs/tab1']);
      }
    });
  }

public guardarProductosEscaneados() {
  // Validar que haya productos para guardar
  if (this.productosEscaneados.length === 0) {
    this.outputsEmergentesService.showErrorAlert({
      header: 'AVISO',
      message: 'No hay productos para registrar',
      buttons: ['OK'],
    });
    return;
  }

  // Prepara los datos para enviar (ajusta los nombres de campos si es necesario)
  const productos = this.productosEscaneados.map(p => ({
    producto: p.nombre,
    marca: p.marca,
    formato: p.formato,
    cantidad: p.cantidad,
    codigo_barra: p.codigo,
    precio: p.precio,
    stock_min: p.stock_min,
    imagen_url: p.imagen_url
  }));

  this.conexionBackendService.registrarProductos(productos).subscribe({
    next: (res) => {
      this.outputsEmergentesService.showErrorAlert({
        header: 'Éxito',
        message: 'Productos registrados correctamente',
        buttons: ['OK'],
      });
      this.productosEscaneados = [];
    },
    error: (err) => {
      this.outputsEmergentesService.showErrorAlert({
        header: 'Error',
        message: 'No se pudieron registrar los productos',
        buttons: ['OK'],
      });
    }
  });
}

close() {
  if (this.productosEscaneados.length > 0) {
    this.outputsEmergentesService.showErrorAlert({
      header: 'Confirmar',
      message: '¿Estás seguro de que quieres salir? Se perderán los productos escaneados.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Salir',
          handler: () => {
            this.productosEscaneados = [];
            this.router.navigate(['/tabs/tab1']);
          }
        }
      ]
    });
  } else {
    // Si no hay productos, navegar directamente
    this.router.navigate(['/tabs/tab1']);
  }
}

getImageSrc(imagenUrl: string): string {
  console.log('🖼️ Imagen URL recibida:', imagenUrl); // Para debug

  if (!imagenUrl) return '';

  if (imagenUrl.startsWith('http')) return imagenUrl;

  // Si imagen_url es "/uploads/productos/archivo.jpg"
  // La URL final debe ser "http://localhost:3000/uploads/productos/archivo.jpg"
  const baseUrl = this.conexionBackendService.getIPFILE().replace('/api/', '');
  const fullUrl = `${baseUrl}${imagenUrl}`;
  console.log('🖼️ URL final construida:', fullUrl); // Para debug

  return fullUrl;
}

onImageError(event: any) {
  // Ocultar la imagen y mostrar un placeholder
  event.target.style.display = 'none';

  // Opcional: agregar una clase para mostrar un ícono de placeholder
  const parent = event.target.parentElement;
  if (parent) {
    parent.classList.add('image-error');
  }
}

onImageLoad(event: any) {
  const parent = event.target.parentElement;
  if (parent) {
    parent.classList.remove('image-error');
  }
}

  // public async scan(): Promise<void> {
  //   const formats = this.formGroup.get('formats')?.value || [];
  //   const { barcodes } = await BarcodeScanner.scan({
  //     formats,
  //   });
  //   this.barcodes = barcodes;
  // }


}
