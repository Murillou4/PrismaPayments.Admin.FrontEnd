# Requirements: PrismaPayments Admin Frontend

**Defined:** 2026-03-24
**Core Value:** Equipe interna deve conseguir operar e supervisionar toda a plataforma de pagamentos — aprovar merchants, resolver disputas e monitorar saúde do sistema — através de uma interface confiável e com controle de acesso por role.

## v1 Requirements

### Autenticação e Sessão

- [ ] **AUTH-01**: Admin pode fazer login com email e senha via `/api/v1/auth/admin/login`
- [ ] **AUTH-02**: Tokens (accessToken + refreshToken) são persistidos de forma que o SSR e o cliente permaneçam sincronizados (cookie HttpOnly para SSR + sessionStorage para o cliente)
- [x] **AUTH-03**: Token de acesso expirado é renovado automaticamente via interceptor antes que o usuário perceba (refresh transparente com fila de requisições concorrentes)
- [ ] **AUTH-04**: Todas as rotas admin redirecionam para `/login` se o usuário não está autenticado
- [x] **AUTH-05**: Role do admin é extraído do JWT (sem verificação de assinatura no cliente) e disponibilizado globalmente para guards e renderização condicional
- [ ] **AUTH-06**: Logout limpa todos os tokens (cookie + sessionStorage) e redireciona para `/login`

### Controle de Acesso por Role (RBAC)

- [x] **RBAC-01**: Rotas e ações são protegidas por role mínimo: VIEWER / SUPPORT / ADMIN / SUPER_ADMIN
- [x] **RBAC-02**: Itens de menu e botões de ação são ocultados (não desabilitados) quando o role do usuário é insuficiente
- [x] **RBAC-03**: Retorno 403 do backend exibe mensagem de acesso negado (não redireciona para login)
- [x] **RBAC-04**: Guards são aplicados tanto no SSR (`+page.server.ts`) quanto no cliente (`onMount`)

### Infraestrutura Compartilhada

- [x] **INFRA-01**: Componente `DataTable<T>` genérico com paginação, colunas configuráveis via `ColumnDef[]` e cell slots — reutilizado em todas as features de listagem
- [x] **INFRA-02**: Componentes de filtro reutilizáveis: filtro por texto, por status (dropdown), por período (date range picker) — compostos por feature
- [x] **INFRA-03**: Componente `StatusBadge` com mapeamento de cor por entidade (Merchant, Pagamento, Saque, Disputa, Verificação)
- [x] **INFRA-04**: `ConfirmDialog` reutilizável com campo de motivo opcional para ações destrutivas
- [x] **INFRA-05**: Sistema de toast/notificação (`svelte-sonner`) para feedback de ações (sucesso, erro, loading)
- [x] **INFRA-06**: Error boundary global (`+error.svelte`) com UI amigável
- [x] **INFRA-07**: Redirecionamento de `/` para `/dashboard` via SvelteKit server redirect (substituindo o meta refresh atual)
- [x] **INFRA-08**: Formatação correta de valores monetários: centavos como inteiros → `Intl.NumberFormat('pt-BR', {style:'currency', currency:'BRL'})`

### Dashboard

- [ ] **DASH-01**: Cards de métricas globais: volume total, transações do dia, saldo disponível da plataforma, taxas coletadas, total de merchants
- [x] **DASH-02**: Gráfico de volume e transações por período (diário/semanal/mensal)
- [x] **DASH-03**: Alertas visuais: disputas abertas, verificações pendentes de KYC

### Gestão de Merchants

- [ ] **MERCH-01**: Lista paginada de merchants com filtros por status (PENDING/ACTIVE/SUSPENDED/BLOCKED) e por verificação (UNVERIFIED/PENDING_REVIEW/VERIFIED/REJECTED)
- [ ] **MERCH-02**: Tabs de filtro rápido por status na lista (count por tab)
- [x] **MERCH-03**: Página de detalhe do merchant com abas: Info / KYC / Saldo / Configurações / Transações / Credenciais
- [ ] **MERCH-04**: Ações de status do merchant (Aprovar / Suspender / Bloquear / Reativar) com dialog de confirmação e campo de motivo obrigatório (role SUPPORT+)
- [ ] **MERCH-05**: Review de KYC: visualização de documentos enviados (frente, verso, selfie, comprovante, contrato) com preview/download; botões Aprovar/Rejeitar com campo de notas (role SUPPORT+)
- [x] **MERCH-06**: Criar merchant pelo admin com formulário completo (role ADMIN+)
- [x] **MERCH-07**: Editar configurações do merchant: webhook URL, limites de saque, auto-withdrawal (role ADMIN+)
- [x] **MERCH-08**: Criar credencial de API para merchant com seleção de ambiente LIVE/TEST; exibir secretKey apenas uma vez (role ADMIN+)
- [ ] **MERCH-09**: Entrada dedicada na sidebar "Verificações Pendentes" filtrando por `verification=PENDING_REVIEW` com badge de contagem

### Transações

- [ ] **TXN-01**: Lista paginada de pagamentos cross-merchant com filtros: merchant, status, método de pagamento, período
- [ ] **TXN-02**: Coluna "Merchant" nas listas de transações com link navegável para detalhe do merchant
- [ ] **TXN-03**: Detalhe de pagamento: dados completos incluindo info de PIX, Boleto ou Cartão conforme método
- [x] **TXN-04**: Lista paginada de saques cross-merchant com filtros: merchant, status
- [x] **TXN-05**: Detalhe de saque: dados do recipient (chave PIX e tipo), status, valores bruto/taxa/líquido

### Disputas

- [x] **DISP-01**: Lista paginada de disputas com filtros por status (OPEN/UNDER_REVIEW/ACCEPTED/REJECTED/RESOLVED) e por tipo (MED/CHARGEBACK/REFUND_REQUEST)
- [x] **DISP-02**: Timeline visual de estado da disputa (abertura → análise → resolução)
- [x] **DISP-03**: Formulário de resolução: dropdown de status + textarea de resolução — ambos obrigatórios antes de submeter (role SUPPORT+)
- [x] **DISP-04**: MED (Mecanismo Especial de Devolução) destacado visualmente como time-sensitive

### Regras de Taxas

- [ ] **FEES-01**: Lista de regras de taxas globais (merchantId == null) separada das regras por merchant
- [ ] **FEES-02**: Formulário de criação/edição de regra: tipo de taxa, tipo de cálculo, percentual (basis points ↔ %), valor fixo (centavos ↔ R$), mínimo/máximo opcionais (role ADMIN+)
- [ ] **FEES-03**: Exclusão de regra com dialog de confirmação (role ADMIN+)
- [ ] **FEES-04**: Simulador de taxa: formulário com tipo, valor e merchant opcional; resultado exibe bruto / taxa / líquido e a regra aplicada

### Gestão de Admins

- [ ] **ADMIN-01**: Feature completamente oculta para roles abaixo de SUPER_ADMIN (não apenas desabilitada)
- [ ] **ADMIN-02**: Lista paginada de admins com nome, email, role, status ativo/inativo
- [ ] **ADMIN-03**: Criar admin com nome, email, senha e role (role SUPER_ADMIN)
- [ ] **ADMIN-04**: Editar role e ativar/desativar admin; não pode desativar a si mesmo (role SUPER_ADMIN)

### Auditoria

- [ ] **AUDIT-01**: Log cronológico reverso de ações com filtros: ator (admin), tipo de ação, tipo de recurso, período
- [ ] **AUDIT-02**: Expandir entrada do log para ver diff visual (before/after) com campos alterados destacados
- [ ] **AUDIT-03**: IDs de recursos no log são links navegáveis para o recurso afetado (merchant, pagamento, etc.)

### Provedores

- [ ] **PROV-01**: Cards read-only por provedor: nome, tipo (PAYMENT/BANKING), métodos suportados, status ativo/inativo

### Diagnósticos

- [ ] **DIAG-01**: Lista paginada de logs HTTP com filtros avançados: período, level, status code, método HTTP, path, traceId, merchantId, hasError
- [ ] **DIAG-02**: Colorização por status code (2xx verde, 4xx amarelo, 5xx vermelho)
- [ ] **DIAG-03**: Detalhe de log: request/response bodies formatados como JSON, headers, duração, stack trace de erro
- [ ] **DIAG-04**: Trace view: agrupar todos os logs com mesmo traceId
- [ ] **DIAG-05**: Campo de busca rápida por traceId
- [ ] **DIAG-06**: Purgar logs (DELETE com confirmação) — role SUPER_ADMIN

### Configuração da Plataforma

- [ ] **CONFIG-01**: Snapshot read-only da configuração da plataforma (role ADMIN+)

## v2 Requirements

### Funcionalidades Diferenciadas (pós-v1)

- **V2-01**: Widget de aprovações pendentes no dashboard (merchants aguardando + verificações pendentes)
- **V2-02**: Indicador de aging de disputas (tempo em aberto)
- **V2-03**: Gráficos de estatísticas no diagnósticos (latência, distribuição de status codes, endpoints mais chamados)
- **V2-04**: Copy-to-clipboard em todos os IDs (traceId, merchantId, paymentId)
- **V2-05**: Exportação para CSV em listagens de transações e auditoria
- **V2-06**: Notificações em tempo real via WebSocket/SignalR

## Out of Scope

| Feature | Motivo |
|---------|--------|
| Portal Merchant (Seller) | Projeto separado — `PrismaPayments.Seller.FrontEnd` |
| Checkout público (`/pay/{code}`) | Projeto separado |
| 2FA para login admin | Não especificado nos endpoints admin |
| Estorno inline de pagamentos | Não documentado na API admin |
| Impersonação de merchant | Fora do escopo operacional v1 |
| Configuração da plataforma via UI | Read-only; alterações são via env vars + restart |
| Testes automatizados | Sem framework configurado; fora do escopo v1 |

## Traceability

| Requirement | Fase | Status |
|-------------|------|--------|
| AUTH-01 a AUTH-06 | Phase 1 | Pending |
| RBAC-01 a RBAC-04 | Phase 1 | Pending |
| INFRA-01 a INFRA-08 | Phase 1 | Pending |
| DASH-01 a DASH-03 | Phase 1 | Pending |
| MERCH-01 a MERCH-09 | Phase 2 | Pending |
| TXN-01 a TXN-05 | Phase 3 | Pending |
| DISP-01 a DISP-04 | Phase 4 | Pending |
| FEES-01 a FEES-04 | Phase 5 | Pending |
| ADMIN-01 a ADMIN-04 | Phase 6 | Pending |
| AUDIT-01 a AUDIT-03 | Phase 7 | Pending |
| PROV-01 | Phase 8 | Pending |
| DIAG-01 a DIAG-06 | Phase 7 | Pending |
| CONFIG-01 | Phase 8 | Pending |

**Cobertura:**
- v1 requirements: 52 total
- Mapeados para fases: 52
- Sem mapeamento: 0 ✓

---
*Requirements definidos: 2026-03-24*
*Last updated: 2026-03-24 após initialization*
