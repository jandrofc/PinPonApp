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
import { createOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { ModalController } from '@ionic/angular';
import { FormularioRegistroProductoModalComponent } from '../modales/formulario-registro-producto-modal/formulario-registro-producto-modal.component';


export interface ProductoEscaneado {
  codigo: string;
  nombre: string;
  marca: string;
  formato: string;
  cantidad: number | null;
  precio: number | null;
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
  
  constructor(
    private outputsEmergentesService: OutputsEmergentesService,
    private modalController: ModalController


  ) { addIcons({ createOutline }) }

  
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
    // Si se escaneó un código y no está repetido, lo agregamos
    if (data?.barcode && !this.productosEscaneados.some(p => p.codigo === data.barcode.rawValue)) {
      this.productosEscaneados.push({
        codigo: data.barcode.rawValue,
        nombre: '',
        marca: '',
        formato: '',
        cantidad: null,
        precio: null
      });
    } else if (data?.barcode && this.productosEscaneados.some(p => p.codigo === data.barcode.rawValue)) {
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
        this.productosEscaneados.push({
          codigo: barcode.rawValue,
          nombre: '',
          marca: '',
          formato: '',
          cantidad: null,
          precio: null
        });
      } else if (barcode && this.productosEscaneados.some(p => p.codigo === barcode.rawValue)) {
        this.outputsEmergentesService.showErrorAlert({
          header: 'AVISO',
          message: 'El código ya fue escaneado',
          buttons: ['OK'],
        });
      }
    });
  }

  // public async scan(): Promise<void> {
  //   const formats = this.formGroup.get('formats')?.value || [];
  //   const { barcodes } = await BarcodeScanner.scan({
  //     formats,
  //   });
  //   this.barcodes = barcodes;
  // }


}
