import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: any = null;
  public apiUrl = '';
  constructor(private http: HttpClient) {}

  async loadConfig() {
    // Cargar desde localStorage o archivo

    const savedUrl = localStorage.getItem('apiUrl');
    try {
      this.config = await firstValueFrom(this.http.get('/assets/config.json'));
    } catch (error) {
      console.error('Error loading config:', error);
      // Fallback a la URL por defecto
      this.config = { apiUrl: 'http://localhost:3000/api/' };
    }
    this.apiUrl= savedUrl || this.config?.apiUrl || 'http://localhost:3000/api/';
  }
  setApiUrl(newUrl: string) {
    this.apiUrl = newUrl;
    localStorage.setItem('apiUrl', newUrl);
  }
  









}
