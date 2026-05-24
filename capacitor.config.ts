import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.quantumshield.app',
  appName: 'QuantumShield',
  webDir: 'out',           // Next.js static export output dir
  server: {
    // Production Vercel deployment — API routes work server-side here
    // Update to custom domain once quantumshield.in is configured in Vercel
    url: 'https://quantumguard.vercel.app',
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
