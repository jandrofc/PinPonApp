import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { CameraScannerModalComponent } from '../modales/camera-scanner-modal/camera-scanner-modal.component';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { OutputsEmergentesService } from '../services/outputs-emergentes/outputs-emergentes.service';
import { ConexionBackendService } from '../services/conexion-backend.service';
import { Ipv4Component } from '../modales/ipv4/ipv4.component';
import { addIcons  } from 'ionicons';
import { settings} from 'ionicons/icons'
@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, CommonModule],
})

export class Tab3Page {
  ultimosEscaneos: { [codigo: string]: number } = {};
  productosEscaneados: any[] = [];

  constructor(
    private modalController: ModalController,
    private http: HttpClient,
    private outputs: OutputsEmergentesService,
    private apiService: ConexionBackendService
  ) {addIcons({
        'settings': settings,
      });}

async ipv4_modal(){
  const modal = await this.modalController.create({
        component: Ipv4Component
      });
      await modal.present();
    }



async abrirScanner() {
  const modal = await this.modalController.create({
    component: CameraScannerModalComponent,
    cssClass: 'barcode-scanning-modal',
    showBackdrop: false,
    animated: false
  });
  await modal.present();

  const { data } = await modal.onWillDismiss();
  const barcode = data?.barcode?.rawValue;
  const ahora = Date.now();

  console.log('Código de producto escaneado:', barcode);

  if (barcode) {
    const ultimo = this.ultimosEscaneos[barcode] || 0;

    this.apiService.registrarProductoPorcodigo('get/producto_por_codigo/', barcode).subscribe({
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
      error: err => {
        throw err;
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
    precio: p.precio // Asegúrate de incluir el precio porque el backend lo necesita
  }));

  this.apiService.realizarCompra('post/realizar_compra', { productos }).subscribe({
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
        message: 'Error al realizar la compra: ' + (err.error?.error || ''),
      });
    }
  });
}
}
