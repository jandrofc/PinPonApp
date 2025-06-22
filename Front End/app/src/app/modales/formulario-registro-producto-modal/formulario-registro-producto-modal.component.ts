import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {  arrowBack, search, notifications, camera, bag, cubeOutline, cartOutline, barChartOutline, createOutline, trashOutline, trendingUp, trendingDown, logoUsd, alertCircleOutline, informationCircle, barcodeOutline, documentTextOutline, pricetagOutline, alertCircle, businessOutline, resizeOutline, layersOutline, warningOutline, cashOutline, cardOutline, save, close } from 'ionicons/icons';
import { ConexionBackendService } from 'src/app/services/conexion-backend.service';
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
    private modalController: ModalController,
    private conexionBackend: ConexionBackendService // Inyecta el servicio aquí
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

    if (this.producto && this.producto.codigo) {
      // Llama a onCodigoEscaneado automáticamente para llenar los datos si hay producto
      this.onCodigoEscaneado(this.producto.codigo);
    }
  }

  // Método para buscar producto por código y llenar el formulario
  onCodigoEscaneado(codigo: string) {
  this.conexionBackend.getProductoPorCodigo(codigo).subscribe({
    next: (resp) => {
      if (resp && resp.producto) {
        const producto = resp.producto;
        this.productForm.patchValue({
          code: producto.codigo_barra,
          name: producto.nombre_producto,
          brand: producto.marca,
          format: producto.formato,
          price: producto.precio,
          stock_min: producto.stock_min ?? 1
        });
        this.productForm.patchValue({ quantity: '' });
      } else {
        this.productForm.reset();
        this.productForm.patchValue({ code: codigo, quantity: '' });
      }
    },
    error: (err) => {
      this.productForm.reset();
      this.productForm.patchValue({ code: codigo, quantity: '' });
    }
  });
}
  async guardarCambios() {
  if (this.productForm.valid) {
    const valores = this.productForm.getRawValue();
    // Solo envía la cantidad a agregar y los datos necesarios
    const productoActualizado = {
      codigo: valores.code,
      nombre: valores.name,
      marca: valores.brand,
      formato: valores.format,
      cantidad: valores.quantity, // cantidad a agregar
      precio: valores.price,
      stock_min: valores.stock_min
    };
    await this.modalController.dismiss(productoActualizado);
    console.log('Producto actualizado:', productoActualizado);
  } else {
    console.error('Formulario inválido');
  }
}

  async cancelarEdicion() {
    await this.modalController.dismiss(null); // Cierra el modal sin pasar datos
  }

}
