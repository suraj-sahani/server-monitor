import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.spec.ts'],
    environment: 'node',
    alias: {
      src: resolve(__dirname, './src'),
    },
  },
  plugins: [swc.vite()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
