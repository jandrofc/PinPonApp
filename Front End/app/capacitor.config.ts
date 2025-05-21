import { CapacitorConfig } from '@capacitor/cli';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'smart-home-app',
  webDir: 'www',
  server: {
    androidScheme: 'http',
    cleartext: true,
  },
  android: {
    allowMixedContent: true 
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
    MLKitBarcodeScanner: {
      cameraFacing: 'back',
      // Añade esto para compatibilidad con versiones antiguas:
      formatsAllowed: ['ALL_FORMATS'],
      lensFacing: 'back'
    },
  }
};

export default config;