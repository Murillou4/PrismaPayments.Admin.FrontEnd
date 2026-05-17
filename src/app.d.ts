// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

declare global {
  namespace App {
    interface Locals {
      accessToken: string | null;
      adminRole: string | null;
    }
    // interface Error {}
    interface PageData {
      adminRole?: string | null;
      admin?: {
        id?: string | null;
        name?: string | null;
        email?: string | null;
        role?: string | null;
        tenantId?: string | null;
        tenantName?: string | null;
        twoFactorEnabled?: boolean;
      } | null;
    }
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
