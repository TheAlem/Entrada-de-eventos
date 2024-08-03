import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://test.bnb.com.bo',
        changeOrigin: true,
        rewrite: (path) => {
          console.log(`Rewriting path: ${path}`);
          return path.replace(/^\/api/, '');
        },
      },
    },
  },
});
