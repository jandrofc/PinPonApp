import {
  AfterViewInit,    // Hook que se ejecuta después de inicializar la vista
  Component,        // Decorador para definir un componente
  ElementRef,       // Referencia a elementos DOM
  Input,           // Propiedades que recibe desde el padre
  NgZone,          // Para ejecutar código dentro de Angular
  OnDestroy,       // Hook para limpiar cuando se destruye
  ViewChild,       // Para obtener referencias de elementos del template
} from '@angular/core';

import { CommonModule } from '@angular/common'; // Módulo común de Angular
import { IonicModule } from '@ionic/angular';
import {
  Barcode,          // Tipo que representa un código escaneado
  BarcodeFormat,    // Formatos de códigos (QR, Code128, etc.)
  BarcodeScanner,   // Servicio principal del scanner
  LensFacing,       // Cámara frontal o trasera
  StartScanOptions, // Opciones para iniciar el escaneo
} from '@capacitor-mlkit/barcode-scanning';

import { OutputsEmergentesService } from 'src/app/services/outputs-emergentes/outputs-emergentes.service';
import { Capacitor } from '@capacitor/core';      // Para detectar la plataforma
import { InputCustomEvent } from '@ionic/angular'; // Eventos de input de Ionic


@Component({
  selector: 'app-camera-scanner-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Scanning</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="closeModal()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      @if (isWeb) {
        <video #video autoplay class="video"></video>
      }
      <div #square class="square"></div>
      <div class="zoom-ratio-wrapper">
        <ion-range
          [min]="minZoomRatio"
          [max]="maxZoomRatio"
          [disabled]="minZoomRatio === undefined || maxZoomRatio === undefined"
          (ionChange)="setZoomRatio($any($event))"
        ></ion-range>
      </div>
      @if (isTorchAvailable) {
        <ion-fab slot="fixed" horizontal="end" vertical="bottom">
          <ion-fab-button (click)="toggleTorch()">
            <ion-icon name="flashlight"></ion-icon>
          </ion-fab-button>
        </ion-fab>
      }
    </ion-content>
  `,
  styles: [
    `
      ion-content {
        --background: transparent;
      }

      .square {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        border-radius: 16px;
        width: 200px;
        height: 200px;
        border: 6px solid white;
        box-shadow: 0 0 0 4000px rgba(0, 0, 0, 0.3);
      }

      .video {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .zoom-ratio-wrapper {
        position: absolute;
        left: 50%;
        bottom: 16px;
        transform: translateX(-50%);
        width: 50%;
      }
    `,
  ],
  imports: [ CommonModule, IonicModule],
  standalone: true,
})
export class CameraScannerModalComponent implements AfterViewInit, OnDestroy {


  @ViewChild('square')
  public squareElement: ElementRef<HTMLDivElement> | undefined;
  @ViewChild('video')
  public videoElement: ElementRef<HTMLVideoElement> | undefined;
  
  public isTorchAvailable = false;
  public isWeb = Capacitor.getPlatform() === 'web';
  public minZoomRatio: number | undefined;
  public maxZoomRatio: number | undefined;

  private formatos: BarcodeFormat[] = [
      BarcodeFormat.Codabar,
      BarcodeFormat.Code128,
      BarcodeFormat.Code39,
      BarcodeFormat.Code93,
      BarcodeFormat.Ean13,
      BarcodeFormat.Ean8, 
      BarcodeFormat.Itf,
      BarcodeFormat.UpcA,
      BarcodeFormat.UpcE
    ];
  private readonly lensFacing: LensFacing = LensFacing.Back;

  constructor(
    // readonly hace que la propiedad no se pueda modificar
    private readonly OutPuts_Emergentes: OutputsEmergentesService,
    private readonly ngZone: NgZone,
    
    

  ) {}

  // Comienza el escaneo despues de 500ms para esperar que cargue la vista, ademas que permite
  // usar el flash si esta disponible

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.startScan().then(() =>
        BarcodeScanner.isTorchAvailable().then((result) => {
          this.isTorchAvailable = result.available;
        }),
      );
    }, 500);
  }

  // Al cerrar el modal se detiene el escaneo
  ngOnDestroy(): void {
    this.stopScan();
  }

  // Funcion que cambia el zoom
  public setZoomRatio(event: InputCustomEvent): void {
    if (!event.detail.value) {
      return;
    }
    BarcodeScanner.setZoomRatio({
      zoomRatio: parseInt(event.detail.value as any, 10),
    });
  }

  // Funcion que cierra el modal de la camara
  public async closeModal(barcode?: Barcode): Promise<void> {
    this.OutPuts_Emergentes.dismissModal({
      barcode: barcode,
    });
  }
  // Funcion que prende el flash
  public async toggleTorch(): Promise<void> {
    await BarcodeScanner.toggleTorch();
  }

  private async startScan(): Promise<void> {
    // Hide everything behind the modal (see `src/theme/variables.scss`)
    document.querySelector('body')?.classList.add('barcode-scanning-active');

    // Configura las opciones para el escaneo, formato que lee, camara a usar y si sera en web o telefono
    const options: StartScanOptions = {
      formats: this.formatos,
      lensFacing: this.lensFacing,
      videoElement:
        Capacitor.getPlatform() === 'web'
          ? this.videoElement?.nativeElement
          : undefined,
    };




    // Obtiene el perimetro rectangulo de la vista de escaneo declara en el modal arriba
    const squareElementBoundingClientRect =
      this.squareElement?.nativeElement.getBoundingClientRect();

    // Escala el rectangulo para que tengan la misma resolucion ent todos los dispositivos
    const scaledRect = squareElementBoundingClientRect
      ? {
          left: squareElementBoundingClientRect.left * window.devicePixelRatio,
          right:
            squareElementBoundingClientRect.right * window.devicePixelRatio,
          top: squareElementBoundingClientRect.top * window.devicePixelRatio,
          bottom:
            squareElementBoundingClientRect.bottom * window.devicePixelRatio,
          width:
            squareElementBoundingClientRect.width * window.devicePixelRatio,
          height:
            squareElementBoundingClientRect.height * window.devicePixelRatio,
        }
      : undefined;

    const detectionCornerPoints = scaledRect
      ? [
          [scaledRect.left, scaledRect.top],
          [scaledRect.left + scaledRect.width, scaledRect.top],
          [
            scaledRect.left + scaledRect.width,
            scaledRect.top + scaledRect.height,
          ],
          [scaledRect.left, scaledRect.top + scaledRect.height],
        ]
      : undefined;


    
    const listener = await BarcodeScanner.addListener(
      'barcodesScanned',
      async (event) => {
        this.ngZone.run(() => {
          const firstBarcode = event.barcodes[0];
          if (!firstBarcode) {
            return;
          }
          const cornerPoints = firstBarcode.cornerPoints;
          if (
            detectionCornerPoints &&
            cornerPoints &&
            Capacitor.getPlatform() !== 'web'
          ) {

            if (
              detectionCornerPoints[0][0] > cornerPoints[0][0] ||
              detectionCornerPoints[0][1] > cornerPoints[0][1] ||
              detectionCornerPoints[1][0] < cornerPoints[1][0] ||
              detectionCornerPoints[1][1] > cornerPoints[1][1] ||
              detectionCornerPoints[2][0] < cornerPoints[2][0] ||
              detectionCornerPoints[2][1] < cornerPoints[2][1] ||
              detectionCornerPoints[3][0] > cornerPoints[3][0] ||
              detectionCornerPoints[3][1] < cornerPoints[3][1]
            ) {
              return;
            }
          }
          listener.remove();
          this.closeModal(firstBarcode);
        });
      },
    );


    // ESCANEA EL CODIGO
    await BarcodeScanner.startScan(options);
    
    
    
    // OPCIONES DE ZOOM
    
    if (Capacitor.getPlatform() !== 'web') {
      void BarcodeScanner.getMinZoomRatio().then((result) => {
        this.minZoomRatio = result.zoomRatio;
      });
      void BarcodeScanner.getMaxZoomRatio().then((result) => {
        this.maxZoomRatio = result.zoomRatio;
      });
    }
  }


  // Detiene el escaneo
  private async stopScan(): Promise<void> {
    // Show everything behind the modal again
    document.querySelector('body')?.classList.remove('barcode-scanning-active');

    await BarcodeScanner.stopScan();
  }

}
