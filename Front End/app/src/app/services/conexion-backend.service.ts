import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConexionBackendService {

  constructor(private http: HttpClient) { }

  // URL del backend
  private urlBackend: string = 'http://localhost:3000/test-db/'; // Cambia esto por la URL de tu backend

  // Método para obtener el JSON desde el backend
  getData(): Observable<any> {
    return this.http.get<any>(this.urlBackend);
  }
}
