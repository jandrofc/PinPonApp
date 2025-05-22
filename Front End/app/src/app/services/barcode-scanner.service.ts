// src/app/services/barcode-scanner.service.ts
import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';


import {BarcodeScanner} from '@capacitor-mlkit/barcode-scanning';
import { BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';
// Import ZXing para web
import { BrowserMultiFormatReader} from '@zxing/browser';
import { IScannerControls } from '@zxing/browser';
import { barcode } from 'ionicons/icons';


@Injectable({
  providedIn: 'root',
})
export class BarcodeScannerService {
  private zxingReader: BrowserMultiFormatReader;
  private activeScan: IScannerControls | null = null;


  constructor() {
    this.zxingReader = new BrowserMultiFormatReader();
  }

  async scanBarcode(onResult: (value: string) => void): Promise<string | null> {
    if (Capacitor.getPlatform() === 'web') {
      return this.scanWithZXing(onResult);
    } else {
      return this.scanWithCapacitor(onResult);
    }
  }

  async scanWithCapacitor (onResult: (value: string) => void, formats?: BarcodeFormat[]) : Promise<string | null> {
  // The camera is visible behind the WebView, so that you can customize the UI in the WebView.
  // However, this means that you have to hide all elements that should not be visible.
  // You can find an example in our demo repository.
  // In this case we set a class `barcode-scanner-active`, which then contains certain CSS rules for our app.
  

  document.body.style.background = 'transparent';

  // Hide all elements
  // ion-content.barcode-scanner-active {
  //   visibility: hidden !important;
  //   --background: transparent !important;
  //   --ion-background-color: transparent !important;
  //   background: transparent !important;
  // }

  // // Show only the barcode scanner modal
  // .barcode-scanner-modal {
  //   visibility: visible;
  // }


  // capacitor-camera-preview {
  //   position: absolute;
  //   top: 0;
  //   left: 0;
  //   width: 100vw;
  //   height: 100vh;
  //   z-index: 1;
  // }
  return new Promise<string | null>(async (resolve) => {
    // Add the `barcodeScanned` listener
    await BarcodeScanner.addListener(
      'barcodesScanned',
      async result => {
        
        if (result.barcodes.length > 0) {
          resolve(result.barcodes[0].rawValue);
          onResult(result.barcodes[0].rawValue);
        }
      },
    
    );
  // Start the barcode scanner
  await BarcodeScanner.startScan({
    formats: formats || [
          BarcodeFormat.Codabar,
          BarcodeFormat.Code128,
          BarcodeFormat.Code39,
          BarcodeFormat.Code93,
          BarcodeFormat.Ean13,
          BarcodeFormat.Ean8, 
          BarcodeFormat.Itf,
          BarcodeFormat.UpcA,
          BarcodeFormat.UpcE
        ]    
      });
  });
}




  async stopScan () : Promise<void|null> {
  // Make all elements in the WebView visible again
  document.querySelector('ion-content')?.classList.remove('barcode-scanner-active');
  const ionContent = document.querySelector('ion-content');
  document.body.style.background = 'white';


  if (ionContent) {
    console.log('Clases del ion-content: stop can', ionContent.className);
  }
  // Remove all listeners
  await BarcodeScanner.removeAllListeners();

  // Stop the barcode scanner
  await BarcodeScanner.stopScan();
};





// FUNCIONES PARA EL ESCANEO CON ZXING ---- WEB

  private async scanWithZXing(onResult: (value: string) => void): Promise<string | null> {
    try {
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      const selectedDeviceId = devices[0]?.deviceId;
      if (!selectedDeviceId) throw new Error('No camera found');
  
      const videoElement = document.getElementById('video') as HTMLVideoElement;
  
      return new Promise((resolve, reject) => {
        this.zxingReader
          .decodeFromVideoDevice(selectedDeviceId, videoElement, (result, err, controls) => {
            if (!this.activeScan && controls) {
              this.activeScan = controls;
            }
  
            if (result) {
              const value = result.getText();
              onResult(value);
              resolve(value);
            }
  
            if (err && err.name !== 'NotFoundException') {
              console.error('ZXing scan error:', err);
              reject(err);
            }
          });
      });
    } catch (error) {
      console.error('ZXing setup error:', error);
      return null;
    }
  }
  
  stopWebScanner(videoElement: HTMLVideoElement) {
    const stream = videoElement.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      videoElement.srcObject = null;
    }
  
    try {
      if (this.activeScan) {
        this.activeScan.stop();
        this.activeScan = null;
        console.log('Escáner ZXing detenido correctamente');
      }
    } catch (error) {
      console.error('Error al detener el escáner ZXing:', error);
    }
  }
  async restartWebScanner(videoElement: HTMLVideoElement): Promise<void> {
  try {
    // Accede a la cámara
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });

    // Asigna el stream al elemento <video>
    videoElement.srcObject = stream;
    videoElement.play(); // Inicia la reproducción del video
    console.log('Stream de la cámara iniciado correctamente');
  } catch (error) {
    console.error('Error al reiniciar el stream de la cámara:', error);
  }
}



}
  
  