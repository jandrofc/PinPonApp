import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { ConexionBackendService } from './services/conexion-backend.service';
import { LocalNotifications } from '@capacitor/local-notifications';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent  {
  constructor(
    private conexionBackend: ConexionBackendService
  ) { };



  async ngOnInit() {
    
    
    await FirebaseMessaging.requestPermissions();
    await LocalNotifications.requestPermissions();

    // Registrar el token inicial
    const token = await FirebaseMessaging.getToken();
    this.registrarToken(token.token);

    // Escuchar cambios de token
    FirebaseMessaging.addListener('tokenReceived', (event: { token: string }) => {
      console.log('Nuevo token FCM:', event.token);
      this.registrarToken(event.token);
    });

    FirebaseMessaging.addListener('notificationReceived', async (notification) => {
      // Envía el log al backend
      console.log("notificacion recibida")
      console.log(notification)
      this.conexionBackend.enviarLog(notification).subscribe();

      // Mostrar notificación local si la app está en primer plano
      await LocalNotifications.schedule({
        notifications: [
          {
            title: notification.notification?.title || 'Notificación',
            body: notification.notification?.body || '',
            id: Math.floor(Date.now() / 1000),
            schedule: { at: new Date(Date.now()+1000) },
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
