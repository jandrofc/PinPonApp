import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CameraScannerModalComponent } from '../modales/camera-scanner-modal/camera-scanner-modal.component';
import { HttpClient } from '@angular/common/http';
import { OutputsEmergentesService } from '../services/outputs-emergentes/outputs-emergentes.service';



import { CommonModule } from '@angular/common'; // Módulo común de Angular
import { IonicModule } from '@ionic/angular';
@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule],
})

export class Tab3Page {
  ultimosEscaneos: { [codigo: string]: number } = {};
  productosEscaneados: any[] = [];
  apiUrl = 'http://localhost:3000/';

  constructor(
    private modalController: ModalController,
    private http: HttpClient,
    private outputs: OutputsEmergentesService
  ) {}

  async abrirScanner() {
    const modal = await this.modalController.create({
      component: CameraScannerModalComponent,
      cssClass: 'barcode-scanning-modal',
      showBackdrop: false,
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    const barcode = data?.barcode?.rawValue;
    const ahora = Date.now();

    console.log('Código de producto escaneado:', barcode);

    if (barcode) {
      const ultimo = this.ultimosEscaneos[barcode] || 0;
      this.http.get<any>(`${this.apiUrl}api/get/producto_por_codigo/${barcode}`).subscribe({
          next: res => {
            const producto = res.producto;
            const existente = this.productosEscaneados.find(p => p.id_formato === producto.id_formato);
            if (existente) {
              existente.cantidad++;
            } else {
              this.productosEscaneados.push({
                id_formato: producto.id_formato,
                nombre: producto.nombre_producto,
                marca: producto.marca,
                formato: producto.formato,
                cantidad: 1,
                precio: producto.precio,
                codigo: producto.codigo_barra
              });
            }
            this.ultimosEscaneos[barcode] = ahora;
          },
          error: async err => {
            await this.outputs.showErrorAlert({
              header: 'Producto no encontrado',
              message: 'El producto escaneado no existe en el inventario.',
              buttons: ['OK']
            });
          }
        });
      }
    }

    sumarCantidad(producto: any) {
      producto.cantidad++;
    }

    restarCantidad(producto: any) {
      if (producto.cantidad > 1) {
        producto.cantidad--;
      }
    }

    getTotal(): number {
    return this.productosEscaneados.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
  }

  realizarCompra() {
  const productos = this.productosEscaneados.map(p => ({
    id_formato: p.id_formato,
    cantidad: p.cantidad,
    precio: p.precio,
  }));

  this.http.post<any>(`${this.apiUrl}api/post/realizar_compra`, { productos }).subscribe({
      next: async res => {
        await this.outputs.showAlert({
          header: '¡Compra realizada!',
          message: 'La compra se realizó correctamente.',
          buttons: ['OK']
        });
        this.productosEscaneados = [];
      },
      error: async err => {
        await this.outputs.showErrorAlert({
          message: 'Error al realizar la compra.',
        });
      }
    });
  }
}