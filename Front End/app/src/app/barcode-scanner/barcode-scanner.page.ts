import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

import { BarcodeScannerService } from '../services/barcode-scanner.service';  //servicio de scnaeo
import { ElementRef,ViewChild, ChangeDetectorRef } from '@angular/core'; //obtener informacion de los elementos
import { Capacitor } from '@capacitor/core';  //conocer donde se esta ejecutando
import { ActivatedRoute, Router } from '@angular/router'; //navegacion entre paginas


import { FormBuilder, FormGroup, Validators } from '@angular/forms';

//indica el estado del page del escaneo
enum ScanState {
  Scanning,
  FillingForm
}

@Component({
  selector: 'app-barcode-scanner',
  templateUrl: './barcode-scanner.page.html',
  styleUrls: ['./barcode-scanner.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class BarcodeScannerPage implements AfterViewInit, OnInit {

  public ScanState = ScanState;
  scanState: ScanState = ScanState.Scanning;
  
  



  //parametros
  routingbefore: string | null=null;
  
  //Agregar producto a la bd
  //Buscar producto por id en la bd
  //Agregar producto a boleta
  modo: string | null=null;

  tiempo_mensaje = 3000;


  scannedCode: string | null=null;



  //Para leer el html y darle el link de la camara virtual
  @ViewChild('video', { static: false }) videoRef!: ElementRef<HTMLVideoElement>; 
  // result: string | null = null;
  // isScanning: boolean = false;  // Para controlar si estamos escaneando

  // Variables para los mensajes
  scanSuccess: boolean = false;
  scanError: boolean = false;
  scanDuplicate: boolean = false;

  private scannedCodes: Set<string> = new Set(); // Para almacenar códigos escaneados y evitar duplicados

  ngOnInit(): void{
    this.params.queryParams.subscribe(params => {
      this.modo = params['modo'] || null;
      this.routingbefore = params['routingbefore'] || null;

      console.log('Modo:', this.modo);
      console.log('routingbefore:', this.routingbefore);
    });
  }


  
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
            this.ionViewWillLeave();
            this.scannedCodes.add(result);
            this.scannedCode = result;
            this.scanState = ScanState.FillingForm;
            this.stopScanner()
            this.showSuccessMessage(); // Escaneo exitoso
            
          }
        } else {
          this.showErrorMessage(); // Error en el escaneo
        }
        this.cdr.detectChanges();
      });
    } else {
      // Ejecutar la cámara con Capacitor
    }
  }


  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  productForm: FormGroup;
  constructor(
    private barcodeScannerService: BarcodeScannerService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private params: ActivatedRoute,
    private formBuilder: FormBuilder
  ) {
    this.productForm = this.formBuilder.group({
      code: [{value: '', disabled: true}],
      name: ['', Validators.required],
      brand: ['', Validators.required],
      format: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
      price: ['', [Validators.required, Validators.min(0)]],
    });
  }
  

  // COMENZAR Y DETENER CAMARA


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

  //TEST
  private stopScanner() {
    const videoElement = this.videoRef?.nativeElement;
    if (videoElement && videoElement.srcObject) {
      const stream = videoElement.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoElement.srcObject = null;
    }
  
    this.barcodeScannerService.stopWebScanner(this.videoRef?.nativeElement);
  }


  // MENSAJES DE FEEDBACK


  private showSuccessMessage() {
    this.scanSuccess = true;
    setTimeout(() => {
      this.scanSuccess = false;
    }, this.tiempo_mensaje); // sigue siendo 1000 o 2000 ms
  }
  
  private showErrorMessage() {
    this.scanError = true;
    setTimeout(() => {
      this.scanError = false;
    }, this.tiempo_mensaje);
  }
  
  private showWarningMessage() {
    this.scanDuplicate = true;
    setTimeout(() => {
      this.scanDuplicate = false;
    }, this.tiempo_mensaje);
  }


  //FORMULARIO

  getProductData() {
    if (this.productForm.valid) {
      // Incluir el código en el objeto final aunque el campo esté deshabilitado
      const productData = {
        ...this.productForm.getRawValue()
      };
      
      console.log('Datos del producto:', productData);
      return productData;
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      this.markFormGroupTouched(this.productForm);
      return null;
    }
  }

  resetForm() {
    this.productForm.reset();
    // Mantener el código deshabilitado
    this.productForm.get('code')?.setValue(this.scannedCode);
    this.productForm.get('code')?.disable();
  }
  
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
  continueScanning(): void{
    this.scannedCode = null;
    this.scanSuccess = false;
    this.scanError = false;
    this.scanDuplicate = false;
  
    this.scanState = ScanState.Scanning;
  
    this.startStreamFromWebCam();
    this.barcodeScannerService.scanBarcode(this.handleScanCallback.bind(this));
  }

  private handleScanCallback(result: string) {
    if (result) {
      if (this.scannedCodes.has(result)) {
        this.showWarningMessage();
      } else {
        this.scannedCodes.add(result);
        this.scannedCode = result;
        this.scanState = ScanState.FillingForm;
        this.stopScanner(); 
        this.showSuccessMessage();
      }
    } else {
      this.showErrorMessage();
    }
  
    this.cdr.detectChanges();
  }
}


  

