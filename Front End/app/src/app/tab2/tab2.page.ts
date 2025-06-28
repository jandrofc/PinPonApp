import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Módulo común de Angular
import { IonicModule } from '@ionic/angular';


import { ListaVentasModalComponent } from '../modales/lista-ventas-modal/lista-ventas-modal.component';
import { ModalController } from '@ionic/angular'; // Importa ModalController para manejar modales
import { OutputsEmergentesService } from '../services/outputs-emergentes/outputs-emergentes.service';
import { ConexionBackendService } from '../services/conexion-backend.service';
import { GraficosComponent } from '../modales/graficos/graficos.component';
import { Ipv4Component } from '../modales/ipv4/ipv4.component';
import { addIcons  } from 'ionicons';
import { sadOutline, settings} from 'ionicons/icons'
import { ReportesComponent } from '../modales/reportes/reportes.component';

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



export interface ProductoBoleta {
  nombre: string;
  cantidad: number;
}

export interface Boleta {
  id: number;
  fecha: string;
  total: number;
  productos: ProductoBoleta[];
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [ CommonModule, IonicModule ]
})
export class Tab2Page implements OnInit{

  boletas: Boleta[] = []; // Almacena las últimas 3 boletas
  totalVentas: number = 0;
  productosVendidos: number = 0;
  conexionExitosa: boolean = true; // Nueva propiedad para el estado de la conexión

  constructor(
    private readonly outputsEmergentesService: OutputsEmergentesService,
    private modalController: ModalController,
    private conexionBackend: ConexionBackendService
  ) {addIcons({
        'settings': settings,
        "sad-outline": sadOutline
      });
    }


  today_sales: today_sales | null= null




  today_products: today_products | null = null


  // Contiene los ultimos 3 productos vendidos
  lastThreeProducts : ProductsHoy[] | null = null
  cargandoDatos: boolean = true
  
  async ngOnInit() {
    // ngOnInit puede quedar vacío ya que la lógica de carga y auto-refresh se mueve a ionViewDidEnter
  }

  async ionViewDidEnter() {
    // obtener
    this.cargandoDatos= true
    this.obtenerUltimasBoletas()

    this.conexionBackend.getTotalVentasHoy().subscribe({
    next: (res) => this.totalVentas = res.total,
    error: (err) => console.error('Error obteniendo total del día', err)
    });

    this.conexionBackend.getCantidadProductosVendidosHoy().subscribe({
    next: (res) => this.productosVendidos = res.total,
    error: (err) => console.error('Error al obtener cantidad de productos vendidos', err)
    });

  }

async ipv4_modal(){
  const modal = await this.modalController.create({
        component: Ipv4Component
      });
      await modal.present();
    }





  async mostrar_lista_ventas(){
    const modal = await this.modalController.create({
      component: ListaVentasModalComponent
    });
    await modal.present();
  }

  async mostrar_dashboard_ventas(){
    const modal = await this.modalController.create({
      component: GraficosComponent
    });
    await modal.present();
  }



  async obtenerUltimasBoletas() {
    this.conexionBackend.getUltimas3boletas('ultimas_boletas').subscribe({
      next: (data) => {
        console.log('Datos recibidos:', data);
        this.boletas = data.boletas;
        console.log('Boletas recibidas:', this.boletas);
        this.cargandoDatos=false
        this.conexionExitosa = true; // Conexión exitosa
      },
      error: (err) => {
        console.error('Error al obtener boletas:', err);
        this.conexionExitosa = false; // Error de conexión
        this.cargandoDatos = false; // Detener el spinner aunque haya error
      }
    });
  }
  getNombresProductosConcatenados(boleta: Boleta): string {
  return boleta.productos.map(p => p.nombre).join(', ');
}


async modal_reportes(){
    const modal = await this.modalController.create({
      component: ReportesComponent
    });
    await modal.present();
  }

}
