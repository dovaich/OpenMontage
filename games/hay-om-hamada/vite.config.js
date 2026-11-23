import { defineConfig } from 'vite';
// base './' so the build also works from a file:// WebView (Capacitor/APK) and from any sub-folder
export default defineConfig({ base: './', build: { chunkSizeWarningLimit: 1500 } });
