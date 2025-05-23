import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { addIcons } from 'ionicons';
import { addOutline, removeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-scan-inventario',
  templateUrl: './scan-inventario.page.html',
  styleUrls: ['./scan-inventario.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ScanInventarioPage implements OnInit {

  scannedProducts: any[] = [];

  constructor(private route: ActivatedRoute) {
    addIcons({ addOutline, removeOutline });
   }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['scannedProducts']) {
        this.scannedProducts = JSON.parse(params['scannedProducts']);
      }
  });
  }

  disminuirCantidad(id: string) {
    const producto = this.scannedProducts.find(p => p.id === id);
    if (producto && producto.quantity > 0) {
      producto.quantity--;
    }
  }

  aumentarCantidad(id: string) {
    const producto = this.scannedProducts.find(p => p.id === id);
    if (producto) {
      producto.quantity++;
    }
  }
}
