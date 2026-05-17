# Prisma Payments — Project Rules

## Purpose

Este arquivo é o ruleset não-negociável do projeto Prisma Payments (backend + frontend). Se uma mudança conflita com este documento, a mudança está errada até que a regra seja explicitamente atualizada.

---

# BACKEND RULES

## Repository Organization

1. Todo código backend, testes, documentação e artefatos operacionais devem estar dentro de `backend/`.
2. O source of truth do backend é `backend/src/`.
3. Testes automatizados ficam em `backend/tests/`.
4. Documentos de tasks e runbooks ficam em `backend/tasks/`.

## File Rules

1. Um tipo por arquivo, sempre.
2. Esta regra se aplica a class, record, interface, enum, static class e qualquer outro tipo nomeado.
3. Não colocar múltiplas classes no mesmo arquivo.
4. Não colocar uma classe e um enum no mesmo arquivo.
5. O nome do arquivo deve corresponder ao nome do tipo principal.

## Architecture Rules

1. O backend é feature-first, não layer-first.
2. Cada feature deve manter domain, data, routes e services separados.
3. Pastas de grupo como `merchants/` ou `payments/` são apenas agregadoras; a estrutura real da feature fica dentro de cada sub-feature.
4. Concerns cross-feature compartilhados vão apenas em `api/shared/`, `api/services/`, ou `core/`.
5. Controllers e routes não devem absorver lógica de negócio que pertence a services.
6. Services não devem absorver concerns de persistência que pertencem a repositories.
7. Entidades de domínio e contratos de repository devem se manter livres de coupling com frameworks externos sempre que possível.

## HTTP Contract Rules

1. Toda resposta HTTP deve usar o envelope `RouteMessages`.
2. Nenhum endpoint pode retornar JSON ad-hoc fora do contrato de resposta padrão.
3. Todas as rotas devem ficar sob `/api/v1` até que um version bump deliberado seja introduzido.
4. Validação de input deve acontecer antes da execução da lógica de negócio.

## Error Handling Rules

1. Lógica de negócio deve retornar `Either<Failure, T>`.
2. Lógica de negócio não deve usar exceptions para controle de fluxo esperado.
3. Exceptions não tratadas são falhas de infraestrutura e devem ser capturadas pelo global error middleware.

## Data Access Rules

1. Repositories devem depender de `IDatabaseService`, não diretamente de um driver de banco de dados.
2. Feature repositories não devem importar `MongoDB.Driver` diretamente.
3. Código específico de banco de dados pertence apenas a implementações de infraestrutura.
4. Queries devem usar filtros tipados e abstrações seguras, nunca construção dinâmica de query string.

## Multi-Tenancy Rules

1. Dados de merchant são isolados por `merchantId`.
2. Todo repository que lê dados de propriedade do merchant deve receber ou derivar o contexto do merchant explicitamente.
3. Nenhuma query de merchant pode retornar dados cross-merchant a menos que a requisição esteja em contexto admin.
4. Cache keys para dados de propriedade do merchant devem incluir `merchantId`.

## Money Rules

1. Todo dinheiro é armazenado como `long` em centavos.
2. Nunca usar `decimal`, `double` ou `float` como representação persistida de dinheiro.
3. Taxas percentuais são armazenadas em basis points.
4. Conversão entre valor de exibição e centavos deve passar por helpers compartilhados.

## Financial Integrity Rules

1. Registros financeiros são imutáveis por padrão.
2. `payments`, `withdrawals` e registros estilo-ledger nunca devem ser hard deleted.
3. Correções financeiras devem acontecer através de novos registros ou transições de status controladas, nunca reescrevendo o histórico.
4. Operações de saldo devem ser atômicas.
5. Nunca implementar mutação de saldo como "read, validate, then write" em passos separados não-atômicos.

## Idempotency Rules

1. Endpoints de mutação financeira devem exigir `X-Idempotency-Key`.
2. A mesma idempotency key para o mesmo merchant deve reproduzir a mesma resposta e não criar efeitos colaterais duplicados.
3. Comportamento de idempotência deve ser tratado como garantia de corretude, não como nice-to-have.

## Provider Integration Rules

1. Provedores de pagamento e bancários são plugins atrás de interfaces estáveis.
2. Lógica de negócio não deve se acoplar diretamente a uma única implementação de provedor.
3. Chamadas a provedores externos devem ser protegidas com comportamento de timeout, retry e circuit-breaker.
4. Chamadas a provedores externos devem ser logadas em `provider_request_logs`.
5. Logging de payload de provedor nunca deve expor secrets ou PII bruto.

## Security Rules

1. CORS deve ser explícito por ambiente, nunca globalmente permissivo em ambientes similares à produção.
2. Secrets nunca devem ser logados, retornados em respostas ou hardcoded como valores reais.
3. PII deve ser mascarado em logs e audit trails.
4. Fluxos de API key devem suportar enforcement de IP allowlist.
5. Endpoints de mutação financeira devem ser protegidos por rate limiting e idempotência.
6. `X-Forwarded-For` deve ser confiável apenas quando o ambiente estiver configurado para confiar nele.

## Eventing Rules

1. Efeitos colaterais cross-feature devem acontecer através de domain events.
2. Audit, webhook dispatch, notificações em tempo real e efeitos colaterais de saldo devem permanecer desacoplados através de handlers.
3. Adicionar um novo efeito colateral deve preferir um novo handler ao invés de acoplamento direto service-to-service.

## Documentation Rules

1. Toda classe, método e função deve ter um comentário descritivo quando faz parte do codebase backend.
2. Comportamento operacional que afeta produção deve ser documentado em `backend/tasks/`.
3. Runbooks, matrizes de env, matrizes de regressão e go-live checklists fazem parte do projeto, não são extras opcionais.

## Testing Rules

1. O backend deve manter cobertura de unit, API, integration e smoke separadas por categoria.
2. Novos fluxos críticos devem vir com testes automatizados.
3. Corretude financeira, auth, rate limit, idempotência e fluxos de provedor devem sempre ser testáveis sem adivinhação.
4. Build e testes devem passar antes de considerar o trabalho completo.

## Quality Bar

1. Zero build errors.
2. Zero build warnings é o target bar.
3. Nenhuma regra neste arquivo pode ser bypassada por conveniência.

---

# FRONTEND RULES

## Stack e Referência

1. Stack de referência: **SvelteKit + TypeScript + Tailwind CSS**.
2. Toda implementação deve seguir a arquitetura descrita em `murillo's-architecture-frontend.md`.
3. Existem dois frontends distintos: **Prisma Admin** (painel interno) e **Prisma App** (portal merchant + checkout público).
4. O checkout público (`/pay/{code}`) faz parte do Prisma App.

## Frontend Architecture Rules

1. O frontend é feature-first, espelhando a arquitetura do backend.
2. Toda feature segue obrigatoriamente a estrutura: `domain/`, `data/`, `presentation/`, `services/`, `payloads/`, `validators/`.
3. Pastas opcionais (`enums/`, `errors/`, `utils/`) só devem ser criadas quando a feature efetivamente precisar.
4. Feature groups (ex: `merchants/`, `transactions/`) são apenas agregadoras; a estrutura real fica dentro de cada sub-feature.
5. Concerns compartilhados entre features vão em `app/shared/`.
6. Infraestrutura e framework base ficam em `core/`.

## Frontend File Rules

1. Um componente/tipo por arquivo, sempre.
2. Nome do arquivo deve corresponder ao nome do componente ou tipo principal.
3. Pages ficam em `presentation/pages/`.
4. Widgets (componentes visuais da feature) ficam em `presentation/widgets/`.
5. State management fica em `presentation/controllers/`.

## Layer Rules

### Domain Layer
1. Entities devem ser imutáveis e tipadas.
2. Repositories no domain são contratos (interfaces/abstrações), nunca implementações.
3. Retornar `Either<Failure, T>` ou equivalente nos contratos de repositório.
4. O domain layer não deve ter dependência de frameworks externos.

### Data Layer
1. Implementações concretas dos contratos do domain ficam em `data/repositories/`.
2. Usar `ApiClient` para todas as chamadas HTTP.
3. Parsear `ApiResponse` (formato RouteMessages) em toda resposta da API.
4. Mapear `data` da resposta para Entities de domínio.
5. Retornar `Either<Failure, T>` ou equivalente.

### Presentation Layer
1. Pages compõem widgets e se conectam ao controller.
2. Widgets são componentes visuais reutilizáveis dentro da feature — sem lógica de negócio.
3. Controllers gerenciam estado reativo, ações do usuário e side effects. Chamam Services.
4. Controllers não devem fazer chamadas HTTP diretamente — sempre via Services.

### Service Layer
1. Serviços coordenam chamadas a repositories.
2. Serviços aplicam regras de negócio no frontend (transformações, validações antes de enviar).
3. Serviços montam Payloads/DTOs.
4. Serviços gerenciam fluxos multi-step.

### Shared Layer
1. Widgets compartilhados entre features ficam em `app/shared/widgets/`.
2. Route guards ficam em `app/shared/guards/`.
3. Parser de RouteMessages e componentes de feedback (toast, snackbar, dialog) ficam em `app/shared/messages/`.
4. Sistema de design (cores, tipografia, espaçamento) fica em `app/shared/theme/`.

### Core Layer
1. Configuração (env vars, base URLs, feature flags) fica em `core/config/`.
2. Constantes globais (API paths, keys de storage, limites) ficam em `core/constants/`.
3. Classe base `Failure` com subclasses tipadas fica em `core/error/`.
4. Dependency Injection via Service Locator fica em `core/service_locator/`.

## API Contract Rules (Frontend)

1. Toda resposta da API segue o formato RouteMessages — o frontend DEVE parsear este formato.
2. Nunca fazer parsing manual de JSON fora do `ApiResponse<T>`.
3. O campo `message` é sempre seguro para exibir ao usuário final.
4. O campo `title` é usado como título de toast/snackbar/dialog.
5. O campo `extendedResultCode` é usado para lógica condicional de erros específicos e para debug.

### Regras de tratamento por status:
- **200, 201** → Sucesso → extrair `data`, mapear para entity.
- **204** → Sucesso sem body.
- **400** → Mostrar `message` como erro de validação no formulário ou toast.
- **401** → Limpar tokens e redirecionar para login.
- **403** → Mostrar `message` (autenticado mas sem permissão), não redirecionar.
- **404** → Mostrar `message` ou tela de não encontrado.
- **500** → Mostrar mensagem genérica, logar `extendedResultCode`.

## API Client Rules

1. Base URL configurável via variável de ambiente.
2. Headers padrão: `Content-Type: application/json` e `Authorization: Bearer {accessToken}`.
3. Interceptors obrigatórios: Auth (injeta token), Error (parseia RouteMessages), Retry (máx. 2 tentativas em falha de rede).
4. No Prisma App: Idempotency Interceptor gera `X-Idempotency-Key` em POSTs para `/payments` e `/withdrawals`.
5. Todas as respostas devem ser parseadas como `ApiResponse<T>`.

## Frontend Routing Rules

1. Todas as rotas da API ficam em `core/constants/apiPaths.ts` como constantes nomeadas.
2. Base URL da API: `{API_BASE_URL}/api/v1`.
3. Autenticação: JWT Bearer Token via header `Authorization: Bearer {accessToken}`.
4. Admin usa endpoint separado de login: `POST /api/v1/auth/admin/login`.
5. Merchant usa: `POST /api/v1/auth/merchants/login`.

## Frontend Security Rules

1. Tokens de autenticação devem ser armazenados em `secure_storage`, nunca em `localStorage` exposto.
2. Route guards devem proteger todas as rotas autenticadas.
3. Ao receber 401, limpar todos os tokens e redirecionar para login imediatamente.
4. O role do admin é extraído do JWT. Decodificar apenas para leitura de claims — a verificação de assinatura é responsabilidade do backend.
5. Nunca expor endpoints administrativos na UI de merchant ou no checkout público.

## Frontend Roles (Admin)

1. `SUPER_ADMIN` (nível 4) — acesso total, incluindo gestão de admins e configurações de plataforma.
2. `ADMIN` (nível 3) — acesso a quase tudo, exceto gestão de admins.
3. `SUPPORT` (nível 2) — pode alterar status de merchants, resolver disputas.
4. `VIEWER` (nível 1) — apenas visualização, sem ações de escrita.
5. Ações de UI devem ser exibidas/ocultadas com base no role do usuário autenticado.

## WebSocket Rules

1. Comunicação em tempo real usa SignalR (`/hubs/realtime`) no Prisma App.
2. A lógica de WebSocket fica em `app/services/websocket/`.
3. Eventos de WebSocket não devem ser acoplados diretamente a componentes de UI — usar um channels manager como intermediário.

## Dependency Injection Rules

1. Usar Service Locator com lazy singletons.
2. Registrar: configuração, API Client, storage, repositories, services e controllers singleton.
3. Um locator global + locators específicos por feature/grupo.

## Frontend Quality Bar

1. TypeScript strict mode — zero erros de tipagem.
2. Zero warnings de lint.
3. Build deve passar antes de considerar o trabalho completo.
4. Verificar no browser após cada implementação de feature.

---

# DESIGN SYSTEM RULES

> Baseado em `StyleGuide.md`. Toda interface deve seguir estes tokens obrigatoriamente.

## Visual Identity

1. Dark mode first. Tema claro é suportado mas dark é o padrão.
2. Estética: retro-futurista técnica. Synthwave controlado, sofisticado, sem ornamentos excessivos.
3. Referências visuais: Linear, Vercel, Resend.
4. Nunca usar branco puro — usar `#F6F6FF` no light mode.
5. Máximo 3 cores de destaque por tela.
6. Labels e captions sempre em uppercase com letter-spacing.

## Color Palette

### Cores de Marca
- **Primary** — `linear-gradient(135deg, #0A0A0F 0%, #18111A 100%)` com border `1px solid #FF00FF`. Foreground: `#F6F6FF`
- **Secondary** — `#722283`. Hover: `#8B2A9E`. Foreground: `#F6F6FF`
- **Accent** — `#01FAFB` (ciano). Hover: `#33FBFC`. Foreground: `#070707`

### Estados
- **Destructive/Danger** — Background: `rgba(255, 59, 92, 0.10)`
- **Success** — `#00E676`. Background: `rgba(0, 230, 118, 0.10)`
- **Warning** — `#FFB300`. Background: `rgba(255, 179, 0, 0.10)`
- **Info** — `#01FAFB`. Background: `rgba(1, 250, 251, 0.10)`

### Neutrals — Dark Mode
- **Background** — `#070707` (página) / `#0A0A0F` (fundo sutil alternativo)
- **Surface** — `#0F0F18` (cards e modais) / `#141420` (surface elevada, hover de menu) / `#1A1A28` (overlays e dropdowns)
- **Border** — `rgba(255, 255, 255, 0.08)` padrão / `rgba(255, 255, 255, 0.14)` em hover e destaque
- **Text** — `#F6F6FF` (principal) / `#9090A8` (secundário) / `#3A3A50` (desabilitado) / `#070707` (inverso)

### Neutrals — Light Mode
- **Background** — `#F6F6FF` (página) / `#EEEEF8` (fundo sutil)
- **Surface** — `#FFFFFF` (cards e modais) / `#F0F0FA` (surface elevada) / `#E8E8F4` (overlays)
- **Border** — `rgba(0, 0, 0, 0.08)` padrão / `rgba(0, 0, 0, 0.14)` em hover e destaque
- **Text** — `#0A0A0F` (principal) / `#505068` (secundário) / `#AEAEC0` (desabilitado)

## Typography

### Font Families
- **Display** — Space Grotesk. Títulos, headings, CTAs, wordmark e texto de impacto.
- **Body** — Outfit. Textos corridos, UI, labels, dados e texto de suporte.
- **Mono** — Outfit (monospace). Código, valores técnicos e inputs de dados.

### Type Scale
| Token | Tamanho | Peso | Line-height |
|-------|---------|------|-------------|
| caption/xs | 12px | 500 | 1.50 |
| body-sm | 14px | 400 | 1.55 |
| body | 16px | 400 | 1.60 |
| body-lg | 18px | 400 | 1.65 |
| h5 | 20px | 600 | 1.40 |
| h4 | 24px | 600 | 1.30 |
| h3 | 30px | 700 | 1.20 |
| h2 | 48px | 700 | 1.10 |
| h1 | 72px | 800 | 1.05 |

### Pesos disponíveis
300 Light / 400 Regular / 500 Medium / 600 Semibold / 700 Bold / 800 Extrabold

## Spacing Scale

Base 4px: `4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80 / 96px`

- Padding mínimo de cards: 24px
- Gap entre cards: 32px
- Entre seções de página: 80px
- Largura máxima de conteúdo: 1080px

## Border Radius

| Token | Valor | Uso |
|-------|-------|-----|
| sm | 6px | Badges, tags, chips, tooltips |
| md | 12px | Inputs, botões, selects, dropdowns |
| lg | 16px | Cards padrão, menus contextuais |
| xl | 20px | Cards hero, painéis de conteúdo |
| 2xl | 24px | Modais, bottom sheets, drawers |
| full | 9999px | Pills, avatares, progress bars |

1. Nunca usar 0px em componentes de UI.
2. Mínimo 12px em todos os componentes de UI. Cantos retos são proibidos.
3. Apenas elementos decorativos geométricos (ex: símbolo do prisma) podem ser angulares.

## Shadows / Elevation

- **sm** — `0 1px 3px rgba(0,0,0,0.40), 0 1px 2px rgba(0,0,0,0.30)` — inputs e elementos inline
- **md** — `0 4px 16px rgba(0,0,0,0.50), 0 2px 6px rgba(0,0,0,0.40)` — cards padrão
- **lg** — `0 16px 48px rgba(0,0,0,0.60), 0 6px 18px rgba(0,0,0,0.50)` — modais, overlays e dropdowns
- **glow-magenta** — `0 0 24px rgba(255, 0, 255, 0.25)` — CTAs e botão primary em foco
- **glow-cyan** — `0 0 24px rgba(1, 250, 251, 0.20)` — accent, info e notificações

1. Gradientes de marca apenas em elementos-chave (botão primary, hero section).
2. Glow somente em CTAs e destaques reais, nunca decorativo.

## Interactive States

- **Hover** — `translateY(-1px)` + overlay `rgba(255, 255, 255, 0.05)`. Botões sobem 1px.
- **Active/Pressed** — `translateY(0)` + overlay `rgba(255, 255, 255, 0.10)`. Sem sombra extra.
- **Focus** — `box-shadow: 0 0 0 2px #FF00FF`. Nunca remover o outline de foco por razões estéticas.
- **Disabled** — `opacity: 0.38 + cursor: not-allowed`. Nunca esconder o elemento, apenas reduzir visibilidade.

## Icons

1. Biblioteca: **Lucide Icons**.
2. Tamanhos padrão: sm (16px), md (20px), lg (24px).
3. Stroke width: 1.5 (padrão da biblioteca). Não alterar.
4. Cor padrão: `currentColor`. Estado normal usa text-secondary; hover usa text-primary ou brand-magenta conforme contexto.
5. Gap com texto: sempre 8px, alinhamento vertical centralizado.
