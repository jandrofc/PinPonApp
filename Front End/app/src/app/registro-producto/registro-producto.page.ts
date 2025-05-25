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
  private scannedCodes: Set<string> = new Set();

  // Almacena los codigos de barras escaneados para mostrar en la vista
  // debe borrarse, solo fue para pruebas
  public valoresEscaneados: string[] = [];
  
  constructor(
    private outputsEmergentesService: OutputsEmergentesService


  ) { }

  



  public ngOnInit(): void {
    BarcodeScanner.isSupported().then((result) => {
      this.isSupported = result.supported;
    });
    BarcodeScanner.checkPermissions().then((result) => {
      this.isPermissionGranted = result.camera === 'granted';
    });
    BarcodeScanner.removeAllListeners().then(() => {
      if (this.scannedCodes.size < 1) {
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
      if (barcode && !this.scannedCodes.has(barcode.rawValue)) {
        this.scannedCodes.add(barcode.rawValue);
        this.valoresEscaneados = Array.from(this.scannedCodes);
      }
      else if (barcode && this.scannedCodes.has(barcode.rawValue)){
        // Si el codigo ya fue escaneado, no se agrega a la lista
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
