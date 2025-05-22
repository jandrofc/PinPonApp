import { AfterViewInit, Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule , ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';



import { BarcodeScannerService } from '../services/barcode-scanner.service';  //servicio de scnaeo
import { ElementRef,ViewChild, ChangeDetectorRef} from '@angular/core'; //obtener informacion de los elementos
import { Capacitor } from '@capacitor/core';  //conocer donde se esta ejecutando
import { Camera } from '@capacitor/camera'; //para la camara
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
  imports: [ CommonModule, FormsModule,ReactiveFormsModule, IonicModule]
})
export class BarcodeScannerPage implements OnInit {
  scannedProducts: any[] = [];

  constructor(
    private barcodeScannerService: BarcodeScannerService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private params: ActivatedRoute,
    private formBuilder: FormBuilder,
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


  productForm: FormGroup;


  public ScanState = ScanState;
  scanState: ScanState = ScanState.Scanning;
  //Indica de donde venimos
  routingbefore: string | null=null;

  //Agregar producto a la bd
  //Buscar producto por id en la bd
  //Agregar producto a boleta
  //Indica que se va hacer en el scaner
  modo: string | null=null;

  //Indica el tiempo que se va a mostrar el mensaje de feedback
  tiempo_mensaje = 3000;

  //Almacena el resultado del escaneo
  scannedCode: string | null=null;

  platform: string | null=null;

  //Para leer el html y darle el link de la camara virtual
  @ViewChild('video', { static: false }) videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('body', { static: false }) body!: ElementRef<HTMLElement>;

  // Variables para los mensajes feedback
  scanSuccess: boolean = false;
  scanError: boolean = false;
  scanDuplicate: boolean = false;

  private scannedCodes: Set<string> = new Set(); // Para almacenar códigos escaneados y evitar duplicados

  ngOnInit(): void{
    this.platform=Capacitor.getPlatform()
    // Obtener los parámetros de la URL que vienenn de la página anterior
    this.params.queryParams.subscribe(params => {
      this.modo = params['modo'] || null;
      this.routingbefore = params['routingbefore'] || null;

      console.log('Modo:', this.modo);
      console.log('routingbefore:', this.routingbefore);
    });



  }

  ionViewDidEnter() {
    console.log('Body element:', this.body?.nativeElement);
    this.EmpezarEscaneo();
  }


  //Solicitar permisos de la camara
  async requestCameraPermission() {
    const status = await Camera.requestPermissions();
    if (status.camera === 'granted') {
      console.log('Permiso para la cámara concedido');
    } else {
      console.error('Permiso para la cámara denegado');
    }
  }

  //Reproducir el sonido de beep
  playBeepSound() {
  const audio = new Audio('assets/sonido/beep.mp3');
  audio.play();
  }

  // COMENZAR Y DETENER CAMARA

  async EmpezarEscaneo() {
    await this.requestCameraPermission(); // Solicitar permisos de la cámara
    
    
    if (this.platform == "web") {
      if (!this.videoRef || !this.videoRef.nativeElement) {
        console.error('El elemento video no está disponible');
      }
      await this.barcodeScannerService.scanWithZXing(this.videoRef.nativeElement, async (result) => {
        if (result) {
          console.log('Código escaneado:', result);
          if (this.scannedCodes.has(result)) {
            this.showWarningMessage(); // Código duplicado
          } else {
            this.showSuccessMessage(); // Escaneo exitos
            this.playBeepSound(); // Reproducir sonido de beep
            this.productForm.patchValue({ code: result });
            this.barcodeScannerService.stopWebScanner(this.videoRef.nativeElement); // Detener el escáner
            this.scannedCodes.add(result);
            this.scannedCode = result;
            this.scanState = ScanState.FillingForm;

          }
        } else {
          this.showErrorMessage(); // Error en el escaneo
        }
        this.cdr.detectChanges();
      });
    } 
    else {
      await this.barcodeScannerService.scanWithCapacitor(this.body.nativeElement,async (result) => {
        if (result) {
          console.log('Código escaneado:', result);
          if (this.scannedCodes.has(result)) {
            this.showWarningMessage(); // Código duplicado
          } else {
            this.showSuccessMessage(); // Escaneo exitos
            this.playBeepSound(); // Reproducir sonido de beep
            this.productForm.patchValue({ code: result });
            this.barcodeScannerService.stopScan(this.body.nativeElement);
            this.scannedCodes.add(result);
            this.scannedCode = result;
            this.scanState = ScanState.FillingForm;
          }
        } else {
          this.showErrorMessage(); // Error en el escaneo
        }
      });
      };
    }



  //reinicia la camara y el escaneo
  async continueScanning(): Promise<void> {
    this.scannedCode = null;
    this.scanSuccess = false;
    this.scanError = false;
    this.scanDuplicate = false;
    this.scannedProducts.push(this.getProductData ()) // Obtener los datos del formulario
    this.resetForm(); // Reiniciar el formulario
    this.scanState = ScanState.Scanning;
    this.cdr.detectChanges();
    await this.cdr.detectChanges();
    await this.EmpezarEscaneo();
  }

  // navegar a la pagina de productos escaneados
  scannedList() {
    this.barcodeScannerService.stopWebScanner(this.videoRef.nativeElement); // Detener el escáner

    this.router.navigate(['/scan-inventario'], {
      queryParams: { scannedProducts: JSON.stringify(this.scannedProducts) }
    });
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
    console.log('getProductData');
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
    console.log('resetForm');
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


  

}
