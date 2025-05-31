import {
  AfterViewInit,    // Hook que se ejecuta después de inicializar la vista
  Component,        // Decorador para definir un componente
  ElementRef,       // Referencia a elementos DOM
  Input,           // Propiedades que recibe desde el padre
  NgZone,          // Para ejecutar código dentro de Angular
  OnDestroy,       // Hook para limpiar cuando se destruye
  ViewChild,       // Para obtener referencias de elementos del template
} from '@angular/core';

import { addIcons } from 'ionicons';
import { close, closeOutline, flashlight, flashlightOutline, barcodeOutline } from 'ionicons/icons';


import { CommonModule } from '@angular/common'; // Módulo común de Angular
import { IonicModule } from '@ionic/angular';
import {
  Barcode,          // Tipo que representa un código escaneado
  BarcodeFormat,    // Formatos de códigos (QR, Code128, etc.)
  BarcodeScanner,   // Servicio principal del scanner
  LensFacing,       // Cámara frontal o trasera
  StartScanOptions, // Opciones para iniciar el escaneo
} from '@capacitor-mlkit/barcode-scanning';

import { BrowserMultiFormatReader } from '@zxing/browser'; // ZXing para escaneo en web
import { Result } from '@zxing/library'; // Resultado del escaneo de ZXing

import { OutputsEmergentesService } from 'src/app/services/outputs-emergentes/outputs-emergentes.service';
import { Capacitor } from '@capacitor/core';      // Para detectar la plataforma
import { InputCustomEvent } from '@ionic/angular'; // Eventos de input de Ionic


@Component({
  selector: 'app-camera-scanner-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>
          <ion-icon name="barcode-outline" style="margin-right: 8px;"></ion-icon>
          Escaneando Producto
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      @if (isWeb) {
        <video #video autoplay class="video"></video>
      }
      
      <!-- ✅ BOTÓN DE CERRAR PERSONALIZADO -->
      <div class="close-button-container">
        <button class="close-button" (click)="closeModal()">
          <ion-icon name="close-outline"></ion-icon>
        </button>
      </div>
      
      <!-- Área de escaneo -->
      <div #square class="square">
        <div class="corner corner-tl"></div>
        <div class="corner corner-tr"></div>
        <div class="corner corner-bl"></div>
        <div class="corner corner-br"></div>
      </div>
      
      <!-- Instrucciones -->
      <div class="instructions">
        <p>Apunta la cámara hacia el código de barras</p>
        <p class="subtitle">El escaneo se realizará automáticamente</p>
      </div>
      
      <!-- Control de zoom -->
      <div class="zoom-ratio-wrapper" *ngIf="minZoomRatio && maxZoomRatio">
        <ion-range
          [min]="minZoomRatio"
          [max]="maxZoomRatio"
          [disabled]="minZoomRatio === undefined || maxZoomRatio === undefined"
          (ionChange)="setZoomRatio($any($event))"
          color="light"
        ></ion-range>
      </div>
      
      <!-- Botón de flash -->
      @if (isTorchAvailable) {
        <ion-fab slot="fixed" horizontal="end" vertical="bottom">
          <ion-fab-button (click)="toggleTorch()" color="light">
            <ion-icon name="flashlight-outline"></ion-icon>
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

      /* ✅ BOTÓN DE CERRAR PERSONALIZADO */
      .close-button-container {
        position: absolute;
        top: 20px;
        right: 20px;
        z-index: 1000;
      }

      .close-button {
        background: rgba(0, 0, 0, 0.6);
        border: 2px solid rgba(255, 255, 255, 0.8);
        border-radius: 50%;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
        
        ion-icon {
          color: white;
          font-size: 1.5rem;
        }
        
        &:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: white;
          transform: scale(1.1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        
        &:active {
          transform: scale(0.95);
        }
      }

      /* ✅ ÁREA DE ESCANEO MEJORADA */
      .square {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 280px;
        height: 280px;
        box-shadow: 0 0 0 4000px rgba(0, 0, 0, 0.6);
        border-radius: 20px;
      }

      /* ✅ ESQUINAS ANIMADAS */
      .corner {
        position: absolute;
        width: 40px;
        height: 40px;
        border: 4px solid #00ff88;
        animation: cornerPulse 2s infinite;
      }

      .corner-tl {
        top: 0;
        left: 0;
        border-right: none;
        border-bottom: none;
        border-top-left-radius: 20px;
      }

      .corner-tr {
        top: 0;
        right: 0;
        border-left: none;
        border-bottom: none;
        border-top-right-radius: 20px;
      }

      .corner-bl {
        bottom: 0;
        left: 0;
        border-right: none;
        border-top: none;
        border-bottom-left-radius: 20px;
      }

      .corner-br {
        bottom: 0;
        right: 0;
        border-left: none;
        border-top: none;
        border-bottom-right-radius: 20px;
      }

      @keyframes cornerPulse {
        0%, 100% {
          border-color: #00ff88;
          opacity: 1;
        }
        50% {
          border-color: #ffffff;
          opacity: 0.7;
        }
      }

      /* ✅ LÍNEA DE ESCANEO ANIMADA */
      .square::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, transparent 0%, #00ff88 50%, transparent 100%);
        animation: scanLine 2s linear infinite;
      }

      @keyframes scanLine {
        0% {
          top: 0;
          opacity: 0;
        }
        10% {
          opacity: 1;
        }
        90% {
          opacity: 1;
        }
        100% {
          top: 100%;
          opacity: 0;
        }
      }

      .video {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      /* ✅ INSTRUCCIONES MEJORADAS */
      .instructions {
        position: absolute;
        top: 15%;
        left: 50%;
        transform: translateX(-50%);
        text-align: center;
        color: white;
        background: rgba(0, 0, 0, 0.7);
        padding: 1.5rem;
        border-radius: 16px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        max-width: 90%;
        
        p {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          
          &.subtitle {
            font-size: 0.9rem;
            font-weight: 400;
            opacity: 0.8;
            margin-top: 0.5rem;
          }
        }
      }

      .zoom-ratio-wrapper {
        position: absolute;
        left: 50%;
        bottom: 120px;
        transform: translateX(-50%);
        width: 60%;
        
        ion-range {
          --bar-background: rgba(255, 255, 255, 0.3);
          --bar-background-active: #00ff88;
          --knob-background: #00ff88;
          --knob-border: 2px solid white;
        }
      }

      /* ✅ BOTÓN DE FLASH MEJORADO */
      ion-fab-button {
        --background: rgba(0, 0, 0, 0.6);
        --color: white;
        --border-radius: 50%;
        --box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        
        &:hover {
          --background: rgba(255, 255, 255, 0.1);
          transform: scale(1.1);
        }
      }

      /* ✅ TOOLBAR LIMPIO */
      ion-header {
        ion-toolbar {
          --background: rgba(0, 0, 0, 0.8);
          --color: white;
          backdrop-filter: blur(10px);
          
          ion-title {
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            
            ion-icon {
              color: #00ff88;
            }
          }
        }
      }

      /* ✅ RESPONSIVE */
      @media (max-width: 768px) {
        .close-button-container {
          top: 15px;
          right: 15px;
        }
        
        .close-button {
          width: 45px;
          height: 45px;
          
          ion-icon {
            font-size: 1.3rem;
          }
        }
        
        .square {
          width: 250px;
          height: 250px;
        }
        
        .instructions {
          top: 10%;
          padding: 1rem;
          
          p {
            font-size: 1rem;
            
            &.subtitle {
              font-size: 0.8rem;
            }
          }
        }
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
  
  // ZXing para escaneo en web
  private zxingReader = new BrowserMultiFormatReader();
  private zxingControls: any;

  constructor(
    // readonly hace que la propiedad no se pueda modificar
    private readonly OutPuts_Emergentes: OutputsEmergentesService,
    private readonly ngZone: NgZone,
    
    

  ) {addIcons({
      'barcode-outline': barcodeOutline,
      'close': close,
      'close-outline': closeOutline,
      'flashlight': flashlight,
      'flashlight-outline': flashlightOutline,
    });}

  // Comienza el escaneo despues de 500ms para esperar que cargue la vista, ademas que permite
  // usar el flash si esta disponible

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.startScan().then(() => {
        if (Capacitor.getPlatform() !== 'web') {
          BarcodeScanner.isTorchAvailable().then((result) => {
            this.isTorchAvailable = result.available;
          });
        } else {
          this.isTorchAvailable = false;
        }
      });
    }, 500);
  }

  // Al cerrar el modal se detiene el escaneo
  ngOnDestroy(): void {
    this.stopScan();
  }

  //Reproducir el sonido de beep
  playBeepSound() {
    const audio = new Audio('assets/sonido/beep.mp3');
    audio.play();
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
    if (Capacitor.getPlatform() === 'web') {
      // ZXing para escaneo en web
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      const selectedDeviceId = devices[0]?.deviceId;
      if (!selectedDeviceId) {
        throw new Error('No se encontró ninguna cámara disponible.');
      }
      // Inicia el escaneo con ZXing
      this.zxingControls = this.zxingReader.decodeFromVideoDevice(
        selectedDeviceId,
        this.videoElement?.nativeElement!,
        (result: Result | undefined, err, controls) => {
          if (result) {
            this.ngZone.run(() => {
              this.playBeepSound(); // Reproducir sonido de beep
              this.closeModal({ rawValue: result.getText() } as any);
              controls.stop();
            });
          }
          if (err) {
            throw new Error(`Error al escanear con zxing: ${err.message}`);
          }
        }
      );
      return;
    }

    // --- MÓVIL: BarcodeScanner ---
    const options: StartScanOptions = {
      formats: this.formatos,
      lensFacing: this.lensFacing,
      videoElement: undefined, // solo para móvil
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
          this.playBeepSound(); // Reproducir sonido de beep
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
    document.querySelector('body')?.classList.remove('barcode-scanning-active');
    if (Capacitor.getPlatform() === 'web') {
      if (this.zxingControls && typeof this.zxingControls.stop === 'function') {
        this.zxingControls.stop();}
    } else {
      await BarcodeScanner.stopScan();
    }
  }
}
