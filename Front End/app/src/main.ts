import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';


import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// Modulos para opbtener el http del server, para obtener la ip local del server, y el inicializador de carga de configuracion
import { ConfigService } from './app/services/config.service';
import { APP_INITIALIZER } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

// Modulos para el manejo de errores visibles como popups
import { ManejadorErroresService } from './app/services/manejador-errores/manejador-errores.service';
import { ErrorHandler } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { importProvidersFrom } from '@angular/core';

// Cambia el formato de la informacion a como se usa en chile
import { registerLocaleData } from '@angular/common';
import localeEsCL from '@angular/common/locales/es-CL';
registerLocaleData(localeEsCL);
import { LOCALE_ID } from '@angular/core';
import { defineCustomElements } from '@ionic/pwa-elements/loader';

defineCustomElements(window);

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    importProvidersFrom(IonicModule.forRoot()),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(),
    {
      provide: APP_INITIALIZER,
      useFactory: (configService: ConfigService) => () => configService.loadConfig(),
      deps: [ConfigService],
      multi: true,
    },
    {
      provide: ErrorHandler,
      useClass: ManejadorErroresService,
    },
    { provide: LOCALE_ID, useValue: 'es-CL' }
  ],
});
