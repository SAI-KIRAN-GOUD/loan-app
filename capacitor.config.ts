import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.loanmaster.app',
  appName: 'LoanMaster',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    errorPath: 'index.html'
  }
};

export default config;
