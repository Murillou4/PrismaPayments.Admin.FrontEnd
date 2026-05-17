import autoAdapter from '@sveltejs/adapter-auto';
import vercelAdapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const isVercelBuild = process.env.VERCEL === '1' || process.env.VERCEL === 'true';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: isVercelBuild ? vercelAdapter({ runtime: 'nodejs20.x' }) : autoAdapter(),
    alias: {
      $appmod: './src/app',
      $core: './src/core'
    }
  }
};

export default config;
