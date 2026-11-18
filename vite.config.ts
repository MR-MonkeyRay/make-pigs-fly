import { defineConfig } from 'vite';

// Relative base + hash routing: works both on <user>.github.io/make-pigs-fly/ and on makepigs.fly.
export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    assetsInlineLimit: 4096,
  },
});
