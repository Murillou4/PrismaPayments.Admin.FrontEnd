import { describe, expect, it } from 'vitest';
import { normalizeWithdrawal } from '../WithdrawalRepository';

describe('normalizeWithdrawal', () => {
  it('preenche recipient ausente para a tabela nao quebrar', () => {
    const withdrawal = normalizeWithdrawal({
      id: 'wd_1',
      merchantId: 'merchant_1',
      amount: 1000
    });

    expect(withdrawal.recipient.pixKey).toBe('');
    expect(withdrawal.recipient.pixKeyType).toBe('');
    expect(withdrawal.amount).toBe(1000);
    expect(withdrawal.feeAmount).toBe(0);
  });
});
