import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { ConfigService } from './services/config.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(
      private configService: ConfigService
    ) { };
  
    getIPFILE(): string {
      return this.configService.apiUrl;
    }

  async ngOnInit() {
    FirebaseMessaging.requestPermissions().then(() => {
    FirebaseMessaging.getToken().then(token => {
      console.log('FCM Token:', token.token);
      fetch(`${this.getIPFILE()}post/fcm_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token.token, usuario_id: 123 })
    });
  });
  });

  FirebaseMessaging.addListener('notificationReceived', (notification) => {
    console.log('Notificación recibida:', notification);
  });
}}