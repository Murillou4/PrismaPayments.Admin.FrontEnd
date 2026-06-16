import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { svelteTesting } from '@testing-library/svelte/vite';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    projects: [
      {
        // Componentes (*.svelte.test.ts): resolvem a build "browser" do Svelte
        // (via svelteTesting) e fazem mount em jsdom.
        extends: true,
        plugins: [svelteTesting()],
        test: {
          name: 'client',
          environment: 'jsdom',
          globals: true,
          setupFiles: ['./vitest-setup-client.ts'],
          include: ['src/**/*.svelte.{test,spec}.{js,ts}']
        }
      },
      {
        // Lógica/servidor: usa as condições padrão para que $env/dynamic/private
        // e os arquivos .server.ts resolvam corretamente.
        extends: true,
        test: {
          name: 'server',
          environment: 'jsdom',
          globals: true,
          include: ['src/**/*.{test,spec}.{js,ts}'],
          exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
        }
      }
    ]
  }
});
