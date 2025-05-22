// src/app/services/barcode-scanner.service.ts
import { Injectable } from '@angular/core';


import {BarcodeScanner} from '@capacitor-mlkit/barcode-scanning';
import { BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';
// Import ZXing para web
import { BrowserMultiFormatReader} from '@zxing/browser';
import { IScannerControls } from '@zxing/browser';


@Injectable({
  providedIn: 'root',
})
export class BarcodeScannerService {
  private zxingReader: BrowserMultiFormatReader;
  private activeScan: IScannerControls | null = null;


  constructor() {
    this.zxingReader = new BrowserMultiFormatReader();
  }


  async scanWithCapacitor (elementoHTML: HTMLElement ,onResult: (value: string) => void, formats?: BarcodeFormat[]) : Promise<string | null> {
  // The camera is visible behind the WebView, so that you can customize the UI in the WebView.
  // However, this means that you have to hide all elements that should not be visible.
  // You can find an example in our demo repository.
  // In this case we set a class `barcode-scanner-active`, which then contains certain CSS rules for our app.
  elementoHTML.classList.add('barcode-scanner-active');
  const elements = document.querySelectorAll('ion-content');
  console.log(`Encontrados ${elements.length} elementos ion-content`);
  
  elements.forEach((el, index) => {
    this.debugElementStyles(el as HTMLElement, `ion-content #${index}`);
  });
  
  
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


  async stopScan (elementoHTML: HTMLElement) : Promise<void|null> {
  // Make all elements in the WebView visible again
  elementoHTML.classList.remove('barcode-scanner-active');
  // Remove all listeners
  await BarcodeScanner.removeAllListeners();

  // Stop the barcode scanner
  await BarcodeScanner.stopScan();
};





// FUNCIONES PARA EL ESCANEO CON ZXING ---- WEB

  async scanWithZXing(videoElement: HTMLVideoElement,onResult: (value: string) => void): Promise<string | null> {
    try {
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      const selectedDeviceId = devices[0]?.deviceId;
      if (!selectedDeviceId) throw new Error('No camera found');
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

//DEBUGGING
  debugElementStyles(element: HTMLElement | null, description: string = 'Elemento') {
  if (!element) {
    console.error('Elemento no disponible para depuración');
    return;
  }
  
  console.group(`Estilos de ${description}`);
  
  // Mostrar clases aplicadas
  console.log('Clases:', element.classList.toString());
  
  // Obtener todos los estilos computados
  const computedStyles = window.getComputedStyle(element);
  
  // Crear un objeto para almacenar los estilos relevantes
  const relevantStyles = {
    visibility: computedStyles.visibility,
    display: computedStyles.display,
    opacity: computedStyles.opacity,
    background: computedStyles.background,
    backgroundColor: computedStyles.backgroundColor,
    position: computedStyles.position,
    zIndex: computedStyles.zIndex
  };
  
  console.table(relevantStyles);
  
  // Variables CSS personalizadas (como --background en Ionic)
  console.log('Variables CSS personalizadas (computadas):');
  console.log('--background:', computedStyles.getPropertyValue('--background'));
  console.log('--ion-background-color:', computedStyles.getPropertyValue('--ion-background-color'));
  
  // Inspeccionar el DOM para mostrar los valores actuales de las variables CSS
  console.log('Valores efectivos de background:');
  console.log('background-color (real):', window.getComputedStyle(element).backgroundColor);
  console.log('background (real):', window.getComputedStyle(element).background);
  
  console.groupEnd();
  }

}
  
  