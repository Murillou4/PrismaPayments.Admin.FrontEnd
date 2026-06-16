import { describe, it, expect, vi } from 'vitest';
import { readable } from 'svelte/store';

// +error.svelte le $page (status/error) de $app/stores e usa goto de $app/navigation.
vi.mock('$app/stores', () => ({
  page: readable({ status: 503, error: { message: 'Backend indisponível' } })
}));
vi.mock('$app/navigation', () => ({ goto: vi.fn() }));

const { render } = await import('@testing-library/svelte');
const { default: ErrorPage } = await import('../+error.svelte');

describe('INFRA-06: Error boundary', () => {
  it('+error.svelte renderiza a mensagem e o status de $page.error', () => {
    const { container } = render(ErrorPage);

    expect(container.textContent).toContain('Backend indisponível');
    expect(container.textContent).toContain('503');
    expect(container.textContent).toContain('Algo deu errado');
  });

  it('exibe mensagem de fallback quando error nao tem message', async () => {
    vi.resetModules();
    vi.doMock('$app/stores', () => ({ page: readable({ status: 500, error: null }) }));
    vi.doMock('$app/navigation', () => ({ goto: vi.fn() }));

    const { render: render2 } = await import('@testing-library/svelte');
    const { default: ErrorPage2 } = await import('../+error.svelte');
    const { container } = render2(ErrorPage2);

    expect(container.textContent).toContain('Ocorreu um erro inesperado');
  });
});
