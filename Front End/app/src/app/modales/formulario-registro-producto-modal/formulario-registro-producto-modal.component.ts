import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {  arrowBack, search, notifications, camera, bag, cubeOutline, cartOutline, barChartOutline, createOutline, trashOutline, trendingUp, trendingDown, logoUsd, alertCircleOutline, informationCircle, barcodeOutline, documentTextOutline, pricetagOutline, alertCircle, businessOutline, resizeOutline, layersOutline, warningOutline, cashOutline, cardOutline, save, close } from 'ionicons/icons';
@Component({
  selector: 'app-formulario-registro-producto-modal',
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  templateUrl: './formulario-registro-producto-modal.component.html',
  styleUrls: ['./formulario-registro-producto-modal.component.scss']
})

export class FormularioRegistroProductoModalComponent  implements OnInit {
  @Input() producto: any;
  productForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController
    )
   {
    addIcons({   
          "arrowBack":arrowBack, 
          "search":search, 
          "notifications":notifications, 
          "create-outline":createOutline, 
          "camera":camera , 
          "bag":bag, 
          "cube-outline":cubeOutline ,
          "cart-outline":cartOutline, 
          "barChart-outline":barChartOutline ,
          "trash-outline":trashOutline, 
          "trendingUp":trendingUp, 
          "trendingDown":trendingDown, 
          "logoUsd":logoUsd, 
          "alertCircle-outline":alertCircleOutline, 
          "informationCircle":informationCircle, 
          "barcode-outline":barcodeOutline, 
          "documentText-outline":documentTextOutline, 
          "pricetag-outline":pricetagOutline, 
          "alertCircle":alertCircle, 
          "business-outline":businessOutline, 
          "resize-outline":resizeOutline, 
          "layers-outline":layersOutline, 
          "warning-outline":warningOutline, 
          "cash-outline":cashOutline, 
          "card-outline":cardOutline, 
          "save":save, 
          "close":close });
   }

  ngOnInit() {
    // Inicializa el formulario
    this.productForm = this.fb.group({
      code: [{ value: '', disabled: true }, Validators.required],
      name: ['', Validators.required],
      brand: ['', Validators.required],
      format: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]],
      stock_min: [0, [Validators.required, Validators.min(1)]],
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
        stock_min: this.producto.stock_min
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
        precio: valores.price,
        stock_min: valores.stock_min
      };
      await this.modalController.dismiss(productoActualizado); // <-- cierra el modal y pasa los datos
      console.log('Producto actualizado:', productoActualizado);
    } else {
      console.error('Formulario inválido');
    }
  }

  async cancelarEdicion() {
    await this.modalController.dismiss(null); // Cierra el modal sin pasar datos
  }

}
