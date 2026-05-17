# Frontend — Plano de Arquitetura

> Seguindo `murillo's-architecture-frontend.md`.
> Stack: **SvelteKit + TypeScript + Tailwind**.

---

## 1. Prisma Admin (Painel Interno)

```
src/
├── app.html
├── hooks.server.ts                             # Auth guard SSR
│
├── app/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── domain/entities/AdminUser.ts
│   │   │   ├── domain/repositories/IAuthRepository.ts
│   │   │   ├── data/repositories/AuthRepository.ts
│   │   │   ├── presentation/
│   │   │   │   ├── pages/LoginPage.svelte
│   │   │   │   ├── widgets/TwoFactorDialog.svelte
│   │   │   │   └── controllers/authController.ts
│   │   │   ├── services/AuthService.ts
│   │   │   ├── payloads/LoginPayload.ts
│   │   │   └── validators/authValidator.ts
│   │   │
│   │   ├── dashboard/
│   │   │   ├── domain/entities/AdminMetrics.ts
│   │   │   ├── data/repositories/DashboardRepository.ts
│   │   │   ├── presentation/
│   │   │   │   ├── pages/DashboardPage.svelte
│   │   │   │   └── widgets/
│   │   │   │       ├── VolumeChart.svelte
│   │   │   │       ├── RevenueCard.svelte
│   │   │   │       └── RecentTransactions.svelte
│   │   │   └── services/DashboardService.ts
│   │   │
│   │   ├── merchants/                          # Feature group
│   │   │   ├── listing/                        # Sub-feature: lista de merchants
│   │   │   ├── detail/                         # Sub-feature: detalhe e ações
│   │   │   └── verification/                   # Sub-feature: aprovação KYC
│   │   │
│   │   ├── transactions/                       # Feature group
│   │   │   ├── payments/                       # Sub-feature: listagem de cash-in
│   │   │   ├── withdrawals/                    # Sub-feature: listagem de cash-out
│   │   │   └── disputes/                       # Sub-feature: gestão de disputas
│   │   │
│   │   ├── providers/                          # Configuração de provedores
│   │   │   ├── presentation/pages/ProvidersPage.svelte
│   │   │   └── ...
│   │   │
│   │   ├── fees/                               # Configuração de taxas
│   │   │   └── ...
│   │   │
│   │   ├── audit/                              # Logs de auditoria
│   │   │   └── ...
│   │   │
│   │   └── settings/                           # Configurações da plataforma
│   │       └── ...
│   │
│   ├── services/
│   │   ├── api/
│   │   │   ├── apiClient.ts
│   │   │   ├── apiResponse.ts
│   │   │   └── apiInterceptors.ts
│   │   └── storage/
│   │       └── tokenStorage.ts
│   │
│   └── shared/
│       ├── widgets/                            # DataTable, Modal, Toast, etc.
│       ├── entities/PaginatedResult.ts
│       ├── messages/routeMessages.ts           # Parser do RouteMessages
│       ├── guards/adminGuard.ts
│       ├── theme/                              # Cores, tipografia, tokens
│       └── utils/
│
└── core/
    ├── config/env.ts
    ├── constants/apiPaths.ts
    ├── error/Failure.ts
    └── service_locator/serviceLocator.ts
```

---

## 2. Prisma App (Portal Merchant + Checkout Público)

```
src/
├── app/
│   ├── features/
│   │   ├── auth/                               # Login, registro, 2FA
│   │   ├── dashboard/                          # Dashboard de vendas
│   │   ├── financial/                          # Feature group
│   │   │   ├── balance/                        # Saldo e extrato
│   │   │   ├── withdrawals/                    # Solicitação de saques
│   │   │   └── billing/                        # Resumo de billing
│   │   ├── transactions/                       # Listagem de transações
│   │   ├── checkout/                            # Feature group
│   │   │   ├── links/                          # CRUD de links
│   │   │   └── products/                       # Gestão de produtos
│   │   ├── integration/                        # Feature group
│   │   │   ├── api_keys/                       # Geração de chaves
│   │   │   ├── webhooks/                       # Config de webhooks
│   │   │   └── docs/                           # API docs embutida
│   │   ├── settings/                           # Configurações do merchant
│   │   ├── verification/                       # Upload KYC
│   │   │
│   │   └── public_checkout/                    # Checkout público (/pay/{code})
│   │       ├── domain/
│   │       │   ├── entities/
│   │       │   │   ├── CheckoutData.ts
│   │       │   │   └── CheckoutSession.ts
│   │       │   └── repositories/
│   │       │       └── ICheckoutRepository.ts
│   │       ├── data/repositories/
│   │       │   └── CheckoutRepository.ts
│   │       ├── presentation/
│   │       │   ├── pages/CheckoutPage.svelte
│   │       │   ├── widgets/
│   │       │   │   ├── ProductSummary.svelte
│   │       │   │   ├── PayerForm.svelte
│   │       │   │   ├── PixQrCode.svelte
│   │       │   │   ├── BoletoDisplay.svelte
│   │       │   │   └── PaymentStatus.svelte
│   │       │   └── controllers/checkoutController.ts
│   │       ├── services/CheckoutService.ts
│   │       ├── payloads/CreateSessionPayload.ts
│   │       └── validators/payerValidator.ts
│   │
│   ├── services/
│   │   ├── api/
│   │   ├── storage/
│   │   └── websocket/                          # SignalR para notificações de venda
│   │       ├── realtimeClient.ts
│   │       └── channelsManager.ts
│   │
│   └── shared/
│       ├── widgets/
│       ├── guards/merchantGuard.ts
│       ├── messages/routeMessages.ts
│       └── theme/
│
└── core/
    └── ...
```
