import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import type { PluginOption } from 'vite';

export default defineConfig(async () => {
  const plugins: PluginOption[] = [react()];
  
  if (process.env.NODE_ENV === 'development') {
    const { default: visualizer } = await import('rollup-plugin-visualizer');
    plugins.push(
      visualizer({
        open: true,
        filename: 'dist/stats.html',
      }) as PluginOption
    );
  }

  return {
    plugins,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    server: {
      port: 5173,
    },
  };
});
