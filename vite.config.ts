import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    build: {
      // Keep small images as separate cacheable files instead of inlining them as
      // base64 into the JS bundle (bloats parse time on every page, even ones that
      // don't render that image).
      assetsInlineLimit: 0,
      // Vite's default target assumes fairly recent evergreen browsers. Widen it so
      // the bundle also runs on the older Android Chrome/WebView versions still
      // common on budget devices, rather than silently failing to execute.
      target: 'es2017',
    },
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      allowedHosts: true,
      proxy: {
        '/api': {
          target: env.PYTHON_BACKEND_URL || 'http://localhost:8000',
          changeOrigin: true,
          ws: true,
        },
      },
    },
  };
});
