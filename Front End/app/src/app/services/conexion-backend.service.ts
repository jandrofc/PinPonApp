import { Injectable } from '@angular/core';
import { HttpClient ,HttpErrorResponse } from '@angular/common/http';
import { Observable , catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConexionBackendService {

  // Mejor práctica: Considera usar environment variables para la URL
  private apiUrl = 'http://localhost:3000/test-db/';

  constructor(private http: HttpClient) { }

  // Método GET genérico
  getData(endpoint: string): Observable<any> {
    return this.http.get(`${this.apiUrl}${endpoint}`).pipe(
      catchError(this.handleError)
    );
  }

  // Método POST de ejemplo
  postData(endpoint: string, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}${endpoint}`, data).pipe(
      catchError(this.handleError)
    );
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
