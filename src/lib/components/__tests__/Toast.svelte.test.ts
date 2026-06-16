import { describe, it, expect, afterEach } from 'vitest';
import { render, waitFor, cleanup } from '@testing-library/svelte';
import { Toaster, toast } from 'svelte-sonner';

afterEach(() => {
  cleanup();
  toast.dismiss();
});

describe('INFRA-05: Toast (svelte-sonner)', () => {
  it('Toaster monta a região de notificações ao receber um toast', async () => {
    render(Toaster);

    toast('init');

    await waitFor(() => {
      expect(document.querySelector('[data-sonner-toaster]')).not.toBeNull();
    });
  });

  it('toast.success() dispara uma notificação visível', async () => {
    render(Toaster);

    toast.success('Operação concluída com sucesso');

    await waitFor(() => {
      expect(document.body.textContent).toContain('Operação concluída com sucesso');
    });
  });
});
