import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.quantumshield.app',
  appName: 'QuantumShield',
  webDir: 'out',           // Next.js static export output dir
  server: {
    // Point to live site so API routes work in the APK
    url: 'https://quantumshield.in',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#000000',
    overScrollMode: 'never',
  },
  ios: {
    backgroundColor: '#000000',
    scrollEnabled: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#000000',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
