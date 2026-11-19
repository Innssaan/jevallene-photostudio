import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "id.my.innssaan.jevallene",
  appName: "Jevallene PhotoStudio App",
  webDir: "www",
  server: {
    url: "https://jevallene-photostudio.vercel.app?app=android",
    cleartext: false,
  },
  android: {
    appendUserAgent: "JevalleneAndroidApp",
    backgroundColor: "#0B0B0E",
    allowMixedContent: false,
  },
};

export default config;
