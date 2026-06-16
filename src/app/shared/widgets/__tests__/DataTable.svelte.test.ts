import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import type { ColumnDef } from '@tanstack/table-core';
import DataTable from '../DataTable.svelte';

interface Linha {
  id: string;
  name: string;
}

const columns: ColumnDef<Linha, unknown>[] = [
  { id: 'name', header: 'Nome', accessorKey: 'name' },
  { id: 'id', header: 'ID', accessorKey: 'id' }
];

const data: Linha[] = [
  { id: '1', name: 'Alpha' },
  { id: '2', name: 'Bravo' },
  { id: '3', name: 'Charlie' }
];

function dataRows(container: HTMLElement) {
  return container.querySelectorAll('.data-table__row');
}

// DataTable e generico (<T>); no boundary do render o T nao e inferido, entao
// passamos as props ja com os tipos abertos que o componente espera.
function renderTable(extra: { pageSize?: number; loading?: boolean } = {}, rows: Linha[] = data) {
  return render(DataTable, {
    props: {
      columns: columns as ColumnDef<unknown, unknown>[],
      data: rows as unknown[],
      ...extra
    }
  });
}

describe('INFRA-01: DataTable', () => {
  it('renderiza N linhas para N items de data', () => {
    const { container } = renderTable();
    expect(dataRows(container).length).toBe(3);
  });

  it('empty state exibe "Nenhum resultado" quando data vazio', () => {
    const { container } = renderTable({}, []);
    expect(container.textContent).toContain('Nenhum resultado');
    expect(dataRows(container).length).toBe(0);
  });

  it('loading=true exibe skeleton rows', () => {
    const { container } = renderTable({ loading: true });
    expect(container.querySelectorAll('.data-table__skeleton').length).toBeGreaterThan(0);
    expect(container.textContent).not.toContain('Alpha');
  });

  it('paginação respeita pageSize e "Próxima página" avança a currentPage', async () => {
    const { container, getByLabelText } = renderTable({ pageSize: 2 });

    expect(dataRows(container).length).toBe(2);
    expect(container.textContent).toContain('Alpha');
    expect(container.textContent).not.toContain('Charlie');

    await fireEvent.click(getByLabelText('Próxima página'));

    expect(dataRows(container).length).toBe(1);
    expect(container.textContent).toContain('Charlie');
  });

  it('clicar numa coluna ordenável ativa o indicador de sort (ChevronUp/Down)', async () => {
    const { container } = renderTable();

    const sortableHead = container.querySelector<HTMLElement>('.data-table__head--sortable');
    expect(sortableHead).not.toBeNull();
    expect(container.querySelector('.data-table__sort--active')).toBeNull();

    await fireEvent.click(sortableHead!);

    expect(container.querySelector('.data-table__sort--active')).not.toBeNull();
  });
});
