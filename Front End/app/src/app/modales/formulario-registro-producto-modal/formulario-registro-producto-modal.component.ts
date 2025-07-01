import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {  arrowBack, search, notifications, camera, bag, cubeOutline, cartOutline, barChartOutline, createOutline, trashOutline, trendingUp, trendingDown, logoUsd, alertCircleOutline, informationCircle, barcodeOutline, documentTextOutline, pricetagOutline, alertCircle, businessOutline, resizeOutline, layersOutline, warningOutline, cashOutline, cardOutline, save, close, imageOutline, image } from 'ionicons/icons';
import { ConexionBackendService } from 'src/app/services/conexion-backend.service';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { ActionSheetController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-formulario-registro-producto-modal',
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  templateUrl: './formulario-registro-producto-modal.component.html',
  styleUrls: ['./formulario-registro-producto-modal.component.scss']
})

export class FormularioRegistroProductoModalComponent  implements OnInit {
  @Input() producto: any;
  productForm!: FormGroup;
  imagePreview: string | null = null;
  selectedImageUrl: string | null = null;
  isUploading = false;

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController,
    private conexionBackend: ConexionBackendService, // Inyecta el servicio aquí
    private actionSheetController: ActionSheetController
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
          "close":close,
          "image-outline":imageOutline,
          "image":image
        });
   }

   async selectImage() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Seleccionar imagen',
      buttons: [
        {
          text: 'Tomar foto',
          icon: 'camera',
          handler: () => {
            this.takePicture(CameraSource.Camera);
          }
        },
        {
          text: 'Elegir de galería',
          icon: 'images',
          handler: () => {
            this.takePicture(CameraSource.Photos);
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  private async takePicture(source: CameraSource) {
    try {
      this.isUploading = true;

      const image = await Camera.getPhoto({
        quality: 70,
        allowEditing: true, // Permite recortar la imagen
        resultType: CameraResultType.Base64,
        source: source,
        width: 600,
        height: 600,
        correctOrientation: true // Corrige la orientación automáticamente
      });

      if (image.base64String) {
        // Mostrar preview inmediato
        this.imagePreview = `data:image/jpeg;base64,${image.base64String}`;
        
        // Subir al servidor
        await this.uploadImageToServer(image.base64String, 'image/jpeg');
      }
    } catch (error) {
      console.error('Error capturando imagen:', error);
      
      // Manejar error de permisos o cancelación
      if (error === 'User cancelled photos app') {
        // Usuario canceló, no mostrar error
        return;
      }
      
      // Mostrar mensaje de error
      this.showErrorMessage('Error al capturar imagen. Verifica los permisos de cámara.');
    } finally {
      this.isUploading = false;
    }
  }

  private async uploadImageToServer(base64Data: string, mimeType: string): Promise<void> {
    try {
      // Convertir base64 a blob
      const response = await fetch(`data:${mimeType};base64,${base64Data}`);
      const blob = await response.blob();
      
      // Crear FormData
      const formData = new FormData();
      formData.append('imagen', blob, `${this.producto?.codigo || Date.now()}.jpg`);
      formData.append('codigo_barra', this.producto?.codigo || '');

      // Subir usando fetch
      const baseUrl = this.conexionBackend.getIPFILE().replace('/api/', '');
      const uploadResponse = await fetch(`${baseUrl}/upload/imagen-producto`, {
        method: 'POST',
        body: formData
      });

      if (uploadResponse.ok) {
        const result = await uploadResponse.json();
        this.selectedImageUrl = result.imageUrl;
        console.log('Imagen subida:', result.imageUrl);
      } else {
        throw new Error('Error subiendo imagen');
      }
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      this.imagePreview = null;
      this.showErrorMessage('Error subiendo imagen al servidor');
    }
  }

  private showErrorMessage(message: string) {
    // Aquí puedes usar tu servicio de alertas
    console.error(message);
    // Ejemplo: this.outputsEmergentesService.showErrorAlert({...});
  }

  removeImage() {
    // Si hay una imagen ya subida, eliminarla del servidor
    if (this.selectedImageUrl && this.selectedImageUrl !== this.producto?.imagen_url) {
      const filename = this.selectedImageUrl.split('/').pop();
      fetch(`${this.conexionBackend.getIPFILE()}delete/imagen-producto/${filename}`, {
        method: 'DELETE'
      }).catch(err => console.error('Error eliminando imagen:', err));
    }
    
    this.imagePreview = null;
    this.selectedImageUrl = null;
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

    // Si hay producto, llenar el formulario con los datos actuales (no consultar backend)
    if (this.producto) {
      this.productForm.patchValue({
        code: this.producto.codigo,
        name: this.producto.nombre,
        brand: this.producto.marca,
        format: this.producto.formato,
        quantity: this.producto.cantidad ?? 1,
        price: this.producto.precio ?? 0,
        stock_min: this.producto.stock_min ?? 1
      });
    }

    // Si el producto ya tiene imagen, mostrarla
    if (this.producto?.imagen_url) {
      this.selectedImageUrl = this.producto.imagen_url;
      this.imagePreview = `${this.conexionBackend.getIPFILE().replace('/api/', '')}${this.producto.imagen_url}`;
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
      stock_min: valores.stock_min,
      nuevo: this.producto?.nuevo ?? false,
      existente: this.producto?.existente ?? 0, // Preserva el valor original
      imagen_url: this.selectedImageUrl
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
