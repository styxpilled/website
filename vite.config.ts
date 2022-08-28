// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { sveltekit } from '@sveltejs/kit/vite';
import path from 'path';
import { UserConfig } from 'vite';

const config: UserConfig = {
  plugins: [sveltekit()],
  resolve: {
    alias: {
      '$styles': path.resolve('./src/styles'),
      '$components': path.resolve('./src/components'),
    }
  }
};

export default config;
