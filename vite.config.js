import { readFileSync } from 'node:fs';
import { cpSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

function serviceWorkerPlugin() {
  return {
    name: 'emit-service-worker',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'service-worker.js',
        source: readFileSync('src/service-worker.js', 'utf8'),
      });
    },
  };
}

function copyRuntimeDataPlugin() {
  return {
    name: 'copy-runtime-data',
    writeBundle(outputOptions) {
      const outDir = outputOptions.dir || 'dist';
      cpSync(resolve('asset'), resolve(outDir, 'asset'), { recursive: true });
      cpSync(resolve('data'), resolve(outDir, 'data'), { recursive: true });
      cpSync(resolve('robot.txt'), resolve(outDir, 'robot.txt'));
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [serviceWorkerPlugin(), copyRuntimeDataPlugin()],
  build: {
    target: 'es2020',
    modulePreload: true,
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      input: 'index.html',
    },
  },
  server: {
    headers: {
      'Cache-Control': 'no-cache',
    },
  },
  preview: {
    headers: {
      'Cache-Control': 'no-cache',
    },
  },
});
