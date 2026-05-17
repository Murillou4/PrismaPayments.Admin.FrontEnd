import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  server: {
    watch: {
      ignored: ['**/.claude/**']
    },
    warmup: {
      clientFiles: [
        './src/routes/(admin)/dashboard/+page.svelte',
        './src/routes/(admin)/merchants/+page.svelte',
        './src/routes/(admin)/merchants/[id]/+page.svelte',
        './src/routes/(admin)/transactions/payments/+page.svelte',
        './src/routes/(admin)/transactions/payments/[id]/+page.svelte',
        './src/routes/(admin)/transactions/withdrawals/+page.svelte',
        './src/routes/(admin)/transactions/withdrawals/[id]/+page.svelte',
        './src/routes/(admin)/admin-users/+page.svelte',
        './src/routes/(admin)/audit/+page.svelte',
        './src/routes/(admin)/disputes/+page.svelte',
        './src/routes/(admin)/fees/+page.svelte',
        './src/routes/(admin)/providers/+page.svelte',
        './src/routes/(admin)/diagnostics/+page.svelte',
      ]
    }
  }
});
