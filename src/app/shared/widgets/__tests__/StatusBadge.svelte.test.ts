import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import StatusBadge from '../StatusBadge.svelte';

// jsdom serializa cores inline como rgb(), entao comparamos pelo equivalente.
const RGB = {
  green: 'rgb(0, 230, 118)', // #00E676
  warning: 'rgb(255, 179, 0)', // #FFB300
  danger: 'rgb(255, 59, 92)', // #FF3B5C
  muted: 'rgb(144, 144, 168)' // #9090A8
};

function badgeColor(container: HTMLElement): string {
  const el = container.querySelector<HTMLElement>('.status-badge');
  return el?.style.color ?? '';
}

describe('INFRA-03: StatusBadge color map', () => {
  it('status ACTIVE exibe verde (#00E676)', () => {
    const { container } = render(StatusBadge, { props: { status: 'ACTIVE' } });
    expect(badgeColor(container)).toBe(RGB.green);
  });

  it('status PENDING exibe âmbar (#FFB300)', () => {
    const { container } = render(StatusBadge, { props: { status: 'PENDING' } });
    expect(badgeColor(container)).toBe(RGB.warning);
  });

  it('status BLOCKED exibe vermelho (#FF3B5C)', () => {
    const { container } = render(StatusBadge, { props: { status: 'BLOCKED' } });
    expect(badgeColor(container)).toBe(RGB.danger);
  });

  it('status MED recebe a classe status-badge--med (animação pulse)', () => {
    const { container } = render(StatusBadge, { props: { status: 'MED' } });
    expect(container.querySelector('.status-badge--med')).not.toBeNull();
    expect(badgeColor(container)).toBe(RGB.danger);
  });

  it('status desconhecido usa a cor padrão (#9090A8)', () => {
    const { container } = render(StatusBadge, { props: { status: 'ALGO_QUE_NAO_EXISTE' } });
    expect(badgeColor(container)).toBe(RGB.muted);
  });

  it('é case-insensitive: status minúsculo mapeia para a mesma cor', () => {
    const { container } = render(StatusBadge, { props: { status: 'active' } });
    expect(badgeColor(container)).toBe(RGB.green);
  });

  it('renderiza o texto do status', () => {
    const { container } = render(StatusBadge, { props: { status: 'ACTIVE' } });
    expect(container.textContent).toContain('ACTIVE');
  });
});
