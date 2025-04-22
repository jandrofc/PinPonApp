import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

import { BarcodeScannerService } from '../services/barcode-scanner.service';  //servicio de scnaeo
import { ElementRef,ViewChild } from '@angular/core'; //obtener informacion de los elementos
import { Capacitor } from '@capacitor/core';  //conocer donde se esta ejecutando
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

  //Detectamos en que plataforma se esta ejecutando con la funcion de capacitor
  async ngAfterViewInit(): Promise<void> {
    if (Capacitor.getPlatform() == "web"){
      await this.startStreamFromWebCam()
      this.barcodeScannerService.scanBarcode()
    } else{
      //ejecutar la camara con capacitor
    }
    
  }
  
  constructor(private barcodeScannerService: BarcodeScannerService) {}
  
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

  
}
