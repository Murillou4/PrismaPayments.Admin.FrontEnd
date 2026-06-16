import { describe, it, expect } from 'vitest';
import { formatCurrency } from '$appmod/shared/utils/formatters';
import { load as rootLoad } from '../../../routes/+page.server';

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

describe('INFRA-03: StatusBadge color map', () => {
  it.todo('status ACTIVE exibe cor #00E676 (green)');
  it.todo('status PENDING exibe cor #FFB300 (warning)');
  it.todo('status BLOCKED exibe cor #FF3B5C (danger)');
  it.todo('status MED tem classe status-badge--med com animação pulse');
  it.todo('status desconhecido usa cor padrão #9090A8');
});

describe('INFRA-04: ConfirmDialog', () => {
  it.todo('confirm button desabilitado quando requiresReason=true e reason vazio');
  it.todo('confirm button habilitado quando requiresReason=true e reason preenchido');
  it.todo('onconfirm chamado com reason quando requiresReason=true');
});

describe('INFRA-05: Toast (svelte-sonner)', () => {
  it.todo('Toaster montado no layout admin via plan 02');
  it.todo('toast.success() dispara notificação');
});

describe('INFRA-06: Error boundary', () => {
  it.todo('+error.svelte renderiza $page.error.message');
});

describe('INFRA-07: redirect de /', () => {
  it('+page.server.ts lança redirect(302, /dashboard)', async () => {
    await expect(rootLoad({} as unknown as Parameters<typeof rootLoad>[0])).rejects.toMatchObject({
      status: 302,
      location: '/dashboard'
    });
  });
});

describe('INFRA-01: DataTable', () => {
  it.todo('renderiza N linhas para N items de data');
  it.todo('paginação prev/next atualiza currentPage');
  it.todo('empty state exibe "Nenhum resultado" quando data vazio');
  it.todo('loading=true exibe skeleton rows');
  it.todo('coluna com sorting ativa mostra ChevronUp/Down');
});
