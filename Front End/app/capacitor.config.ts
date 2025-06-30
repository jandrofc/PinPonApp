import { CapacitorConfig } from '@capacitor/cli';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import { permission } from 'process';

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
    Camera: {
      permissions: ['camera', 'photos']
    }
  }
};

export default config;