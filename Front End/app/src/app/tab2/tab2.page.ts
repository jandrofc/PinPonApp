import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Módulo común de Angular
import { IonicModule } from '@ionic/angular';


import { ListaVentasModalComponent } from '../modales/lista-ventas-modal/lista-ventas-modal.component';
import { ModalController } from '@ionic/angular'; // Importa ModalController para manejar modales
import { OutputsEmergentesService } from '../services/outputs-emergentes/outputs-emergentes.service';
import { DashboardModalComponent } from '../modales/dashboard-modal/dashboard-modal.component';

export interface today_sales{
  valor_ventas : number
  porcentaje: number
}
export interface today_products{
  cantidad_vendidos: number
  porcentaje: number
}
export interface ProductsHoy{
  nombre: string
  tiempo: Date
  ganancia: number
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [ CommonModule, IonicModule ]
})
export class Tab2Page implements OnInit{

  constructor(
    private readonly outputsEmergentesService: OutputsEmergentesService,
    private modalController: ModalController
  ) {}


  today_sales: today_sales | null= null




  today_products: today_products | null = null


  // Contiene los ultimos 3 productos vendidos
  lastThreeProducts : ProductsHoy[] | null = null

  async ngOnInit() {
    // obtener 
  }







  async mostrar_lista_ventas(){
    const modal = await this.modalController.create({
      component: ListaVentasModalComponent
    });
    await modal.present();
  }

  async mostrar_dashboard_ventas(){
    const modal = await this.modalController.create({
      component: DashboardModalComponent
    });
    await modal.present();
  }





}
