import { CapacitorConfig } from '@capacitor/cli';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'www.PINPON.PINPON',
  appName: 'Pinpon',
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
  }
};

export default config;