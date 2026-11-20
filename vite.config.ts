import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// `base: './'` keeps every asset URL relative, so the same build works on a
// custom domain and on a GitHub Pages project sub-path (/make-pigs-fly/).
// Social crawlers need absolute URLs for og:image, so CI passes the Pages
// base URL in VITE_SITE_URL and we splice it into index.html.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const raw = (env.VITE_SITE_URL || '').trim();
  const site = raw ? raw.replace(/\/?$/, '/') : './';

  return {
    plugins: [
      react(),
      {
        name: 'makepigs-site-url',
        transformIndexHtml: (html) => html.replaceAll('%SITE%', site),
      },
    ],
    base: './',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      target: 'es2020',
    },
  };
});
