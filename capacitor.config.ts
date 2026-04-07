import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.puujee.visa',
  appName: 'VISA',
  webDir: 'out',
  server: {
    url: 'https://visa-nu-nine.vercel.app/', // Use 10.0.2.2:3000 for Android emulator, or 192.168.x.x:3000 for physical device
    cleartext: true
  }
};

export default config;
