import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponent } from 'src/app/explore-container/explore-container.component';
import { TabsPage } from 'src/app/tabs/tabs.page';
import { RouterModule } from '@angular/router';
import { ConexionBackendService} from 'src/app/services/conexion-backend.service'; // Importa la función getData desde el servicio

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, RouterModule]
})
export class MenuPage implements OnInit {

  constructor(private apiService: ConexionBackendService) { }

  ngOnInit() {
    this.obtenerDatos();
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
