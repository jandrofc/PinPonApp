import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: any = null;

  constructor(private http: HttpClient) {}

  async loadConfig(): Promise<void> {
    try {
      this.config = await firstValueFrom(this.http.get('/assets/config.json'));
    } catch (error) {
      console.error('Error loading config:', error);
      // Fallback a la URL por defecto
      this.config = { apiUrl: 'http://localhost:3000/api/' };
    }
  }

  get apiUrl(): string {
    return this.config?.apiUrl || 'http://localhost:3000/api/';
  }
}
