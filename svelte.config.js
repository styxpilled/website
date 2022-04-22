import adapter from '@sveltejs/adapter-cloudflare';
import preprocess from 'svelte-preprocess';
import path from 'path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [
    preprocess({
      postcss: true
    })
  ],
  kit: {
    adapter: adapter(),
    vite: {
      resolve: {
        alias: {
          '$lib': path.resolve('./src/lib'),
          '$styles': path.resolve('./src/styles'),
        }
      }
    }
  }
};

export default config;
