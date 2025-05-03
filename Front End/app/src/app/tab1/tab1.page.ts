import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';



import { ConexionBackendService} from 'src/app/services/conexion-backend.service';

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
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, FormsModule, CommonModule],
})
export class Tab1Page implements OnInit{
  constructor(private apiService: ConexionBackendService) {}


  ngOnInit() {
    this.obtenerDatos();
  }

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


  

  obtenerDatos() {
    this.apiService.getData('')
      .subscribe({
        next: (data) => {
          console.log('Datos recibidos:', data);
          // Maneja los datos aquÃ
        },
        error: (err) => {
          console.error('Error al obtener datos:', err);
        }
      });
  }
}

