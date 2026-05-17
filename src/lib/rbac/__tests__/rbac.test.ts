import { describe, it, expect } from 'vitest';
import { hasPermission } from '../../../app/shared/guards/adminGuard';
import type { AdminRole } from '../../../app/shared/guards/adminGuard';

describe('RBAC-01: hasPermission', () => {
  it('VIEWER não tem permissão para ADMIN', () => {
    expect(hasPermission('VIEWER', 'ADMIN')).toBe(false);
  });
  it('ADMIN tem permissão para SUPPORT', () => {
    expect(hasPermission('ADMIN', 'SUPPORT')).toBe(true);
  });
  it('SUPER_ADMIN tem permissão para SUPER_ADMIN', () => {
    expect(hasPermission('SUPER_ADMIN', 'SUPER_ADMIN')).toBe(true);
  });
  it('null role não tem permissão para VIEWER', () => {
    expect(hasPermission(null, 'VIEWER')).toBe(false);
  });
});

describe('RBAC-02: menu RBAC', () => {
  it('hasPermission(VIEWER, SUPER_ADMIN) retorna false — item de menu admin ocultado', () => {
    expect(hasPermission('VIEWER' as AdminRole, 'SUPER_ADMIN')).toBe(false);
  });
  it('hasPermission(SUPER_ADMIN, SUPER_ADMIN) retorna true — item de menu admin visível', () => {
    expect(hasPermission('SUPER_ADMIN' as AdminRole, 'SUPER_ADMIN')).toBe(true);
  });
});
