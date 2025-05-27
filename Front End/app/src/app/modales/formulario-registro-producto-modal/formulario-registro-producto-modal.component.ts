import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-formulario-registro-producto-modal',
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  template: `
  <ion-header>
    <ion-toolbar>
      <ion-title>Escaneo Código QR</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content>
  <ng-container class="barcode-scanner-modal">
    <div>
      <h2>Información del Producto</h2>
      
      <form [formGroup]="productForm">
        <ion-item>
          <ion-label position="stacked">Código</ion-label>
          <ion-input formControlName="code" readonly></ion-input>
        </ion-item>
  
        <ion-item>
          <ion-label position="stacked">Nombre del Producto <ion-text color="danger">*</ion-text></ion-label>
          <ion-input formControlName="name" placeholder="Ej: Leche entera"></ion-input>
        </ion-item>
        <ion-text color="danger" *ngIf="productForm.get('name')?.touched && productForm.get('name')?.errors?.['required']" class="ion-padding-start">
          El nombre es obligatorio
        </ion-text>
  
        <ion-item>
          <ion-label position="stacked">Marca <ion-text color="danger">*</ion-text></ion-label>
          <ion-input formControlName="brand" placeholder="Ej: Alpura"></ion-input>
        </ion-item>
        <ion-text color="danger" *ngIf="productForm.get('brand')?.touched && productForm.get('brand')?.errors?.['required']" class="ion-padding-start">
          La marca es obligatoria
        </ion-text>
  
        <ion-item>
          <ion-label position="stacked">Formato <ion-text color="danger">*</ion-text></ion-label>
          <ion-input formControlName="format" placeholder="Ej: Botella 1L"></ion-input>
        </ion-item>
        <ion-text color="danger" *ngIf="productForm.get('format')?.touched && productForm.get('format')?.errors?.['required']" class="ion-padding-start">
          El formato es obligatorio
        </ion-text>
  
        <ion-item>
          <ion-label position="stacked">Cantidad <ion-text color="danger">*</ion-text></ion-label>
          <ion-input formControlName="quantity" type="number" placeholder="Ej: 1"></ion-input>
        </ion-item>
        <ion-text color="danger" *ngIf="productForm.get('quantity')?.touched && productForm.get('quantity')?.errors?.['required']" class="ion-padding-start">
          La cantidad es obligatoria
        </ion-text>
        <ion-text color="danger" *ngIf="productForm.get('quantity')?.touched && productForm.get('quantity')?.errors?.['min']" class="ion-padding-start">
          La cantidad debe ser mayor a 0
        </ion-text>
  
        <ion-item>
          <ion-label position="stacked">Precio <ion-text color="danger">*</ion-text></ion-label>
          <ion-input formControlName="price" type="number" placeholder="Ej: 25.50"></ion-input>
        </ion-item>
        <ion-text color="danger" *ngIf="productForm.get('price')?.touched && productForm.get('price')?.errors?.['required']" class="ion-padding-start">
          El precio es obligatorio
        </ion-text>
        <ion-text color="danger" *ngIf="productForm.get('price')?.touched && productForm.get('price')?.errors?.['min']" class="ion-padding-start">
          El precio debe ser mayor o igual a 0
        </ion-text>
  
        <div class="ion-padding">
          <ion-button expand="block" (click)="guardarCambios(producto.codigo)" [disabled]="productForm.invalid">
            Guardar cambios
          </ion-button>
        </div>
      </form>
    </div>
  </ng-container>
  </ion-content>`,
  styles: [
    `ion-item {
      --padding-start: 0;
      margin-bottom: 8px;
    }

    ion-text[color="danger"] {
      font-size: 12px;
      display: block;
      margin-bottom: 16px;
    }
`],
})
export class FormularioRegistroProductoModalComponent  implements OnInit {
  @Input() producto: any;
  productForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    // Inicializa el formulario
    this.productForm = this.fb.group({
      code: [{ value: '', disabled: true }, Validators.required],
      name: ['', Validators.required],
      brand: ['', Validators.required],
      format: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]],
    });

    if (this.producto) {
      // Carga los datos del producto en el formulario
      this.productForm.patchValue({
        code: this.producto.codigo,
        name: this.producto.nombre,
        brand: this.producto.marca,
        format: this.producto.formato,
        quantity: this.producto.cantidad,
        price: this.producto.precio,
      });
    }
  }

  async guardarCambios(codigo: string) {
    if (this.productForm.valid) {
      const valores = this.productForm.getRawValue();
      const productoActualizado = {
        codigo: valores.code,
        nombre: valores.name,
        marca: valores.brand,
        formato: valores.format,
        cantidad: valores.quantity,
        precio: valores.price
      };
      await this.modalController.dismiss(productoActualizado); // <-- cierra el modal y pasa los datos
      console.log('Producto actualizado:', productoActualizado);
    } else {
      console.error('Formulario inválido');
    }
  }
}
