import { Injectable } from '@angular/core';

// Servicio para manejar modales, alertas, popovers y loading en Ionic 
// https://ionicframework.com/docs/api/alert
// https://ionicframework.com/docs/api/modal


// Controladores para modificar los modales, alertas, popovers y loading
import {
  
  
  AlertController,  // crea Mensajes emergentes
  LoadingController,  // crea mensajes de carga
  ModalController,    // crea ventanas sobrepuestas
  PopoverController,   // crea popovers
} from '@ionic/angular';


// Se usa para definir las opciones de los modales, alertas, popovers y loading
import {
  AlertOptions,
  LoadingOptions,
  ModalOptions,
  PopoverOptions,
} from '@ionic/core';




@Injectable({
  providedIn: 'root'
})
export class OutputsEmergentesService {

  constructor(
    // variables de clase para los controladores de Ionic
    private alertController: AlertController, 
    private loadingController: LoadingController, 
    private modalController: ModalController, 
    private popoverController: PopoverController

  ) { }


  /*  Funcion que cierra el modal que se esta bien
      EJEMPLO DE USO
      await this.modalService.dismissModal({ result: 'success' });
  */

  public async dismissModal(data?: any): Promise<boolean> {
    return this.modalController.dismiss(data);
  }




  /* Funcion que muestra una alerta al usuario
     EJEMPLO DE USO
     await this.modalService.showAlert({
      header: 'Confirmación',
      message: '¿Estás seguro?',
      buttons: ['Cancelar', 'OK']
     });
  */
  public async showAlert(opts?: AlertOptions): Promise<HTMLIonAlertElement> {
    const alert = await this.alertController.create(opts);
    await alert.present();
    return alert;
  }







  /* 
  Funcion que muestra una alerta de error al usuario

  LOS PARAMETROS SON OPCIONALES Y SI SE PASAN, SOBRESCRIBEN LOS VALORES POR DEFECTO
  EJEMPLO DE USO
  await this.modalService.showErrorAlert({
    message: 'Ha ocurrido un error',
  });
  -> Mostarara la alerta con el mensaje "Ha ocurrido un error" y ocupara el header por defecto "Error" y el boton por defecto "OK"

  EJEMPLO DE USO 2
  await this.modalService.showErrorAlert({
    header: 'Error de conexión',
    message: 'No se pudo conectar al servidor',
    buttons: ['Reintentar']
  });
  -> Mostarara la alerta con el mensaje "No se pudo conectar al servidor" y ocupara el header "Error de conexión" y el boton "Reintentar" que se definio
  */

  public async showErrorAlert(
    opts?: AlertOptions,
  ): Promise<HTMLIonAlertElement> {
    const defaultOpts: AlertOptions = {
      header: 'Error',
      buttons: ['OK'],
    };
    opts = { ...defaultOpts, ...opts };
    return this.showAlert(opts);
  }




  /* 
    Funcion que muestra un modal al usuario / COMO EL DEL QR
    LOS PARAMETROS SON OBLIGATORIOS
    EJEMPLO DE USO
    const modal = await this.dialogService.showModal({
      component: MiComponenteModal,
      componentProps: { data: 'algunos datos' }
    });

    // Escuchar cuando se cierre
    modal.onDidDismiss().then(result => {
      console.log('Modal cerrado:', result.data);
    });

  */

  public async showModal(opts: ModalOptions): Promise<HTMLIonModalElement> {
    const modal = await this.modalController.create(opts);
    await modal.present();
    return modal;
  }



  /* 
    Funcion que muestra un popover al usuario
    // https://ionicframework.com/docs/api/popover
  */

  public async showPopover(
    opts: PopoverOptions,
  ): Promise<HTMLIonPopoverElement> {
    const popover = await this.popoverController.create(opts);
    await popover.present();
    return popover;
  }



  /* 
    Funcion que muestra un loading al usuario
    LOS PARAMETROS SON OPCIONALES Y SI SE PASAN, SOBRESCRIBEN LOS VALORES POR DEFECTO
    EJEMPLO DE USO
    await this.modalService.showLoading({
      message: 'Cargando...',
      duration: 2000,
    });
    -> Mostarara la alerta con el mensaje "Cargando..." y durara 2 segundos
    EJEMPLO DE USO 2
    const loading = await this.dialogService.showLoading({
      message: 'Cargando datos...'
    });

    // Hacer operación larga
    await this.dataService.fetchData();

    // Cerrar loading
    await loading.dismiss();

  */

  public async showLoading(
    opts?: LoadingOptions,
  ): Promise<HTMLIonLoadingElement> {
    const defaultOpts: LoadingOptions = {
      message: 'Please wait...',
    };
    opts = { ...defaultOpts, ...opts };
    const loading = await this.loadingController.create(opts);
    await loading.present();
    return loading;
  }
}
