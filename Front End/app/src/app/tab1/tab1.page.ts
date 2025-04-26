import { Component, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface Producto {
  id: number;
  nombre: string;
  cantidad: number;
  fecha: string;
  imagen: string;
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, FormsModule, CommonModule, ExploreContainerComponent],
})
export class Tab1Page {
  constructor() {}
  productos: Producto[] = [
    {
      id: 1,
      nombre: 'Doritos',
      cantidad: 5,
      fecha: '12/10/2021',
      imagen: 'assets/images/placeholder.svg',
    },
    {
      id: 2,
      nombre: 'Bebida',
      cantidad: 10,
      fecha: '12/10/2021',
      imagen: 'assets/images/placeholder.svg',
    },
    {
      id: 3,
      nombre: 'Bebida 2',
      cantidad: 7,
      fecha: '12/10/2021',
      imagen: 'assets/images/placeholder.svg',
    },
  ];

  searchQuery: string = '';

  get filteredProducts() {
    return this.productos.filter(producto =>
      producto.nombre.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }
}

