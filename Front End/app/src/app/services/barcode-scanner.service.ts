// src/app/services/barcode-scanner.service.ts
import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';

// Import MLKit
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

// Import ZXing para web
import { BrowserMultiFormatReader} from '@zxing/browser';

@Injectable({
  providedIn: 'root',
})
export class BarcodeScannerService {
  private zxingReader: BrowserMultiFormatReader;

  constructor() {
    this.zxingReader = new BrowserMultiFormatReader();
  }

  async scanBarcode(onResult: (value: string) => void): Promise<string | null> {
    if (Capacitor.getPlatform() === 'web') {
      return this.scanWithZXing(onResult);
    } else {
      return this.scanWithMLKit();
    }
  }

  private async scanWithMLKit(): Promise<string | null> {
    try {
      const result = await BarcodeScanner.scan();
      return result.barcodes?.[0]?.rawValue || null;
    } catch (error) {
      console.error('MLKit scan error:', error);
      return null;
    }
  }

  private async scanWithZXing(onResult: (value: string) => void): Promise<string | null> {
    try {
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      const selectedDeviceId = devices[0]?.deviceId;
      if (!selectedDeviceId) throw new Error('No camera found');
  
      return new Promise((resolve, reject) => {
        const videoElement = document.getElementById('video') as HTMLVideoElement;
        this.zxingReader.decodeFromVideoDevice(selectedDeviceId, videoElement, (result, err) => {
          console.log('Obteniendo ',result,err)
          if (result) {
            const value = result.getText();
            onResult(value); // Llama a la función de callback con el resultado
            // this.stopWebScanner(videoElement); // Detiene la cámara
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
      stream.getTracks().forEach(track => track.stop()); // Stop all tracks
      videoElement.srcObject = null; // Clear the video source
    }
  }
}
