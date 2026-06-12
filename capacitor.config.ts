import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.quantumshield.app',
  appName: 'QuantumShield',
  webDir: 'out',           // Next.js static export (npm run build:android)
  // The app is fully bundled in the APK — no remote server.url.
  // API calls go to the production deployment via src/lib/apiBase.ts.
  server: {
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#000000',
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
