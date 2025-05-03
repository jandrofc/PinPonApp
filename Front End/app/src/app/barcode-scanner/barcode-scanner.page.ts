import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

import { BarcodeScannerService } from '../services/barcode-scanner.service';  //servicio de scnaeo
import { ElementRef,ViewChild, ChangeDetectorRef } from '@angular/core'; //obtener informacion de los elementos
import { Capacitor } from '@capacitor/core';  //conocer donde se esta ejecutando
import { Router } from '@angular/router'; //navegacion entre paginas

@Component({
  selector: 'app-barcode-scanner',
  templateUrl: './barcode-scanner.page.html',
  styleUrls: ['./barcode-scanner.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class BarcodeScannerPage implements AfterViewInit {


  //Para leer el html y darle el link de la camara virtual
  @ViewChild('video', { static: false }) videoRef!: ElementRef<HTMLVideoElement>; 
  // result: string | null = null;
  // isScanning: boolean = false;  // Para controlar si estamos escaneando

  // Variables para los mensajes
  scanSuccess: boolean = false;
  scanError: boolean = false;
  scanDuplicate: boolean = false;

  private scannedCodes: Set<string> = new Set(); // Para almacenar códigos escaneados y evitar duplicados

  //Detectamos en que plataforma se esta ejecutando con la funcion de capacitor
  async ngAfterViewInit(): Promise<void> {
    if (Capacitor.getPlatform() == "web") {
      await this.startStreamFromWebCam();
      await this.barcodeScannerService.scanBarcode(async (result) => {
        if (result) {
          console.log('Código escaneado:', result);
          if (this.scannedCodes.has(result)) {
            this.showWarningMessage(); // Código duplicado
          } else {
            this.scannedCodes.add(result);
            this.showSuccessMessage(); // Escaneo exitoso
          }
        } else {
          this.showErrorMessage(); // Error en el escaneo
        }
        await this.delay(10000);
        this.cdr.detectChanges();
      });
    } else {
      // Ejecutar la cámara con Capacitor
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  constructor(
    private barcodeScannerService: BarcodeScannerService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}
  
  //Le entregamos el link de referencia a la tag img del html leyendo su interior
  async startStreamFromWebCam() {
    if (!this.videoRef || !this.videoRef.nativeElement) {
      console.error('Video element not found');
      return;
    }
  
    const video = this.videoRef.nativeElement;
  
    try {
      // Solicitar acceso a la webcam
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream; // Asignar el flujo de la webcam al video
      video.muted = true; // Silenciar el video
      await video.play();
      console.log('Webcam stream started successfully');
    } catch (error) {
      console.error('No se pudo acceder a la webcam:', error);
    }
  }

  private showSuccessMessage() {
    this.scanSuccess = true;
    this.scanError = false;
    this.scanDuplicate = false;
  }

  private showErrorMessage() {
    this.scanSuccess = false;
    this.scanError = true;
    this.scanDuplicate = false;
  }

  private showWarningMessage() {
    this.scanSuccess = false;
    this.scanError = false;
    this.scanDuplicate = true;
  }

  confirmarScan() {
    this.router.navigate(['/tabs/tab1']);
  }


  ionViewWillLeave(): void {
    if (this.videoRef && this.videoRef.nativeElement) {
      const videoElement = this.videoRef.nativeElement;
      const stream = videoElement.srcObject as MediaStream;
  
      if (stream) {
        stream.getTracks().forEach(track => track.stop()); // Detener todos los tracks de la cámara
        videoElement.srcObject = null; // Limpiar el video source
      }
  
      // Detener el escáner ZXing si es necesario
      this.barcodeScannerService.stopWebScanner(videoElement);
    }
  }
}

  // Método para iniciar el escaneo
  // async startScan() {
  //   this.isScanning = true;
  //   this.result = null;  // Resetear resultado antes de empezar

  //   try {
  //     this.result = await this.barcodeScannerService.scanBarcode();
  //   } catch (error) {
  //     console.error('Error al escanear:', error);
  //   } finally {
  //     this.isScanning = false;
  //   }
  // }

  // // Método para detener el escaneo (para web)
  // stopScan() {
  //   const videoElement = document.getElementById(this.videoElementId) as HTMLVideoElement;
  //   if (videoElement) {
  //     this.barcodeScannerService.stopWebScanner(videoElement);
  //   }
  // }

  

