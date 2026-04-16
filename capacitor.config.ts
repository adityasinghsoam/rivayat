import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aditya.riwayat',
  appName: 'riwayat',
  webDir: 'public',

  server: {
    url: 'rivayat-alpha.vercel.app',
    cleartext: true,
    androidScheme: 'https'
  }
};

export default config;