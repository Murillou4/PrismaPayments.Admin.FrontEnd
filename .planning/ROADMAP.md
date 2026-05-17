# Roadmap: PrismaPayments Admin Frontend

## Overview

Este roadmap transforma os 52 requisitos v1 em 8 fases de entrega para o painel administrativo interno da Prisma Payments. A estrutura parte de um bloqueador crítico — o bug de autenticação que impede qualquer navegação autenticada — e avança em ordem de dependência: infraestrutura compartilhada, depois features de maior valor de negócio (Merchants), depois features transacionais e operacionais, e por fim views read-only de menor complexidade. Cada fase entrega uma capacidade completa e verificável, reutilizando os padrões estabelecidos pela fase anterior. A equipe interna (VIEWER/SUPPORT/ADMIN/SUPER_ADMIN) consegue operar a plataforma de pagamentos ao fim de cada fase, com controle de acesso por role aplicado desde a Fase 1.

## Phases

- [x] **Phase 1: Auth + Core Infrastructure** - Corrigir o bug crítico de cookie, implementar refresh de token, ativar RBAC e construir todos os componentes compartilhados que as demais features dependem (completed 2026-03-25)
- [ ] **Phase 2: Merchants** - Entrega completa da feature de merchants: lista paginada, detalhe tabulado, review de KYC, ações de status e criação — o template que todas as features seguintes copiam
- [ ] **Phase 3: Transactions** - Listas cross-merchant de pagamentos e saques com filtros completos e páginas de detalhe por método de pagamento
- [x] **Phase 4: Disputes** - Lista de disputas com destaque para MED time-sensitive, timeline visual e formulário de resolução para SUPPORT+ (completed 2026-04-16)
- [ ] **Phase 5: Fees** - CRUD de regras de taxas (globais e por merchant) com conversão basis-points/centavos e simulador inline
- [ ] **Phase 6: Admin Users** - Gestão de usuários administrativos exclusiva para SUPER_ADMIN, completamente oculta para outros roles
- [ ] **Phase 7: Audit + Diagnostics** - Log cronológico de auditoria com diff visual e logs HTTP diagnósticos com filtros avançados e trace view
- [ ] **Phase 8: Providers + Platform Config** - Cards read-only de provedores de pagamento e snapshot read-only de configuração da plataforma

## Phase Details

### Phase 1: Auth + Core Infrastructure
**Goal**: Qualquer admin autenticado consegue navegar pelo painel com o role correto aplicado, e todos os componentes compartilhados estão disponíveis para as features seguintes
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, RBAC-01, RBAC-02, RBAC-03, RBAC-04, INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, INFRA-06, INFRA-07, INFRA-08, DASH-01, DASH-02, DASH-03
**Success Criteria** (what must be TRUE):
  1. Admin faz login com email/senha e permanece logado ao navegar entre páginas — o cookie HttpOnly é escrito e lido corretamente pelo SSR
  2. Token expirado é renovado automaticamente em background sem que o admin perceba interrupção, mesmo com múltiplas requisições concorrentes
  3. Admin sem role suficiente é bloqueado tanto no SSR (redirect 403) quanto no cliente ao tentar acessar rota protegida — itens de menu e botões de ação indisponíveis são ocultados, não desabilitados
  4. Dashboard exibe métricas globais (volume, transações, saldo, taxas, merchants), gráfico por período e alertas de disputas abertas e KYC pendente
  5. DataTable, StatusBadge, ConfirmDialog, Toast e filtros reutilizáveis estão funcionando e podem ser consumidos por qualquer feature seguinte
**Plans**: TBD
**UI hint**: yes

### Phase 01.1: shadcn init e identidade visual Prisma (INSERTED)

**Goal:** Inicializar shadcn-svelte, instalar primitivas bits-ui como componentes prontos (Button, Badge, Input, Select, Dialog, Table, etc.) e migrar todos os widgets compartilhados para usar essas primitivas internamente, aplicando identidade visual Prisma (dark theme, magenta/cyan, glow na sidebar)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04
**Depends on:** Phase 1
**Plans:** 3/3 plans complete

Plans:
- [x] 01.1-01-PLAN.md — shadcn init + instalar 13 componentes + CSS vars Prisma em app.css
- [x] 01.1-02-PLAN.md — migrar ConfirmDialog (Dialog bits-ui), StatusBadge (Badge shadcn), Pagination (Button shadcn)
- [x] 01.1-03-PLAN.md — migrar DataTable (Table shadcn), filtros (Select/Input shadcn), AdminLayout glow

### Phase 2: Merchants
**Goal**: Time interno consegue visualizar, criar, gerenciar status e revisar KYC de merchants a partir de uma interface completa e tabulada
**Depends on**: Phase 1
**Requirements**: MERCH-01, MERCH-02, MERCH-03, MERCH-04, MERCH-05, MERCH-06, MERCH-07, MERCH-08, MERCH-09
**Success Criteria** (what must be TRUE):
  1. Admin (VIEWER+) visualiza lista paginada de merchants com filtros por status e verificação, tabs de contagem rápida e entrada dedicada "Verificações Pendentes" na sidebar com badge de contagem
  2. Admin (VIEWER+) abre página de detalhe do merchant com abas Info / KYC / Saldo / Configurações / Transações / Credenciais navegáveis e populadas com dados reais
  3. Admin (SUPPORT+) aprova, suspende, bloqueia ou reativa um merchant via dialog de confirmação com campo de motivo obrigatório — status reflete imediatamente na lista
  4. Admin (SUPPORT+) revisa documentos KYC (imagens e PDFs em preview inline via pdfjs-dist), aprova ou rejeita com campo de notas — resultado persiste
  5. Admin (ADMIN+) cria um novo merchant via formulário completo e cria credencial de API exibindo o secretKey apenas uma vez
**Plans**: 4 planos criados
**UI hint**: yes

Plans:
- [x] 02-01-PLAN.md — Foundation: Sheet install, apiPaths, domain, repository, service, controller, lista com tabs/filtros, sidebar badge
- [x] 02-02-PLAN.md — Detail Page: controller híbrido, 6 abas (Info/Saldo/Config eager + KYC/Creds/Txns lazy)
- [x] 02-03-PLAN.md — KYC Review + Status Actions: ConfirmDialog por status, pdfjs-dist preview inline
- [ ] 02-04-PLAN.md — Credenciais + Criar Merchant: CredentialsTab, SecretKeyModal one-time, TransactionsTab, CreateMerchantSheet

### Phase 3: Transactions
**Goal**: Time interno visualiza todos os pagamentos e saques da plataforma, filtrados por merchant, status, método e período, com detalhe completo por transação
**Depends on**: Phase 2
**Requirements**: TXN-01, TXN-02, TXN-03, TXN-04, TXN-05
**Success Criteria** (what must be TRUE):
  1. Admin (VIEWER+) visualiza lista paginada de pagamentos cross-merchant com filtros por merchant, status, método de pagamento e período — coluna Merchant é link navegável para o detalhe do merchant
  2. Admin (VIEWER+) abre detalhe de um pagamento e vê as informações corretas para o método: QR code PIX, código de barras Boleto ou últimos 4 dígitos do cartão — valores exibidos em R$ formatado (Intl.NumberFormat pt-BR)
  3. Admin (VIEWER+) visualiza lista paginada de saques cross-merchant com filtros por merchant e status, e abre detalhe com chave PIX do recipient e valores bruto/taxa/líquido
**Plans**: TBD
**UI hint**: yes

### Phase 4: Disputes
**Goal**: Time de suporte consegue acompanhar, priorizar e resolver disputas, com destaque visual para MEDs time-sensitive
**Depends on**: Phase 2
**Requirements**: DISP-01, DISP-02, DISP-03, DISP-04
**Success Criteria** (what must be TRUE):
  1. Admin (VIEWER+) visualiza lista paginada de disputas com filtros por status e tipo — disputas do tipo MED são destacadas visualmente como time-sensitive e destacam-se das demais
  2. Admin (VIEWER+) abre detalhe de uma disputa e vê a timeline visual completa dos estados (abertura → análise → resolução)
  3. Admin (SUPPORT+) preenche o formulário de resolução com status e texto de resolução — ambos os campos são obrigatórios antes do botão de submit ser habilitado — resolução persiste e status atualiza na lista
**Plans**: 2 plans
**UI hint**: yes

Plans:
- [x] 04-01-PLAN.md — Domain + data layer + DisputesListPage com MED row highlight (DataTable rowClass, StatusBadge ACCEPTED)
- [x] 04-02-PLAN.md — DisputeDetailPage: timeline 3-step, formulário de resolução SUPPORT+, rota [id]

### Phase 5: Fees
**Goal**: Admins conseguem visualizar, criar, editar e excluir regras de taxas globais e por merchant, e simular o resultado líquido de qualquer operação
**Depends on**: Phase 1
**Requirements**: FEES-01, FEES-02, FEES-03, FEES-04
**Success Criteria** (what must be TRUE):
  1. Admin (VIEWER+) visualiza a página de taxas com duas seções distintas: regras globais (sem merchantId) e regras por merchant
  2. Admin (ADMIN+) cria ou edita uma regra de taxa com tipo, cálculo percentual (basis points ↔ %) ou fixo (centavos ↔ R$) e limites mínimo/máximo opcionais — valores são convertidos e exibidos corretamente
  3. Admin (ADMIN+) exclui uma regra via dialog de confirmação — regra removida não aparece mais na lista
  4. Admin preenche o simulador com tipo, valor e merchant opcional e vê o resultado exibindo bruto, taxa aplicada e valor líquido com a regra que foi utilizada
**Plans**: 2 plans

Plans:
- [ ] 05-01-PLAN.md — Domain + data layer + feesController + FeesListPage (Tabs + DataTable + Simulator panel)
- [ ] 05-02-PLAN.md — FeeRuleSheet (create/edit com conversão $derived) + wire delete ConfirmDialog

### Phase 6: Admin Users
**Goal**: SUPER_ADMIN consegue gerenciar o ciclo de vida completo de usuários administrativos; a feature é completamente invisível para todos os outros roles
**Depends on**: Phase 1
**Requirements**: ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04
**Success Criteria** (what must be TRUE):
  1. Qualquer admin com role abaixo de SUPER_ADMIN não vê a entrada "Admin Users" na sidebar nem consegue acessar a rota diretamente — recebe 403, não redirect para login
  2. SUPER_ADMIN visualiza lista paginada de admins com nome, email, role e status ativo/inativo
  3. SUPER_ADMIN cria um novo admin com nome, email, senha e role via formulário — novo admin aparece na lista
  4. SUPER_ADMIN altera o role ou ativa/desativa um admin existente — botão de desativação é desabilitado para o próprio usuário logado
**Plans**: TBD
**UI hint**: yes

### Phase 7: Audit + Diagnostics
**Goal**: Admins e SUPER_ADMINs conseguem rastrear qualquer ação realizada no sistema e investigar anomalias via logs HTTP completos com trace view
**Depends on**: Phase 2
**Requirements**: AUDIT-01, AUDIT-02, AUDIT-03, DIAG-01, DIAG-02, DIAG-03, DIAG-04, DIAG-05, DIAG-06
**Success Criteria** (what must be TRUE):
  1. Admin (ADMIN+) visualiza log cronológico reverso de auditoria com filtros por ator, tipo de ação, tipo de recurso e período — IDs de recursos são links navegáveis para a entidade afetada (merchant, pagamento, etc.)
  2. Admin (ADMIN+) expande uma entrada do log de auditoria e vê diff visual before/after com campos alterados destacados — não JSON bruto
  3. Admin (ADMIN+) visualiza lista paginada de logs HTTP com filtros avançados (período, level, status code, método, path, traceId, merchantId, hasError) — linhas coloridas por faixa de status (2xx verde, 4xx amarelo, 5xx vermelho)
  4. Admin (ADMIN+) abre detalhe de um log HTTP e vê request/response formatados como JSON, headers, duração e stack trace de erro quando presente; consegue agrupar todos os logs com o mesmo traceId via trace view ou busca rápida por traceId
  5. SUPER_ADMIN executa purge de logs via ação com dialog de confirmação — logs removidos não aparecem mais na lista
**Plans**: TBD
**UI hint**: yes

### Phase 8: Providers + Platform Config
**Goal**: Qualquer admin autenticado consegue consultar o status dos provedores de pagamento e o snapshot de configuração da plataforma sem ações de escrita
**Depends on**: Phase 1
**Requirements**: PROV-01, CONFIG-01
**Success Criteria** (what must be TRUE):
  1. Admin (VIEWER+) visualiza cards read-only por provedor de pagamento exibindo nome, tipo (PAYMENT/BANKING), métodos suportados e status ativo/inativo
  2. Admin (ADMIN+) acessa a página de configuração da plataforma e vê um snapshot read-only dos valores de configuração — sem campos editáveis; admin com role abaixo de ADMIN não acessa a rota
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Auth + Core Infrastructure | 5/5 | Complete   | 2026-03-25 |
| 01.1. shadcn init + identidade visual | 3/3 | Complete    | 2026-03-25 |
| 2. Merchants | 4/4 | Complete   | 2026-04-01 |
| 3. Transactions | 3/3 | Complete   | 2026-04-14 |
| 4. Disputes | 2/2 | Complete   | 2026-04-16 |
| 5. Fees | 0/2 | Planned | - |
| 6. Admin Users | 0/0 | Not started | - |
| 7. Audit + Diagnostics | 0/0 | Not started | - |
| 8. Providers + Platform Config | 0/0 | Not started | - |

---

## Coverage

**v1 Requirements: 52 total — 52 mapped — 0 orphans**

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Complete (01-01) |
| AUTH-02 | Phase 1 | Complete (01-01) |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Complete (01-01) |
| AUTH-05 | Phase 1 | Complete (01-01) |
| AUTH-06 | Phase 1 | Complete (01-01) |
| RBAC-01 | Phase 1 | Pending |
| RBAC-02 | Phase 1 | Pending |
| RBAC-03 | Phase 1 | Pending |
| RBAC-04 | Phase 1 | Pending |
| INFRA-01 | Phase 01.1 | Pending |
| INFRA-02 | Phase 01.1 | Pending |
| INFRA-03 | Phase 01.1 | Pending |
| INFRA-04 | Phase 01.1 | Pending |
| INFRA-05 | Phase 1 | Pending |
| INFRA-06 | Phase 1 | Pending |
| INFRA-07 | Phase 1 | Pending |
| INFRA-08 | Phase 1 | Pending |
| DASH-01 | Phase 1 | Pending |
| DASH-02 | Phase 1 | Pending |
| DASH-03 | Phase 1 | Pending |
| MERCH-01 | Phase 2 | Pending |
| MERCH-02 | Phase 2 | Pending |
| MERCH-03 | Phase 2 | Pending |
| MERCH-04 | Phase 2 | Pending |
| MERCH-05 | Phase 2 | Pending |
| MERCH-06 | Phase 2 | Pending |
| MERCH-07 | Phase 2 | Pending |
| MERCH-08 | Phase 2 | Pending |
| MERCH-09 | Phase 2 | Pending |
| TXN-01 | Phase 3 | Complete (03-01) |
| TXN-02 | Phase 3 | Complete (03-01) |
| TXN-03 | Phase 3 | Pending |
| TXN-04 | Phase 3 | Pending |
| TXN-05 | Phase 3 | Pending |
| DISP-01 | Phase 4 | Planned (04-01) |
| DISP-02 | Phase 4 | Planned (04-02) |
| DISP-03 | Phase 4 | Planned (04-02) |
| DISP-04 | Phase 4 | Planned (04-01) |
| FEES-01 | Phase 5 | Planned (05-01) |
| FEES-02 | Phase 5 | Planned (05-02) |
| FEES-03 | Phase 5 | Planned (05-02) |
| FEES-04 | Phase 5 | Planned (05-01) |
| ADMIN-01 | Phase 6 | Pending |
| ADMIN-02 | Phase 6 | Pending |
| ADMIN-03 | Phase 6 | Pending |
| ADMIN-04 | Phase 6 | Pending |
| AUDIT-01 | Phase 7 | Pending |
| AUDIT-02 | Phase 7 | Pending |
| AUDIT-03 | Phase 7 | Pending |
| DIAG-01 | Phase 7 | Pending |
| DIAG-02 | Phase 7 | Pending |
| DIAG-03 | Phase 7 | Pending |
| DIAG-04 | Phase 7 | Pending |
| DIAG-05 | Phase 7 | Pending |
| DIAG-06 | Phase 7 | Pending |
| PROV-01 | Phase 8 | Pending |
| CONFIG-01 | Phase 8 | Pending |

---

*Roadmap created: 2026-03-24*
*Granularity: standard (8 phases derived from 52 v1 requirements across 10 feature domains)*
