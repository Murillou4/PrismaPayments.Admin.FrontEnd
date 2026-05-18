export function formatCurrency(cents: number): string {
  const safeCents = Number.isFinite(cents) ? cents : 0;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(safeCents / 100);
}

export function formatDate(iso: string | undefined | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(iso));
}

export function formatDocument(doc: string | undefined | null, type: 'CPF' | 'CNPJ'): string {
  if (!doc) return '—';
  if (type === 'CPF') {
    return doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  return doc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

export function formatBasisPoints(bp: number): string {
  const safeBp = Number.isFinite(bp) ? bp : 0;
  return `${(safeBp / 100).toFixed(2).replace('.', ',')}%`;
}

export function formatPercentage(value: number): string {
  const safeValue = Number.isFinite(value) ? value : 0;
  return `${safeValue.toFixed(2).replace('.', ',')}%`;
}

export function formatShortId(value: unknown, size = 8): string {
  const text = typeof value === 'string' ? value : '';
  if (!text) return '-';
  return text.length > size ? `${text.slice(0, size)}...` : text;
}
