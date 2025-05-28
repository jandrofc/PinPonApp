import { Injectable } from '@angular/core';

// SERVICIO QUE MANEJA LOS ERRORES DE LA APLICACION
// TIENE QUE ESTAR REGISTRADO EN EL MAIN.TS PARA QUE TODA LA APLICACION LO USE



// EXPLICAR QUE ES UN ERROR HANDLER
import { ErrorHandler} from '@angular/core';


/* IMPORTAMOS EL INJECTOR PARA INYECTAR EL SERVICIO DE OUTPUTS EMERGENTES



*/
import { Injector } from '@angular/core';

// Importamos el servicio de OutputsEmergentesService para mostrar mensajes de error de este servicio
import { OutputsEmergentesService } from '../outputs-emergentes/outputs-emergentes.service';

// La consola y logs de errores mostraran este string al momento de ocurrir errores
const LOGTAG = 'ManejadorErroresService: ';


@Injectable({
  providedIn: 'root'
})
export class ManejadorErroresService implements ErrorHandler {


  // Constructor del inyector para inyectar el servicio de OutputsEmergentesService
  constructor(private injector: Injector) { }


  // Implementamos el método handleError de la interfaz ErrorHandler implementada en el componente
  public handleError(error: unknown): void {
    this.handle(error);
  }

  // Obtiene el mensaje de error y lo muestra en un alert al usuario
  // Si no se puede mostrar el mensaje, lo muestra en la consola
  private async handle(error: unknown): Promise<void> {
    try {
      console.error(error);
      const message = this.getMessageFromUnknownError(error);
      await this.showErrorAlert(message);
    } catch (errorHandlerError) {
      console.error(`${LOGTAG} Internal exception:`, errorHandlerError);
    }
  }



  /*
    Obtiene el mensaje de error a partir del error desconocido
    Si el error es un objeto y tiene la propiedad 'rejection', se obtiene el mensaje de error de la propiedad 'rejection' (por ejemplo, en el caso de un error de promesa)
    Si el error es una instancia de Error y tiene la propiedad 'message', se obtiene el mensaje de error de la propiedad 'message' (por ejemplo, en el caso de un error de js)
    Si el error no es un objeto o no tiene la propiedad 'message', se devuelve un mensaje de error por defecto

    // Error estándar
      new Error('Algo salió mal') 
      // → message = 'Algo salió mal'

      // Error HTTP
      new HttpErrorResponse({...}) 
      // → message = mensaje del response

      // String como error
      throw 'Error simple'
      // → message = 'An unknown error has occurred.'

      // Objeto personalizado
      throw { codigo: 500, detalle: 'Server error' }
      // → message = 'An unknown error has occurred.'
  */
  private getMessageFromUnknownError(error: unknown): string {
    let message = 'An unknown error has occurred.';
    if (error instanceof Object && 'rejection' in error) {
      error = (error as any).rejection;
    }
    if (error instanceof Error && error.message) {
      message = error.message;
    }
    return message;
  }



  // Muestra un alert de error al usuario
  // Carga el servicio OutputsEmergentesService solo cuando se necesita
  private async showErrorAlert(message: string): Promise<void> {
    const dialogService: OutputsEmergentesService =
      this.injector.get<OutputsEmergentesService>(OutputsEmergentesService);
    await dialogService.showErrorAlert({ message });
  }

}
