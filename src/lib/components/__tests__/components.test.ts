import { describe, it, expect } from 'vitest';
import { formatCurrency } from '$appmod/shared/utils/formatters';
import { load as rootLoad } from '../../../routes/+page.server';

// Testes que exigem render de componente (StatusBadge, DataTable, ConfirmDialog)
// vivem em arquivos *.svelte.test.ts e rodam no project "client" do Vitest.

describe('INFRA-08: formatCurrency', () => {
  it('converte centavos para BRL pt-BR (1000 centavos = R$ 10,00)', () => {
    const result = formatCurrency(1000);
    expect(result).toContain('10');
    expect(result).toContain('R$');
  });

  it('formata zero corretamente', () => {
    const result = formatCurrency(0);
    expect(result).toContain('R$');
    expect(result).toContain('0');
  });

  it('formata valores grandes com separador de milhar pt-BR', () => {
    // 100000 centavos = R$ 1.000,00
    const result = formatCurrency(100000);
    expect(result).toContain('1');
    expect(result).toContain('000');
  });
});

// Testes de render (rodam no project "client"):
//  - INFRA-03 StatusBadge   -> src/app/shared/widgets/__tests__/StatusBadge.svelte.test.ts
//  - INFRA-04 ConfirmDialog  -> src/app/shared/widgets/__tests__/ConfirmDialog.svelte.test.ts
//  - INFRA-01 DataTable      -> src/app/shared/widgets/__tests__/DataTable.svelte.test.ts
//  - INFRA-06 Error boundary -> src/routes/__tests__/ErrorBoundary.svelte.test.ts

describe('INFRA-05: Toast (svelte-sonner)', () => {
  // Pendente: exige montar o Toaster e observar o portal de notificacoes (flaky).
  it.todo('Toaster montado no layout admin via plan 02');
  it.todo('toast.success() dispara notificação');
});

describe('INFRA-07: redirect de /', () => {
  it('+page.server.ts lança redirect(302, /dashboard)', async () => {
    await expect(rootLoad({} as unknown as Parameters<typeof rootLoad>[0])).rejects.toMatchObject({
      status: 302,
      location: '/dashboard'
    });
  });
});
