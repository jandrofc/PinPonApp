import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { ConfigService } from './services/config.service';
import { ConexionBackendService } from './services/conexion-backend.service';
import { LocalNotifications } from '@capacitor/local-notifications';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(
    private configService: ConfigService,
    private conexionBackend: ConexionBackendService
  ) { };
  
  getIPFILE(): string {
    return this.configService.apiUrl;
  }

  async ngOnInit() {
    await FirebaseMessaging.requestPermissions();

    // Registrar el token inicial
    const token = await FirebaseMessaging.getToken();
    this.registrarToken(token.token);

    // Escuchar cambios de token
    FirebaseMessaging.addListener('tokenReceived', (event: { token: string }) => {
      console.log('Nuevo token FCM:', event.token);
      this.registrarToken(event.token);
    });

    FirebaseMessaging.addListener('notificationReceived', async (notification) => {
      console.log('Notificación recibida:', notification);

      // Mostrar notificación local si la app está en primer plano
      await LocalNotifications.schedule({
        notifications: [
          {
            title: notification.notification?.title || 'Notificación',
            body: notification.notification?.body || '',
            id: Date.now(),
            schedule: { at: new Date(Date.now()) },
          }
        ]
      });
    });
  }

  private registrarToken(token: string) {
    this.conexionBackend.registrarFcmToken(token).subscribe({
      next: (res) => console.log('Token registrado:', res),
      error: (err) => console.error('Error registrando token:', err)
    });
  }
}