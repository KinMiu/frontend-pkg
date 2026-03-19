import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },

// untuk menghilangkan console
  //npx vite build
  //npm run preview .. untuk melihat hasil build
  build: {
    // Minify and obfuscate code in production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console statements
        drop_debugger: true, // Remove debugger statements
      },
      
    },
    
  }

});