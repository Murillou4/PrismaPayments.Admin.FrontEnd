import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/svelte';
import ConfirmDialog from '../ConfirmDialog.svelte';

// O conteúdo do Dialog (bits-ui) é renderizado num portal em document.body.
function confirmButton(): HTMLButtonElement {
  return document.body.querySelector('.confirm-dialog__button--primary') as HTMLButtonElement;
}

const baseProps = {
  open: true,
  title: 'Bloquear merchant',
  onconfirm: vi.fn(),
  oncancel: vi.fn()
};

describe('INFRA-04: ConfirmDialog', () => {
  it('confirm desabilitado quando requiresReason=true e reason vazio', async () => {
    render(ConfirmDialog, { props: { ...baseProps, requiresReason: true, onconfirm: vi.fn() } });
    await screen.findByText('Bloquear merchant');

    expect(confirmButton().disabled).toBe(true);
  });

  it('confirm habilitado quando requiresReason=true e reason preenchido', async () => {
    render(ConfirmDialog, { props: { ...baseProps, requiresReason: true, onconfirm: vi.fn() } });
    await screen.findByText('Bloquear merchant');

    const textarea = document.body.querySelector('#confirm-reason') as HTMLTextAreaElement;
    await fireEvent.input(textarea, { target: { value: 'fraude confirmada' } });

    expect(confirmButton().disabled).toBe(false);
  });

  it('onconfirm é chamado com o reason quando requiresReason=true', async () => {
    const onconfirm = vi.fn();
    render(ConfirmDialog, { props: { ...baseProps, requiresReason: true, onconfirm } });
    await screen.findByText('Bloquear merchant');

    const textarea = document.body.querySelector('#confirm-reason') as HTMLTextAreaElement;
    await fireEvent.input(textarea, { target: { value: 'fraude confirmada' } });
    await fireEvent.click(confirmButton());

    expect(onconfirm).toHaveBeenCalledWith('fraude confirmada');
  });

  it('sem requiresReason o confirm já está habilitado e chama onconfirm sem reason', async () => {
    const onconfirm = vi.fn();
    render(ConfirmDialog, { props: { ...baseProps, title: 'Aprovar', onconfirm } });
    await screen.findByText('Aprovar');

    expect(confirmButton().disabled).toBe(false);
    await fireEvent.click(confirmButton());

    expect(onconfirm).toHaveBeenCalledWith(undefined);
  });
});
