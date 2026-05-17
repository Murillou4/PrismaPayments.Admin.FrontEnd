MUDANÇAS:
  1. TenantBrandingResponse — nota explicando que logoUrl e faviconUrl são URLs resolvidas pelo backend (públicas ou
  presigned com 7 dias de validade)
  2. Criar Tenant (POST /admin/tenants) — request mudou de JSON para multipart/form-data. Campos logoUrl/faviconUrl
  substituídos por branding.logo e branding.favicon como File. Adicionado exemplo de envio com FormData
  3. Atualizar Tenant (PUT /admin/tenants/{id}) — request mudou para multipart/form-data com
  branding.logo/branding.favicon como File. Nota sobre deleção automática do arquivo anterior ao enviar um novo
  4. Review de Verificação KYC (PUT /admin/merchants/{id}/verification) — adicionada a response tipada e nota sobre
  invalidação automática de cache após atualizar o status
  5. Documentos KYC do Merchant (GET /admin/merchants/{id}/documents) — campo fileUrl documentado como URL resolvida
  (pública ou presigned)

# Frontend Admin (Painel Administrativo) — Documentação de Implementação

> Documentação completa para implementar o painel administrativo do Prisma Payments.
> Stack de referência: **SvelteKit** — mas siga a arquitetura agnóstica descrita em `murillo's-architecture-frontend.md`.

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura e Estrutura de Pastas](#2-arquitetura-e-estrutura-de-pastas)
3. [Infraestrutura Core](#3-infraestrutura-core)
4. [Autenticação e Roles](#4-autenticação-e-roles)
5. [Features](#5-features)
   - 5.1 [Dashboard Admin](#51-dashboard-admin)
   - 5.2 [Gestão de Tenants (Multi-tenant)](#52-gestão-de-tenants)
   - 5.3 [Gestão de Merchants](#53-gestão-de-merchants)
   - 5.4 [Verificação / KYC Review](#54-verificação--kyc-review)
   - 5.5 [Transações (Pagamentos e Saques)](#55-transações)
   - 5.6 [Disputas (Chargebacks)](#56-disputas)
   - 5.7 [Regras de Taxas (Fees)](#57-regras-de-taxas)
   - 5.8 [Gestão de Admins](#58-gestão-de-admins)
   - 5.9 [Auditoria (Audit Log)](#59-auditoria)
   - 5.10 [Provedores (Providers)](#510-provedores)
   - 5.11 [Diagnósticos (Logs HTTP)](#511-diagnósticos)
   - 5.12 [Configuração da Plataforma](#512-configuração-da-plataforma)
6. [Contrato de API (RouteMessages)](#6-contrato-de-api-routemessages)
7. [Enums e Constantes](#7-enums-e-constantes)
8. [Controle de Acesso por Role](#8-controle-de-acesso-por-role)
9. [Guia de Navegação e Rotas](#9-guia-de-navegação-e-rotas)

---

## 1. Visão Geral

O **Frontend Admin** é o painel usado pela equipe interna para:
- Monitorar métricas globais da plataforma
- Gerenciar merchants (aprovação, suspensão, verificação KYC)
- Visualizar todas as transações cross-merchant
- Resolver disputas e chargebacks
- Configurar regras de taxas (globais e por merchant)
- Gerenciar usuários administrativos
- Consultar audit log
- Monitorar provedores de pagamento
- Acessar diagnósticos e logs HTTP

**Base URL da API**: `{API_BASE_URL}/api/v1`
**Autenticação**: JWT Bearer Token via header `Authorization: Bearer {accessToken}`
**Perfil**: Admin (diferente do merchant — login por endpoint separado)

---

## 2. Arquitetura e Estrutura de Pastas

```
src/
├── entry_point
├── app/
│   ├── app_widget
│   ├── router
│   │
│   ├── features/
│   │   ├── auth/                        # Login admin
│   │   ├── dashboard/                   # Métricas globais da plataforma
│   │   ├── tenants/                     # Gestão multi-tenant (CRUD)
│   │   ├── merchants/
│   │   │   ├── management/              # CRUD de merchants (scoped por tenant)
│   │   │   ├── verification/            # Review de KYC
│   │   │   └── credentials/             # Credenciais de API (criação por admin)
│   │   ├── transactions/
│   │   │   ├── payments/                # Pagamentos cross-merchant
│   │   │   └── withdrawals/             # Saques cross-merchant
│   │   ├── disputes/                    # Gestão de chargebacks
│   │   ├── fees/                        # Regras de taxas (CRUD)
│   │   ├── admin_users/                 # Gestão de usuários admin
│   │   ├── audit/                       # Audit log viewer
│   │   ├── providers/                   # Provedores de pagamento
│   │   ├── diagnostics/                 # Logs HTTP e debugging
│   │   └── config/                      # Configuração da plataforma
│   │
│   ├── services/
│   │   ├── api/
│   │   │   ├── api_client
│   │   │   ├── api_response
│   │   │   └── api_interceptors
│   │   └── storage/
│   │       ├── local_storage
│   │       └── secure_storage
│   │
│   └── shared/
│       ├── widgets/                     # Componentes de UI reutilizáveis
│       ├── entities/                    # Entidades compartilhadas
│       ├── enums/
│       ├── messages/                    # RouteMessages parser
│       ├── guards/                      # Auth guard, role guard
│       ├── theme/
│       └── utils/                       # Formatters (dinheiro, datas, documentos)
│
└── core/
    ├── config/
    ├── constants/
    ├── error/
    ├── network/
    ├── service_locator/
    └── extensions/
```

---

## 3. Infraestrutura Core

### 3.1 API Client

```
Base URL: configurável via env
Headers padrão:
  - Content-Type: application/json
  - Authorization: Bearer {accessToken}

Interceptors:
  1. Auth Interceptor     → injeta Bearer token
  2. Error Interceptor    → parseia RouteMessages, trata 401 (→ logout), 403 (→ acesso negado)
  3. Retry Interceptor    → retry em falhas de rede
```

### 3.2 API Paths (Constantes)

```
AUTH_ADMIN_LOGIN       = /api/v1/auth/admin/login
AUTH_ADMIN_2FA_SETUP   = /api/v1/auth/admin/2fa/setup
AUTH_ADMIN_2FA_VERIFY  = /api/v1/auth/admin/2fa/verify
AUTH_ADMIN_2FA_DISABLE = /api/v1/auth/admin/2fa/disable
AUTH_ADMIN_2FA_LOGIN   = /api/v1/auth/admin/2fa/login
AUTH_ADMIN_FORGOT_PW   = /api/v1/auth/admin/forgot-password
AUTH_ADMIN_RESET_PW    = /api/v1/auth/admin/reset-password
AUTH_REFRESH           = /api/v1/auth/merchants/refresh   // Mesmo endpoint de refresh

ADMIN_USERS            = /api/v1/admin/users
ADMIN_TENANTS          = /api/v1/admin/tenants
ADMIN_MERCHANTS        = /api/v1/admin/merchants
ADMIN_MERCHANT_CREDS   = /api/v1/admin/merchants/{id}/credentials
ADMIN_MERCHANT_DOCS    = /api/v1/admin/merchants/{id}/documents
ADMIN_PAYMENTS         = /api/v1/admin/payments
ADMIN_WITHDRAWALS      = /api/v1/admin/withdrawals
ADMIN_DISPUTES         = /api/v1/admin/disputes
ADMIN_AUDIT            = /api/v1/admin/audit
ADMIN_PROVIDERS        = /api/v1/admin/providers
ADMIN_CONFIG           = /api/v1/admin/config

FEES_RULES             = /api/v1/fees/rules
FEES_SIMULATE          = /api/v1/fees/simulate
FEES_MERCHANT_RULES    = /api/v1/fees/merchants

DIAGNOSTICS_LOGS       = /api/v1/diagnostics/logs
DIAGNOSTICS_STATS      = /api/v1/diagnostics/logs/stats

DASHBOARD_ADMIN        = /api/v1/dashboard/admin
```

### 3.3 ApiResponse (mesmo do Seller)

```typescript
interface ApiResponse<T> {
  responseType: "OK" | "CREATED" | "NO_CONTENT" | "BAD_REQUEST" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "INTERNAL_SERVER_ERROR"
  message: string
  title: string
  status: number
  data: T | null
  extendedResultCode: string
  date: string
}
```

---

## 4. Autenticação e Roles

### 4.1 Login Admin

```
POST /api/v1/auth/admin/login
```

**Request:**
```typescript
{
  email: string
  password: string
}
```

**Response (200):**
```typescript
{
  data: {
    accessToken: string
    refreshToken: string
    expiresIn: number
  }
}
```

**Response (200 — 2FA desabilitado):**
```typescript
{
  data: {
    accessToken: string
    refreshToken: string
    expiresIn: number
    tenantId: string
  }
}
```

**Response (200 — 2FA habilitado):**
```typescript
{
  data: {
    requiresTwoFactor: true
  }
}
```

Se `requiresTwoFactor: true`, redirecionar para tela de 2FA e usar o endpoint de login 2FA.

**Fluxo pós-login:**
1. Salvar tokens em secure storage
2. Decodificar JWT para extrair `role` (SUPER_ADMIN, ADMIN, SUPPORT, VIEWER)
3. Redirecionar para `/dashboard`
4. Aplicar restrições de UI baseadas no role

### 4.2 Autenticação de Dois Fatores (2FA — TOTP)

O admin pode ativar 2FA com aplicativo autenticador (Google Authenticator, Authy, etc.).

#### 4.2.1 Setup 2FA

```
POST /api/v1/auth/admin/2fa/setup
```

**Auth:** Bearer Token (Admin autenticado).

**Response (200):**
```typescript
{
  data: {
    secret: string          // Base32 secret para inserção manual
    otpAuthUri: string      // URI otpauth:// para gerar QR code
    message: string
  }
}
```

**UI:** Exibir QR code gerado a partir do `otpAuthUri` e campo para digitar o código de confirmação.

#### 4.2.2 Verificar e Ativar 2FA

```
POST /api/v1/auth/admin/2fa/verify
```

**Auth:** Bearer Token (Admin autenticado).

**Request:**
```typescript
{
  code: string              // 6 dígitos do app autenticador
}
```

**Response (200):** `{ data: { message: "2FA ativado com sucesso" } }`

#### 4.2.3 Desativar 2FA

```
POST /api/v1/auth/admin/2fa/disable
```

**Auth:** Bearer Token (Admin autenticado).

**Request:**
```typescript
{
  code: string              // 6 dígitos para confirmar desativação
}
```

**Response (200):** `{ data: { message: "2FA desativado com sucesso" } }`

#### 4.2.4 Login com 2FA

```
POST /api/v1/auth/admin/2fa/login
```

**Request:**
```typescript
{
  email: string
  password: string
  code: string              // 6 dígitos TOTP
}
```

**Response (200):** Mesma resposta do login normal (accessToken, refreshToken, expiresIn, tenantId).

**Fluxo completo de login com 2FA:**
1. Admin faz login normal (`POST /auth/admin/login`)
2. Se resposta contém `requiresTwoFactor: true` → redirecionar para tela 2FA
3. Admin insere código do app autenticador
4. Frontend chama `POST /auth/admin/2fa/login` com email + senha + código
5. Se código válido → recebe tokens normalmente

### 4.3 Forgot Password (Reset de Senha)

#### 4.3.1 Solicitar Reset

```
POST /api/v1/auth/admin/forgot-password
```

**Request:**
```typescript
{
  email: string
}
```

**Response (200):** `{ data: { message: "Se o email estiver cadastrado, um link de redefinição será enviado" } }`

> Sempre retorna 200 para evitar enumeração de emails.

#### 4.3.2 Confirmar Reset

```
POST /api/v1/auth/admin/reset-password
```

**Request:**
```typescript
{
  token: string             // Token recebido por email
  newPassword: string       // Mínimo 8 caracteres
}
```

**Response (200):** `{ data: { message: "Senha redefinida com sucesso. Faça login novamente." } }`

**Fluxo:**
1. Admin clica "Esqueci minha senha" na tela de login
2. Insere email → `POST /auth/admin/forgot-password`
3. Recebe email com token/código
4. Insere token + nova senha → `POST /auth/admin/reset-password`
5. Todas as sessões são revogadas → redirecionar para login

### 4.4 Roles do Admin

| Role | Nível | Descrição |
|------|-------|-----------|
| `SUPER_ADMIN` | 4 (máximo) | Acesso total — gestão de admins, configurações de plataforma |
| `ADMIN` | 3 | Acesso a quase tudo, exceto gestão de admins |
| `SUPPORT` | 2 | Pode alterar status de merchants, resolver disputas |
| `VIEWER` | 1 (mínimo) | Apenas visualização — sem ações de escrita |

**O JWT contém o role.** Decodificar o token (sem verificar assinatura, pois o backend faz isso) para determinar o role e exibir/ocultar ações na UI.

### 4.5 Refresh e Logout

Mesmo mecanismo do Seller — refresh automático via interceptor, logout limpa tokens.

---

## 5. Features

### 5.1 Dashboard Admin

```
GET /api/v1/dashboard/admin
```

**Auth:** Bearer Token (Admin).

**Response:**
```typescript
{
  data: {
    totalVolume: number              // Volume total processado (centavos)
    totalTransactions: number        // Total de transações
    todayVolume: number              // Volume do dia (centavos)
    todayTransactions: number        // Transações do dia
    availableBalance: number         // Soma dos saldos disponíveis (centavos) — plataforma
    pendingBalance: number           // Soma dos saldos pendentes
    totalFeesCollected: number       // Total de taxas coletadas (centavos)
    totalMerchants: number           // Total de merchants cadastrados
  }
}
```

**UI sugerida:**
- Cards com métricas globais (volume, transações, taxas, merchants)
- Gráfico de volume e transações por dia/semana/mês
- Lista de merchants recentes que precisam de aprovação
- Alertas: disputas abertas, verificações pendentes
- Top merchants por volume

---

### 5.2 Gestão de Tenants (Multi-tenant)

O Prisma Payments é multi-tenant. Cada tenant representa uma instância/marca separada da plataforma, com branding próprio (cores, logo, domínio customizado). Merchants pertencem a um tenant e são isolados entre si.

#### 5.2.1 Listar Tenants

```
GET /api/v1/admin/tenants
```

**Role mínimo:** SUPER_ADMIN

**Query Params:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `status` | string? | ACTIVE, SUSPENDED, BLOCKED |
| `skip` | int | Offset |
| `limit` | int | Itens por página |

**Response:**
```typescript
{
  data: {
    items: TenantResponse[]
    total: number
    skip: number
    limit: number
  }
}
```

**TenantResponse:**
```typescript
{
  id: string
  name: string
  slug: string                           // Identificador único URL-safe
  status: "ACTIVE" | "SUSPENDED" | "BLOCKED"
  clientKey: string                      // Chave pública do tenant
  clientSecretLast4: string              // Últimos 4 caracteres do client secret
  branding: TenantBrandingResponse
  createdAt: string
  updatedAt: string
}
```

**TenantBrandingResponse:**

> **Nota:** Os campos `logoUrl` e `faviconUrl` são retornados como URLs resolvidas pelo backend. Se `R2_PUBLIC_URL` estiver configurada, será uma URL pública direta. Caso contrário, será uma presigned URL com validade de 7 dias. O frontend deve usar as URLs retornadas diretamente (não construir URLs manualmente).

```typescript
{
  displayName: string | null             // Nome de exibição (pode diferir do name)
  logoUrl: string | null                 // URL resolvida (pública ou presigned)
  faviconUrl: string | null              // URL resolvida (pública ou presigned)
  primaryColor: string | null            // Hex (ex: "#6366f1")
  secondaryColor: string | null
  accentColor: string | null
  backgroundColor: string | null
  surfaceColor: string | null
  textColor: string | null
  mutedTextColor: string | null
  fontFamily: string | null              // Ex: "Inter, sans-serif"
  supportEmail: string | null
  supportPhone: string | null
  websiteUrl: string | null
  checkoutHeadline: string | null        // Título na página de checkout
  checkoutDescription: string | null     // Descrição na página de checkout
  customCss: string | null               // CSS customizado (injetado no checkout)
  customDomain: string | null            // Domínio customizado (ex: "pay.marca.com")
}
```

#### 5.2.2 Detalhe do Tenant

```
GET /api/v1/admin/tenants/{id}
```

**Role mínimo:** SUPER_ADMIN

**Response:** `TenantResponse` (mesma estrutura da listagem).

#### 5.2.3 Criar Tenant

```
POST /api/v1/admin/tenants
```

**Role mínimo:** SUPER_ADMIN

**Content-Type:** `multipart/form-data`

Os arquivos de logo e favicon são enviados diretamente. O backend faz o upload para o storage (R2) e armazena a URL internamente.

**Request (FormData):**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `name` | string | Nome do tenant |
| `slug` | string | Slug URL-safe (único) |
| `branding.displayName` | string? | Nome de exibição |
| `branding.logo` | File? | Arquivo de logo (imagem) |
| `branding.favicon` | File? | Arquivo de favicon (imagem) |
| `branding.primaryColor` | string? | Hex (ex: "#6366f1") |
| `branding.secondaryColor` | string? | Hex |
| `branding.accentColor` | string? | Hex |
| `branding.backgroundColor` | string? | Hex |
| `branding.surfaceColor` | string? | Hex |
| `branding.textColor` | string? | Hex |
| `branding.mutedTextColor` | string? | Hex |
| `branding.fontFamily` | string? | Ex: "Inter, sans-serif" |
| `branding.supportEmail` | string? | Email de suporte |
| `branding.supportPhone` | string? | Telefone de suporte |
| `branding.websiteUrl` | string? | URL do site |
| `branding.checkoutHeadline` | string? | Título na página de checkout |
| `branding.checkoutDescription` | string? | Descrição na página de checkout |
| `branding.customCss` | string? | CSS customizado |
| `branding.customDomain` | string? | Domínio customizado |

**Exemplo de envio:**
```typescript
const formData = new FormData();
formData.append("name", "Minha Empresa");
formData.append("slug", "minha-empresa");
formData.append("branding.logo", logoFile);           // File
formData.append("branding.favicon", faviconFile);     // File
formData.append("branding.primaryColor", "#6366f1");
// ... demais campos de branding

await apiClient.post("/api/v1/admin/tenants", formData);
```

**Response (201):**
```typescript
{
  data: {
    id: string
    name: string
    slug: string
    status: string
    clientKey: string
    clientSecret: string                 // ⚠️ Retornado APENAS nesta resposta — formato: ts_live_{clientKey}_{hex64}
    clientSecretLast4: string
    branding: TenantBrandingResponse
    createdAt: string
  }
}
```

**UI:** Após criação, exibir modal com `clientKey` e `clientSecret`. Alertar que o `clientSecret` não poderá ser visualizado novamente.

#### 5.2.4 Atualizar Tenant

```
PUT /api/v1/admin/tenants/{id}
```

**Role mínimo:** SUPER_ADMIN

**Content-Type:** `multipart/form-data`

**Request (FormData — todos opcionais):**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `name` | string? | Novo nome |
| `slug` | string? | Novo slug |
| `status` | string? | `"ACTIVE"` \| `"SUSPENDED"` \| `"BLOCKED"` |
| `branding.logo` | File? | Novo arquivo de logo (substitui o anterior) |
| `branding.favicon` | File? | Novo arquivo de favicon (substitui o anterior) |
| `branding.*` | string? | Demais campos de branding (mesma estrutura da criação) |

> **Nota:** Ao enviar novo logo ou favicon, o backend deleta automaticamente o arquivo anterior do storage antes de fazer o upload do novo.

**Response:** `TenantResponse` atualizado.

#### 5.2.5 UI Sugerida — Gestão de Tenants

- **Lista:** tabela com (nome, slug, status, clientKey, data de criação)
- **Filtro:** tabs por status (Ativo, Suspenso, Bloqueado)
- **Detalhe:** página com:
  - Informações gerais (nome, slug, clientKey, secretLast4)
  - Preview de branding (cores, logo, fontes)
  - Formulário de edição de branding com preview ao vivo
  - Alterar status (Suspender/Bloquear/Reativar)
  - Lista de merchants vinculados ao tenant (filtrar lista de merchants por tenantId)
- **Criação:** formulário com nome + slug + branding opcional. Modal de confirmação com clientSecret após criação

---

### 5.3 Gestão de Merchants

#### 5.3.1 Listar Merchants

> **Nota multi-tenant:** A listagem retorna merchants de todos os tenants. Use o campo `tenantId` no response para identificar a qual tenant cada merchant pertence.

```
GET /api/v1/admin/merchants
```

**Query Params:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `status` | string? | PENDING, ACTIVE, SUSPENDED, BLOCKED |
| `verification` | string? | UNVERIFIED, PENDING_REVIEW, VERIFIED, REJECTED |
| `skip` | int | Offset |
| `limit` | int | Itens por página |

**Response:**
```typescript
{
  data: {
    items: MerchantAdminResponse[]
    total: number
    skip: number
    limit: number
  }
}
```

**MerchantAdminResponse:**
```typescript
{
  id: string
  tenantId: string                       // ID do tenant ao qual o merchant pertence
  legalName: string
  tradeName: string
  documentNumber: string
  documentType: "CPF" | "CNPJ"
  email: string
  phone: string
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | "BLOCKED"
  verificationStatus: "UNVERIFIED" | "PENDING_REVIEW" | "VERIFIED" | "REJECTED"
  createdAt: string
  updatedAt: string
}
```

#### 5.3.2 Detalhe do Merchant

```
GET /api/v1/admin/merchants/{id}
```

**Response (completa):**
```typescript
{
  data: {
    id: string
    tenantId: string
    legalName: string
    tradeName: string
    documentNumber: string
    documentType: "CPF" | "CNPJ"
    email: string
    phone: string
    status: "PENDING" | "ACTIVE" | "SUSPENDED" | "BLOCKED"
    verificationStatus: "UNVERIFIED" | "PENDING_REVIEW" | "VERIFIED" | "REJECTED"
    settings: {
      webhookUrl: string | null
      twoFactorEnabled: boolean
      dailyWithdrawalLimit: number       // Centavos
      autoWithdrawalEnabled: boolean
      autoWithdrawalThreshold: number | null  // Centavos
    }
    balance: {                             // null se merchant ainda não tiver saldo criado
      available: number                    // Centavos — saldo disponível para saque
      pending: number                      // Centavos — saldo pendente (aguardando compensação)
      retained: number                     // Centavos — saldo retido (disputas, etc.)
      currency: string                     // Ex: "BRL"
    } | null
    createdAt: string
    updatedAt: string
  }
}
```

> **Nota:** Este endpoint **não** retorna documentos KYC nem credenciais de API. Ver seções 5.3.8 e 5.3.9 para esses dados.

#### 5.3.3 Criar Merchant (pelo Admin)

```
POST /api/v1/admin/merchants
```

**Role mínimo:** ADMIN

**Request:**
```typescript
{
  tenantId: string                       // ⚠️ Obrigatório — ID do tenant ao qual o merchant será vinculado
  legalName: string
  tradeName: string
  documentNumber: string
  documentType: "CPF" | "CNPJ"
  email: string
  phone: string
  password: string
  status: string | null                  // Pode já criar como ACTIVE
  verificationStatus: string | null      // Pode já criar como VERIFIED
}
```

**Response (201):**
```typescript
{
  data: {
    id: string
    tenantId: string
    legalName: string
    tradeName: string
    documentNumber: string
    documentType: string
    email: string
    phone: string
    status: string
    verificationStatus: string
    createdAt: string
  }
}
```

**UI:** O formulário de criação deve ter um dropdown/select para escolher o tenant (carregar via `GET /api/v1/admin/tenants`).

#### 5.3.4 Alterar Status do Merchant

```
PUT /api/v1/admin/merchants/{id}/status
```

**Role mínimo:** SUPPORT

**Request:**
```typescript
{
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | "BLOCKED"
  reason: string | null          // Motivo da alteração (vai para audit log)
}
```

**Transições válidas:**
- `PENDING` → `ACTIVE` (aprovação)
- `ACTIVE` → `SUSPENDED` (suspensão temporária)
- `SUSPENDED` → `ACTIVE` (reativação)
- `ACTIVE` → `BLOCKED` (bloqueio)
- `BLOCKED` → `ACTIVE` (desbloqueio — requer ADMIN+)

**UI:** dialog de confirmação com campo de motivo obrigatório.

#### 5.3.5 Review de Verificação KYC

```
PUT /api/v1/admin/merchants/{id}/verification
```

**Role mínimo:** SUPPORT

**Request:**
```typescript
{
  verificationStatus: "VERIFIED" | "REJECTED"
  notes: string | null           // Notas do reviewer
}
```

**Response (200):**
```typescript
{
  data: {
    id: string
    verificationStatus: "VERIFIED" | "REJECTED"
  }
}
```

**Comportamento:** Após atualizar o status de verificação, o backend invalida automaticamente o cache do merchant para que o novo status seja refletido imediatamente em todas as consultas subsequentes.

**UI:** na página de detalhe do merchant, exibir todos os documentos enviados (com preview/download), e botões "Aprovar" / "Rejeitar" com campo de notas.

#### 5.3.6 Atualizar Settings do Merchant (Admin)

```
PUT /api/v1/admin/merchants/{id}/settings
```

**Role mínimo:** ADMIN

**Request:**
```typescript
{
  webhookUrl: string | null
  twoFactorEnabled: boolean | null
  dailyWithdrawalLimit: number | null        // Centavos
  autoWithdrawalEnabled: boolean | null
  autoWithdrawalThreshold: number | null     // Centavos
}
```

#### 5.3.7 Criar Credencial para Merchant (Admin)

```
POST /api/v1/admin/merchants/{id}/credentials
```

**Role mínimo:** ADMIN

**Request:**
```typescript
{
  label: string
  environment: "LIVE" | "TEST"
}
```

**Response (201):**
```typescript
{
  data: {
    id: string
    tenantId: string
    merchantId: string
    label: string
    publicKey: string
    secretKey: string                    // ⚠️ Retornado APENAS nesta resposta — nunca mais
    environment: "LIVE" | "TEST"
    createdAt: string
  }
}
```

**UI:** Exibir modal com `publicKey` e `secretKey` após criação. Alerta de que o `secretKey` não poderá ser visualizado novamente.

#### 5.3.8 Listar Credenciais do Merchant (Admin)

```
GET /api/v1/admin/merchants/{id}/credentials
```

**Role mínimo:** SUPPORT

**Response (200):**
```typescript
{
  data: {
    items: [
      {
        id: string
        label: string
        publicKey: string
        secretKeyLast4: string            // Apenas últimos 4 caracteres
        environment: "LIVE" | "TEST"
        isActive: boolean
        lastUsedAt: string | null
        createdAt: string
      }
    ]
    total: number
  }
}
```

**UI:** Tabela na aba "Credenciais" do detalhe do merchant. Exibir publicKey truncada, environment como badge, e lastUsedAt formatado.

#### 5.3.9 Documentos KYC do Merchant (Admin)

```
GET /api/v1/admin/merchants/{id}/documents
```

**Role mínimo:** SUPPORT

**Response (200):**
```typescript
{
  data: {
    items: [
      {
        id: string
        documentType: "IDENTITY_FRONT" | "IDENTITY_BACK" | "SELFIE" | "PROOF_OF_ADDRESS" | "ARTICLES_OF_INCORPORATION" | "OTHER"
        fileUrl: string                    // URL resolvida (pública ou presigned) — usar diretamente para preview/download
        status: "PENDING" | "APPROVED" | "REJECTED"
        rejectionReason: string | null
        reviewedBy: string | null          // ID do admin que revisou
        reviewedAt: string | null
        createdAt: string
      }
    ]
    total: number
  }
}
```

**UI:** Na aba "KYC" do detalhe do merchant — grid de documentos com preview de imagem, status badge (PENDING=amarelo, APPROVED=verde, REJECTED=vermelho), e botões de aprovação/rejeição.

#### 5.3.10 UI Sugerida — Gestão de Merchants

- **Lista:** tabela com (nome, documento, email, status, verificação, data de cadastro)
- **Filtros rápidos:** badges/tabs por status (Pendente, Ativo, Suspenso, Bloqueado)
- **Detalhe:** página completa com:
  - Informações do merchant
  - Status atual + botões de ação (Aprovar, Suspender, Bloquear)
  - Verificação KYC + documentos com preview
  - Saldo do merchant
  - Configurações editáveis
  - Últimas transações (pagamentos e saques)
  - Credenciais de API

---

### 5.4 Verificação / KYC Review

Integrado na gestão de merchants (ver seção 5.3.5 para aprovação/rejeição e seção 5.3.9 para documentos KYC).

**Fluxo dedicado:**
- Na sidebar, item "Verificações Pendentes" que filtra por `verification=PENDING_REVIEW`
- Tabela com merchants aguardando revisão
- Click abre detalhe com documentos e botões de ação

---

### 5.5 Transações

#### 5.5.1 Pagamentos Cross-Merchant

```
GET /api/v1/admin/payments
```

**Query Params:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `merchantId` | string? | Filtrar por merchant |
| `status` | string? | Status do pagamento |
| `method` | string? | Método de pagamento |
| `skip` | int | Offset |
| `limit` | int | Itens por página |

**Response:**
```typescript
{
  data: {
    items: PaymentResponse[]     // Mesmo DTO do Seller, mas cross-merchant
    total: number
    skip: number
    limit: number
  }
}
```

**PaymentResponse (completo):**
```typescript
{
  id: string
  merchantId: string                 // ← visível para admin (diferente do Seller)
  method: "PIX" | "BOLETO" | "CREDIT_CARD" | "DEBIT_CARD"
  status: "CREATED" | "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED" | "EXPIRED"
  amount: number
  feeAmount: number
  netAmount: number
  currency: string
  description: string | null
  isTest: boolean

  pix: {
    qrCode: string
    qrCodeUrl: string | null
  } | null

  boleto: {
    barcode: string
    boletoUrl: string | null
    dueDate: string
  } | null

  card: {
    lastFourDigits: string
    brand: string
    installments: number
  } | null

  payer: {
    name: string
    maskedDocument: string
    email: string | null
    phone: string | null
  } | null

  expiresAt: string | null
  paidAt: string | null
  failedAt: string | null
  failureReason: string | null
  metadata: Record<string, string> | null
  createdAt: string
  updatedAt: string
}
```

#### 5.5.2 Saques Cross-Merchant

```
GET /api/v1/admin/withdrawals
```

**Query Params:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `merchantId` | string? | Filtrar por merchant |
| `status` | string? | Status do saque |
| `skip` | int | Offset |
| `limit` | int | Itens por página |

**Response:**
```typescript
{
  data: {
    items: WithdrawalResponse[]
    total: number
    skip: number
    limit: number
  }
}
```

**WithdrawalResponse:**
```typescript
{
  id: string
  merchantId: string
  externalId: string | null
  providerName: string | null
  status: "REQUESTED" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED"
  amount: number
  feeAmount: number
  netAmount: number
  currency: string
  recipient: {
    pixKey: string
    pixKeyType: string
    name: string
    documentNumber: string
  }
  completedAt: string | null
  failedAt: string | null
  failureReason: string | null
  createdAt: string
  updatedAt: string
}
```

**UI sugerida:**
- Duas tabs ou páginas separadas: Pagamentos e Saques
- Coluna extra "Merchant" em ambas as tabelas (link para detalhe do merchant)
- Filtros: merchant (dropdown/busca), status, método, período
- Exportação (se implementado)

---

### 5.6 Disputas

#### 5.6.1 Listar Disputas

```
GET /api/v1/admin/disputes
```

**Response:**
```typescript
{
  data: [
    {
      id: string
      paymentId: string
      merchantId: string
      disputeType: "MED" | "CHARGEBACK" | "REFUND_REQUEST"
      status: "OPEN" | "UNDER_REVIEW" | "ACCEPTED" | "REJECTED" | "RESOLVED"
      amount: number                 // Centavos
      reason: string | null
      resolution: string | null
      externalId: string | null
      openedAt: string
      resolvedAt: string | null
      createdAt: string
      updatedAt: string
    }
  ]
}
```

#### 5.6.2 Resolver Disputa

```
PUT /api/v1/admin/disputes/{id}
```

**Role mínimo:** SUPPORT

**Request:**
```typescript
{
  resolution: string             // Texto da resolução
  status: "ACCEPTED" | "REJECTED" | "RESOLVED"
}
```

**UI sugerida:**
- Tabela com (ID, merchant, tipo, valor, status, data abertura)
- Filtro por status (Aberta, Em análise, Resolvida)
- Detalhe: informações do pagamento relacionado + dados da disputa
- Formulário de resolução: dropdown de status + textarea para resolução
- Timeline visual: abertura → análise → resolução

---

### 5.7 Regras de Taxas

#### 5.7.1 Listar Regras

```
GET /api/v1/fees/rules?page={page}&pageSize={pageSize}
```

**Response:**
```typescript
{
  data: {
    items: FeeRuleResponse[]
    total: number
    page: number
    pageSize: number
  }
}
```

**FeeRuleResponse:**
```typescript
{
  id: string
  merchantId: string | null          // null = regra global (default)
  feeType: "PIX" | "BOLETO" | "CREDIT_CARD" | "DEBIT_CARD" | "WITHDRAWAL" | "ANTICIPATION"
  calculation: "PERCENTAGE" | "FIXED" | "PERCENTAGE_PLUS_FIXED"
  percentageRate: number             // Basis points (250 = 2.5%)
  fixedAmount: number                // Centavos
  minFee: number | null              // Taxa mínima (centavos)
  maxFee: number | null              // Taxa máxima (centavos)
  isActive: boolean
  createdAt: string
  updatedAt: string
}
```

#### 5.7.2 Criar Regra

```
POST /api/v1/fees/rules
```

**Request:**
```typescript
{
  merchantId: string | null          // null = regra global
  feeType: "PIX" | "BOLETO" | "CREDIT_CARD" | "DEBIT_CARD" | "WITHDRAWAL" | "ANTICIPATION"
  calculation: "PERCENTAGE" | "FIXED" | "PERCENTAGE_PLUS_FIXED"
  percentageRate: number             // Basis points (ex: 250 = 2.5%)
  fixedAmount: number                // Centavos
  minFee: number | null
  maxFee: number | null
}
```

#### 5.7.3 Atualizar Regra

```
PUT /api/v1/fees/rules/{id}
```

**Request (todos opcionais):**
```typescript
{
  feeType: string | null
  calculation: string | null
  percentageRate: number | null
  fixedAmount: number | null
  minFee: number | null
  maxFee: number | null
  isActive: boolean | null
}
```

#### 5.7.4 Excluir Regra

```
DELETE /api/v1/fees/rules/{id}
```

#### 5.7.5 Regras de um Merchant Específico

```
GET /api/v1/fees/merchants/{merchantId}/rules
```

Retorna lista de `FeeRuleResponse` ativas para aquele merchant (incluindo globais e específicas).

#### 5.7.6 Simular Taxa

```
POST /api/v1/fees/simulate
```

**Request:**
```typescript
{
  feeType: "PIX" | "BOLETO" | "CREDIT_CARD" | "DEBIT_CARD" | "WITHDRAWAL" | "ANTICIPATION"
  amount: number                     // Valor bruto em centavos
  merchantId: string | null          // null = usar regra global
}
```

**Response:**
```typescript
{
  data: {
    grossAmount: number              // Valor bruto (centavos)
    feeAmount: number                // Valor da taxa (centavos)
    netAmount: number                // Valor líquido (centavos)
    ruleId: string | null            // ID da regra aplicada
    calculationType: string | null   // Tipo de cálculo usado
  }
}
```

**UI sugerida:**
- **Regras globais:** tabela separada para regras onde `merchantId == null`
- **Regras por merchant:** tabela filtrável por merchant
- **Formulário de criação/edição:**
  - Dropdown: tipo de taxa
  - Dropdown: tipo de cálculo
  - Input: percentual (exibir como %, armazenar como basis points → `2.5%` = `250`)
  - Input: valor fixo (exibir como R$, armazenar em centavos)
  - Inputs opcionais: taxa mínima e máxima
- **Simulador:** formulário lateral para testar taxas em tempo real
- **Formatação de basis points:** `percentageRate / 100` para exibir como percentual. Ex: `250` → `2,50%`

---

### 5.8 Gestão de Admins

#### 5.8.1 Criar Admin

```
POST /api/v1/admin/users
```

**Role mínimo:** SUPER_ADMIN

**Request:**
```typescript
{
  name: string
  email: string
  password: string
  role: "SUPER_ADMIN" | "ADMIN" | "SUPPORT" | "VIEWER"
}
```

#### 5.8.2 Listar Admins

```
GET /api/v1/admin/users
```

**Role mínimo:** SUPER_ADMIN

**Query Params:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `skip` | int | Offset |
| `limit` | int | Itens por página |

**Response:**
```typescript
{
  data: {
    items: [
      {
        id: string
        name: string
        email: string
        role: "SUPER_ADMIN" | "ADMIN" | "SUPPORT" | "VIEWER"
        isActive: boolean
        createdAt: string
        updatedAt: string
      }
    ]
    total: number
    skip: number
    limit: number
  }
}
```

#### 5.8.3 Obter Admin

```
GET /api/v1/admin/users/{id}
```

#### 5.8.4 Atualizar Admin

```
PUT /api/v1/admin/users/{id}
```

**Role mínimo:** SUPER_ADMIN

**Request:**
```typescript
{
  name: string | null
  role: string | null
  isActive: boolean | null
}
```

#### 5.8.5 Desativar Admin

```
DELETE /api/v1/admin/users/{id}
```

**Role mínimo:** SUPER_ADMIN

**Nota:** Soft delete — marca como `isActive: false`. Não pode desativar a si mesmo.

**UI sugerida:**
- Tabela com (nome, email, role, status, criado em)
- Modal de criação com campos obrigatórios
- Edição inline ou modal para alterar role
- Toggle para ativar/desativar
- Somente visível para SUPER_ADMIN

---

### 5.9 Auditoria

```
GET /api/v1/admin/audit
```

**Query Params (esperados):**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `userId` | string? | Filtrar por ator |
| `action` | string? | Filtrar por tipo de ação |
| `resourceType` | string? | Filtrar por tipo de recurso |
| `skip` | int | Offset |
| `limit` | int | Itens por página |

**Response:**
```typescript
{
  data: [
    {
      id: string
      userId: string
      userType: "MERCHANT" | "ADMIN" | "SYSTEM"
      merchantId: string | null
      action: string                     // Ex: "CREATE_PAYMENT", "UPDATE_MERCHANT_STATUS"
      resourceType: string               // Ex: "PAYMENT", "MERCHANT", "WITHDRAWAL"
      resourceId: string
      changes: {
        before: object | null            // Estado anterior
        after: object | null             // Estado posterior
      } | null
      ipAddress: string
      createdAt: string
    }
  ]
}
```

**UI sugerida:**
- Timeline/tabela cronológica reversa
- Filtros: ator (dropdown de admins), ação, tipo de recurso, período
- Expandir item para ver `changes.before` e `changes.after` (diff visual)
- Link para o recurso afetado (merchant, pagamento, etc.)
- Exportação para CSV (se implementado)

**Ações comuns logadas:**
| Ação | Descrição |
|------|-----------|
| `CREATE_PAYMENT` | Pagamento criado |
| `CANCEL_PAYMENT` | Pagamento cancelado |
| `CREATE_WITHDRAWAL` | Saque solicitado |
| `UPDATE_MERCHANT_STATUS` | Status do merchant alterado |
| `REVIEW_MERCHANT_VERIFICATION` | Verificação KYC revisada |
| `CREATE_FEE_RULE` | Regra de taxa criada |
| `DELETE_FEE_RULE` | Regra de taxa excluída |
| `CREATE_ADMIN` | Admin criado |
| `DEACTIVATE_ADMIN` | Admin desativado |
| `RESOLVE_DISPUTE` | Disputa resolvida |

---

### 5.10 Provedores

```
GET /api/v1/admin/providers
```

**Response:**
```typescript
{
  data: [
    {
      name: string                       // Ex: "transfeera"
      type: string                       // "PAYMENT" | "BANKING"
      isActive: boolean
      supportedMethods: string[]         // Ex: ["PIX", "BOLETO"]
      // Outros campos de configuração (sem secrets expostos)
    }
  ]
}
```

**UI sugerida:**
- Cards por provedor (nome, tipo, métodos suportados, status)
- Indicador visual de saúde/disponibilidade (se disponível)
- Leitura somente (configuração via env vars, não pela UI)

---

### 5.11 Diagnósticos

#### 5.11.1 Listar Logs HTTP

```
GET /api/v1/diagnostics/logs
```

**Query Params:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `dateFrom` | string? | ISO 8601 — início do período |
| `dateTo` | string? | ISO 8601 — fim do período |
| `level` | string? | Nível do log |
| `statusCode` | int? | Código HTTP da resposta |
| `method` | string? | HTTP method (GET, POST, etc.) |
| `path` | string? | Filtrar por path (substring) |
| `traceId` | string? | Filtrar por trace ID |
| `merchantId` | string? | Filtrar por merchant |
| `hasError` | boolean? | Apenas requisições com erro |
| `skip` | int | Offset |
| `limit` | int | Itens por página |

**Response:**
```typescript
{
  data: {
    items: [
      {
        id: string
        traceId: string
        level: string
        method: string               // GET, POST, PUT, DELETE
        path: string                 // /api/v1/payments/pix
        statusCode: number
        durationMs: number           // Tempo de resposta em ms
        merchantId: string | null
        clientIp: string | null
        hasError: boolean
        errorMessage: string | null
        createdAt: string
      }
    ]
    total: number
    skip: number
    limit: number
  }
}
```

#### 5.11.2 Detalhe do Log

```
GET /api/v1/diagnostics/logs/{id}
```

**Response:**
```typescript
{
  data: {
    id: string
    traceId: string
    level: string
    method: string
    path: string
    queryString: string | null
    requestHeaders: Record<string, string> | null
    requestBody: string | null
    responseBody: string | null
    statusCode: number
    durationMs: number
    merchantId: string | null
    userId: string | null
    clientIp: string | null
    userAgent: string | null
    error: {
      message: string
      stackTrace: string | null
      type: string
    } | null
    createdAt: string
  }
}
```

#### 5.11.3 Logs por Trace ID

```
GET /api/v1/diagnostics/logs/trace/{traceId}
```

Retorna todos os logs com o mesmo `traceId` (útil para rastrear uma requisição inteira).

#### 5.11.4 Estatísticas

```
GET /api/v1/diagnostics/logs/stats
```

**Response:**
```typescript
{
  data: {
    // Estatísticas agregadas por path, status code, tempo de resposta médio
    // Estrutura varia — ver implementação do backend
  }
}
```

#### 5.11.5 Purgar Logs

```
DELETE /api/v1/diagnostics/logs?olderThanDays={days}
```

**Nota:** operação destrutiva — confirmar antes de executar.

**UI sugerida:**
- **Lista:** tabela com (traceId, método, path, status, duração, IP, data)
- **Filtros avançados:** todos os query params acima
- **Cor por status:** 2xx=verde, 4xx=amarelo, 5xx=vermelho
- **Detalhe:** painel lateral ou página com request/response bodies (formatados como JSON)
- **Trace view:** agrupar logs pelo mesmo traceId
- **Estatísticas:** gráficos de latência, distribuição de status codes, endpoints mais chamados
- **Busca por traceId:** campo de busca dedicado

---

### 5.12 Configuração da Plataforma

```
GET /api/v1/admin/config
```

**Response:** snapshot de configuração da plataforma (read-only via UI).

**Nota:** Configurações são alteradas via env vars e restart. Esta tela serve para visualizar o estado atual.

---

## 6. Contrato de API (RouteMessages)

Idêntico ao Seller. Toda resposta segue o envelope:

```json
{
  "responseType": "OK",
  "message": "...",
  "title": "...",
  "status": 200,
  "data": { ... },
  "extendedResultCode": "...",
  "date": "2026-03-23T12:00:00.000Z"
}
```

---

## 7. Enums e Constantes

### Status de Tenant
| Valor | Cor sugerida | Descrição |
|-------|-------------|-----------|
| `ACTIVE` | Verde | Ativo |
| `SUSPENDED` | Laranja | Suspenso |
| `BLOCKED` | Vermelho | Bloqueado |

### Status de Merchant
| Valor | Cor sugerida | Descrição |
|-------|-------------|-----------|
| `PENDING` | Amarelo | Pendente de aprovação |
| `ACTIVE` | Verde | Ativo |
| `SUSPENDED` | Laranja | Suspenso |
| `BLOCKED` | Vermelho | Bloqueado |

### Status de Verificação
| Valor | Cor sugerida | Descrição |
|-------|-------------|-----------|
| `UNVERIFIED` | Cinza | Não verificado |
| `PENDING_REVIEW` | Amarelo | Aguardando revisão |
| `VERIFIED` | Verde | Verificado |
| `REJECTED` | Vermelho | Rejeitado |

### Status de Pagamento
| Valor | Cor sugerida |
|-------|-------------|
| `CREATED` | Cinza |
| `PENDING` | Amarelo |
| `PAID` | Verde |
| `FAILED` | Vermelho |
| `CANCELLED` | Cinza escuro |
| `REFUNDED` | Azul |
| `EXPIRED` | Laranja |

### Status de Saque
| Valor | Cor sugerida |
|-------|-------------|
| `REQUESTED` | Amarelo |
| `PROCESSING` | Azul |
| `COMPLETED` | Verde |
| `FAILED` | Vermelho |
| `CANCELLED` | Cinza |

### Status de Disputa
| Valor | Cor sugerida |
|-------|-------------|
| `OPEN` | Vermelho |
| `UNDER_REVIEW` | Amarelo |
| `ACCEPTED` | Verde |
| `REJECTED` | Cinza escuro |
| `RESOLVED` | Azul |

### Tipo de Disputa
| Valor | Label |
|-------|-------|
| `MED` | MED (Mecanismo Especial de Devolução) |
| `CHARGEBACK` | Chargeback |
| `REFUND_REQUEST` | Solicitação de Estorno |

### Tipo de Taxa
| Valor | Label |
|-------|-------|
| `PIX` | PIX |
| `BOLETO` | Boleto |
| `CREDIT_CARD` | Cartão de Crédito |
| `DEBIT_CARD` | Cartão de Débito |
| `WITHDRAWAL` | Saque |
| `ANTICIPATION` | Antecipação |

### Cálculo de Taxa
| Valor | Descrição |
|-------|-----------|
| `PERCENTAGE` | Apenas percentual |
| `FIXED` | Apenas valor fixo |
| `PERCENTAGE_PLUS_FIXED` | Percentual + fixo |

### Roles de Admin
| Valor | Nível |
|-------|-------|
| `SUPER_ADMIN` | 4 — Acesso total |
| `ADMIN` | 3 — Quase tudo |
| `SUPPORT` | 2 — Ações de suporte |
| `VIEWER` | 1 — Somente leitura |

### Método de Pagamento
| Valor | Label |
|-------|-------|
| `PIX` | PIX |
| `BOLETO` | Boleto |
| `CREDIT_CARD` | Cartão de Crédito |
| `DEBIT_CARD` | Cartão de Débito |

### Tipo de Chave PIX
| Valor | Descrição |
|-------|-----------|
| `CPF` | CPF (11 dígitos) |
| `CNPJ` | CNPJ (14 dígitos) |
| `EMAIL` | Email |
| `PHONE` | Telefone (+55) |
| `RANDOM` | Chave aleatória (UUID) |

### Tipos de Documento KYC
| Valor | Label |
|-------|-------|
| `IDENTITY_FRONT` | Frente do documento |
| `IDENTITY_BACK` | Verso do documento |
| `SELFIE` | Selfie com documento |
| `PROOF_OF_ADDRESS` | Comprovante de endereço |
| `ARTICLES_OF_INCORPORATION` | Contrato social |
| `OTHER` | Outro |

### Status de Documento KYC
| Valor | Cor sugerida | Descrição |
|-------|-------------|-----------|
| `PENDING` | Amarelo | Aguardando revisão |
| `APPROVED` | Verde | Aprovado pelo admin |
| `REJECTED` | Vermelho | Rejeitado pelo admin |

### Tipo de Ambiente (API Keys)
| Valor | Descrição |
|-------|-----------|
| `LIVE` | Produção |
| `TEST` | Sandbox |

### Tipo de Entrada no Ledger
| Valor | Direção |
|-------|---------|
| `CREDIT` | + |
| `DEBIT` | - |
| `RETENTION` | - |
| `RETENTION_RELEASE` | + |
| `FEE_DEDUCTION` | - |
| `ANTICIPATION` | + |

### Tipo de Ator (Audit)
| Valor | Descrição |
|-------|-----------|
| `MERCHANT` | Ação feita por merchant |
| `ADMIN` | Ação feita por admin |
| `SYSTEM` | Ação automática do sistema |

### Eventos de Webhook
| Valor | Descrição |
|-------|-----------|
| `payment.created` | Pagamento criado |
| `payment.paid` | Pagamento confirmado |
| `payment.failed` | Pagamento falhou |
| `payment.expired` | Pagamento expirou |
| `payment.cancelled` | Pagamento cancelado |
| `payment.refunded` | Pagamento estornado |
| `withdrawal.requested` | Saque solicitado |
| `withdrawal.completed` | Saque concluído |
| `withdrawal.failed` | Saque falhou |
| `dispute.opened` | Disputa aberta |
| `dispute.resolved` | Disputa resolvida |
| `merchant.verified` | Merchant verificado |

---

## 8. Controle de Acesso por Role

A UI deve ocultar ações e menus baseados no role do admin logado:

| Feature / Ação | VIEWER | SUPPORT | ADMIN | SUPER_ADMIN |
|----------------|--------|---------|-------|-------------|
| Dashboard (visualizar) | ✅ | ✅ | ✅ | ✅ |
| Tenants (listar) | ❌ | ❌ | ❌ | ✅ |
| Tenants (detalhe) | ❌ | ❌ | ❌ | ✅ |
| Tenants (criar) | ❌ | ❌ | ❌ | ✅ |
| Tenants (atualizar) | ❌ | ❌ | ❌ | ✅ |
| Merchants (listar) | ✅ | ✅ | ✅ | ✅ |
| Merchants (detalhe) | ✅ | ✅ | ✅ | ✅ |
| Merchants (criar) | ❌ | ❌ | ✅ | ✅ |
| Merchants (alterar status) | ❌ | ✅ | ✅ | ✅ |
| Merchants (review KYC) | ❌ | ✅ | ✅ | ✅ |
| Merchants (alterar settings) | ❌ | ❌ | ✅ | ✅ |
| Merchants (criar credentials) | ❌ | ❌ | ✅ | ✅ |
| Merchants (listar credentials) | ❌ | ✅ | ✅ | ✅ |
| Merchants (ver documentos KYC) | ❌ | ✅ | ✅ | ✅ |
| Transações (listar) | ✅ | ✅ | ✅ | ✅ |
| Disputas (listar) | ✅ | ✅ | ✅ | ✅ |
| Disputas (resolver) | ❌ | ✅ | ✅ | ✅ |
| Taxas (listar) | ✅ | ✅ | ✅ | ✅ |
| Taxas (criar/editar/excluir) | ❌ | ❌ | ✅ | ✅ |
| Taxas (simular) | ✅ | ✅ | ✅ | ✅ |
| Admins (listar) | ❌ | ❌ | ❌ | ✅ |
| Admins (criar/editar/desativar) | ❌ | ❌ | ❌ | ✅ |
| Auditoria (listar) | ✅ | ✅ | ✅ | ✅ |
| Provedores (listar) | ✅ | ✅ | ✅ | ✅ |
| Diagnósticos (listar) | ❌ | ❌ | ✅ | ✅ |
| Diagnósticos (purgar) | ❌ | ❌ | ❌ | ✅ |
| Configuração (visualizar) | ❌ | ❌ | ✅ | ✅ |

**Implementação:**
1. Decodificar JWT para extrair `role`
2. Criar helper `hasPermission(role, requiredRole)` → compara nível
3. Usar em route guards E na renderização de botões/menus
4. Se o backend retornar 403, exibir mensagem de acesso negado

---

## 9. Guia de Navegação e Rotas

```
/login                              → Tela de login admin
/login/2fa                          → Tela de código 2FA (após login com 2FA ativo)
/forgot-password                    → Solicitar reset de senha
/reset-password                     → Confirmar reset de senha (com token)

/dashboard                          → Dashboard global

/settings/security                  → Configurações de 2FA do admin logado

/tenants                            → Lista de tenants (SUPER_ADMIN)
/tenants/:id                        → Detalhe do tenant
/tenants/new                        → Criar tenant (SUPER_ADMIN)

/merchants                          → Lista de merchants
/merchants/:id                      → Detalhe do merchant (com abas)
/merchants/:id/verification         → Review de KYC
/merchants/:id/settings             → Configurações do merchant
/merchants/new                      → Criar merchant (ADMIN+)
/merchants/pending-verification     → Merchants pendentes de verificação

/transactions/payments              → Pagamentos cross-merchant
/transactions/payments/:id          → Detalhe do pagamento
/transactions/withdrawals           → Saques cross-merchant
/transactions/withdrawals/:id       → Detalhe do saque

/disputes                           → Lista de disputas
/disputes/:id                       → Detalhe e resolução de disputa

/fees                               → Lista de regras de taxas
/fees/new                           → Criar regra
/fees/:id                           → Editar regra
/fees/simulate                      → Simulador de taxas

/admin-users                        → Lista de admins (SUPER_ADMIN)
/admin-users/new                    → Criar admin
/admin-users/:id                    → Editar admin

/audit                              → Audit log

/providers                          → Provedores de pagamento

/diagnostics                        → Logs HTTP
/diagnostics/:id                    → Detalhe do log
/diagnostics/trace/:traceId         → Logs por trace

/config                             → Configuração da plataforma
```

**Route Guards:**
- `/login` → redirecionar para `/dashboard` se já autenticado
- Todas as outras rotas → redirecionar para `/login` se não autenticado
- Rotas de tenants → verificar `SUPER_ADMIN` (todas as operações)
- Rotas de admin-users → verificar `SUPER_ADMIN`
- Rotas de diagnósticos → verificar `ADMIN+`
- Ações de escrita → verificar role mínimo conforme tabela da seção 8

---

**Sidebar sugerida:**

```
📊 Dashboard
🏢 Tenants                    ← só SUPER_ADMIN
👥 Merchants
   ├── Todos os Merchants
   └── Verificações Pendentes
💳 Transações
   ├── Pagamentos
   └── Saques
⚠️  Disputas
💰 Taxas
   ├── Regras
   └── Simulador
👤 Administradores         ← só SUPER_ADMIN
📋 Auditoria
🔌 Provedores
🔍 Diagnósticos            ← só ADMIN+
⚙️  Configuração            ← só ADMIN+
```

---

> **Nota final:** Esta documentação cobre todos os endpoints que o Frontend Admin consome. Para dúvidas sobre a arquitetura de pastas e padrões de código, consultar `murillo's-architecture-frontend.md`. Para regras inegociáveis do projeto, consultar `PROJECT_RULES.md`.

---

## Apêndice: Endpoints Implementados (Changelog)

Endpoints adicionados ao backend que antes eram pendentes:

| Endpoint | Seção | Status |
|----------|-------|--------|
| `GET /api/v1/admin/merchants/{id}/credentials` | 5.3.8 | Implementado |
| `GET /api/v1/admin/merchants/{id}/documents` | 5.3.9 | Implementado |
| `POST /api/v1/auth/admin/2fa/setup` | 4.2.1 | Implementado |
| `POST /api/v1/auth/admin/2fa/verify` | 4.2.2 | Implementado |
| `POST /api/v1/auth/admin/2fa/disable` | 4.2.3 | Implementado |
| `POST /api/v1/auth/admin/2fa/login` | 4.2.4 | Implementado |
| `POST /api/v1/auth/admin/forgot-password` | 4.3.1 | Implementado |
| `POST /api/v1/auth/admin/reset-password` | 4.3.2 | Implementado |

Todos os endpoints necessários para o Frontend Admin estão disponíveis no backend.

