import { Injectable } from '@angular/core';
import { HttpClient ,HttpErrorResponse } from '@angular/common/http';
import { Observable , catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ConfigService } from './config.service';

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
    );
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



  // Manejo de errores
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error desconocido';
    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      errorMessage = `Código: ${error.status}\nMensaje: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
