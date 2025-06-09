import { Injectable } from '@angular/core';
import { HttpClient ,HttpErrorResponse } from '@angular/common/http';
import { Observable , catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ConfigService } from './config.service';

// Update the path below if the file is located elsewhere or has a different extension (e.g., .ts)
import { RespuestaAPI } from '../modelos/ventas.interfaces';



@Injectable({
  providedIn: 'root'
})
export class ConexionBackendService {
  


  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) { };

  getIPFILE(): string {
    return this.configService.apiUrl;
  }


  // Método GET genérico
  getListaProducto(endponit: string = "", orden: string = 'asc'): Observable<any> {
    // Construir la URL completa
    console.log(this.configService.apiUrl);
    const url = `${this.configService.apiUrl}${endponit}`; // URL del endpoint
    const params = {   orden }; // Parámetros de consulta
    return this.http.get(url, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getBoletas(filtro_producto: string, filtro_fecha: string){
    const api = `${this.configService.apiUrl}get/ventas_con_detalles`;
    const params = { filtro_producto, filtro_fecha}; // Convert Date to stringa}

    return this.http.get<RespuestaAPI>(api,{params}).pipe(
      catchError(this.handleError)
    )
  }
  getProductos(filtro_producto: string, filtro_fecha: string){
    const api = `${this.configService.apiUrl}get/productos_mas_vendidos`;
    const params = { filtro_producto, filtro_fecha}; // Convert Date to stringa}

    return this.http.get<RespuestaAPI>(api,{params}).pipe(
      catchError(this.handleError)
    )
  }




  // Método POST de ejemplo
  postData(endpoint: string, data: any): Observable<any> {
    return this.http.post(`${this.configService.apiUrl}${endpoint}`, data).pipe(
      catchError(this.handleError)
    );
  }

   // Método PUT genérico
   putData(endpoint: string, data: any): Observable<any> {
    return this.http.put(`${this.configService.apiUrl}${endpoint}`, data)
      .pipe(catchError(this.handleError));
  }

  validarCodigoBarra(codigo: string): Observable<any> {
    return this.http.get(`${this.configService.apiUrl}/validar-codigo/${codigo}`);
  }

  deshabilitarFormato(endpoint: string, idFormato: number): Observable<any> {
    return this.http
      .patch(`${this.configService.apiUrl}${endpoint}${idFormato}`, {})
      .pipe(catchError(this.handleError));
  }

  // Método para registrar uno o varios productos
  registrarProductos(productos: any | any[]): Observable<any> {
  return this.http.post(`${this.configService.apiUrl}post/producto`, productos)
    .pipe(catchError(this.handleError));
}

  registrarProductoPorcodigo(endPoint: string, codigo: string): Observable<any> {
    return this.http.get(`${this.configService.apiUrl}${endPoint}${ codigo }`)
      .pipe(catchError(this.handleError));
  }

  realizarCompra(endPoint: string, compra: any): Observable<any> {
    return this.http.post(`${this.configService.apiUrl}${endPoint}`, compra)
      .pipe(catchError(this.handleError));
  }

  enviarLog(log: any) {
    return this.http.post(`${this.configService.apiUrl}log`, { log });
  }


// Metodo para registrar un token FCM (para notificaciones push)
  registrarFcmToken(token: string): Observable<any> {
    return this.http.post(`${this.configService.apiUrl}post/fcm_token`, { token })
      .pipe(catchError(this.handleError));
}

  // Manejo de errores
  private handleError = (error: any) => {
    let errorMessage = 'Error desconocido';
    let errorType = 'UNKNOWN_ERROR';

    console.error('Error completo:', error);

    // ✅ Error de timeout
    if (error.name === 'TimeoutError') {
      errorMessage = 'El servidor no responde. Verifique el estado del servidor e intenta nuevamente.';
      errorType = 'TIMEOUT_ERROR';
    }
    // ✅ Error de red (sin respuesta del servidor)
    else if (error instanceof HttpErrorResponse) {
      // Sin conexión o servidor no disponible
      if (error.status === 0) {
        errorMessage = 'No se pudo conectar al servidor. Verifique el estado del servidor e intenta nuevamente.';
        errorType = 'NETWORK_ERROR';
      }
      // Error del cliente (4xx)
      else if (error.status >= 400 && error.status < 500) {
        switch (error.status) {
          case 400:
            errorMessage = 'Solicitud incorrecta. Verifica los datos enviados.';
            errorType = 'BAD_REQUEST';
            break;
          case 401:
            errorMessage = 'No tienes autorización. Inicia sesión nuevamente.';
            errorType = 'UNAUTHORIZED';
            break;
          case 403:
            errorMessage = 'No tienes permisos para realizar esta acción.';
            errorType = 'FORBIDDEN';
            break;
          case 404:
            errorMessage = 'El recurso solicitado no existe.';
            errorType = 'NOT_FOUND';
            break;
          default:
            errorMessage = `Error del cliente: ${error.status} - ${error.message}`;
            errorType = 'CLIENT_ERROR';
        }
      }
      // Error del servidor (5xx)
      else if (error.status >= 500) {
        switch (error.status) {
          case 500:
            errorMessage = 'Error interno del servidor. Intenta más tarde.';
            errorType = 'SERVER_ERROR';
            break;
          case 502:
            errorMessage = 'El servidor no está disponible temporalmente.';
            errorType = 'BAD_GATEWAY';
            break;
          case 503:
            errorMessage = 'Servicio no disponible. Intenta más tarde.';
            errorType = 'SERVICE_UNAVAILABLE';
            break;
          default:
            errorMessage = `Error del servidor: ${error.status} - ${error.message}`;
            errorType = 'SERVER_ERROR';
        }
      }
      // Otros errores HTTP
      else {
        errorMessage = `Error HTTP: ${error.status} - ${error.message}`;
        errorType = 'HTTP_ERROR';
      }
    }
    // ✅ Error de JS/Cliente
    else if (error.error instanceof ErrorEvent) {
      errorMessage = `Error de conexión: ${error.error.message}`;
      errorType = 'CLIENT_ERROR';
    }
    // ✅ Error genérico
    else {
      errorMessage = error.message || 'Ha ocurrido un error inesperado';
      errorType = 'UNKNOWN_ERROR';
    }

    // ✅ Crear error estructurado
    const structuredError = new Error(errorMessage);
    (structuredError as any).type = errorType;
    (structuredError as any).originalError = error;
    (structuredError as any).timestamp = new Date().toISOString();

    console.error(`[${errorType}] ${errorMessage}`);

    return throwError(() => structuredError);
  }
}
