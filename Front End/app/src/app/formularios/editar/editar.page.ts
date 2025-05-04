import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonList, IonLabel, IonButton} from '@ionic/angular/standalone';



@Component({
  selector: 'app-editar',
  templateUrl: './editar.page.html',
  styleUrls: ['./editar.page.scss'],
  standalone: true,
  imports: [IonItem, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,IonList,IonLabel,IonButton]
})
export class EditarPage implements OnInit {
  producto = {
    nombre_producto: '',
    marca: '',
    cantidad: null,
    precio: null,
    formato: '',
    imagen: ''
  };

  constructor() { }

  ngOnInit() {
  }

  guardarCambios() {
    console.log('Producto actualizado:', this.producto);
    // Aquí puedes llamar a un servicio para guardar los cambios en el backend
  }

}
