import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/core/tagger.ts',
      name: 'DOMTagger',
      fileName: 'tagger',
      formats: ['es']
    },
    outDir: 'browser',        // Output goes to project-root/browser (not in src)
    emptyOutDir: true         // Default, cleans up old files each build
  }
});
