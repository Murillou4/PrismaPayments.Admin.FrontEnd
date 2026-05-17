# Arquitetura Frontend - Guia Agnóstico de Tecnologia

> Blueprint arquitetural puro derivado da arquitetura backend, sem regras de negócio ou implementação específica.
> Utilize como template para qualquer stack frontend (React, Vue, Angular, Flutter, SwiftUI, Kotlin, etc.).

---

## Estrutura de Pastas

```
src/
├── entry_point                              # Ponto de entrada (main, index, App)
│
├── app/
│   ├── app_widget                           # Widget/componente raiz da aplicação
│   ├── router                               # Configuração de rotas/navegação
│   │
│   ├── features/
│   │   ├── {feature_a}/                     # Feature independente
│   │   │   ├── domain/
│   │   │   │   ├── entities/                # Modelos de domínio
│   │   │   │   ├── repositories/            # Contratos (interfaces) de dados
│   │   │   │   └── enums/                   # Enumerações do domínio (opcional)
│   │   │   ├── data/
│   │   │   │   └── repositories/            # Implementações (chamadas HTTP, cache local)
│   │   │   ├── presentation/
│   │   │   │   ├── pages/                   # Telas/páginas completas
│   │   │   │   ├── widgets/                 # Componentes visuais específicos da feature
│   │   │   │   └── controllers/             # State management (estados, ações, side effects)
│   │   │   ├── services/                    # Lógica de negócio / orquestração
│   │   │   ├── payloads/                    # DTOs de envio para a API
│   │   │   ├── validators/                  # Validação de formulários
│   │   │   ├── errors/                      # Tratamento de erro específico (opcional)
│   │   │   └── utils/                       # Utilitários específicos (opcional)
│   │   │
│   │   ├── {feature_b}/                     # Outra feature (mesma estrutura)
│   │   │   └── ...
│   │   │
│   │   └── {feature_group}/                 # Feature agrupadora (sub-features aninhadas)
│   │       ├── {sub_feature_a}/             # Sub-feature com estrutura completa
│   │       │   └── ...
│   │       └── {sub_feature_b}/
│   │           └── ...
│   │
│   ├── services/                            # Serviços de aplicação compartilhados
│   │   ├── api/
│   │   │   ├── api_client                   # Cliente HTTP base (interceptors, base URL, headers)
│   │   │   ├── api_response                 # Parser da resposta padronizada (RouteMessages)
│   │   │   └── api_interceptors             # Interceptors (auth inject, error handler, retry)
│   │   │
│   │   ├── storage/
│   │   │   ├── local_storage                # Abstração de armazenamento local (preferências)
│   │   │   └── secure_storage               # Armazenamento seguro (tokens, credenciais)
│   │   │
│   │   ├── websocket/                       # Comunicação em tempo real (se necessário)
│   │   │   ├── websocket_client
│   │   │   ├── websocket_events
│   │   │   └── channels_manager
│   │   │
│   │   └── {shared_service}/                # Outros serviços compartilhados
│   │       └── ...
│   │
│   └── shared/                              # Código compartilhado entre features
│       ├── widgets/                         # Componentes de UI reutilizáveis
│       ├── entities/                        # Entidades compartilhadas
│       ├── enums/                           # Enums globais
│       ├── messages/                        # RouteMessages parser + UI messages
│       ├── guards/                          # Route guards (auth, role, etc.)
│       ├── theme/                           # Tema, cores, tipografia, espaçamento
│       └── utils/                           # Utilitários globais
│
└── core/                                    # Infraestrutura e framework base
    ├── config/                              # Configuração (env vars, base URLs, feature flags)
    ├── constants/                           # Constantes globais (API paths, keys, limites)
    ├── error/                               # Classes base de erro/falha
    ├── network/                             # Abstração de rede (connectivity check, retry policy)
    ├── service_locator/                     # Dependency Injection (registro e resolução)
    │   ├── service_locator                  # Setup global
    │   └── features/                        # Locators específicos por feature
    └── extensions/                          # Extensions de tipos base
```

---

## Padrões Arquiteturais

### 1. Estrutura Padrão de uma Feature

Toda feature segue obrigatoriamente esta estrutura:

```
{feature}/
├── domain/                      # REGRAS DE NEGÓCIO PURAS (sem dependência de framework)
│   ├── entities/                # Modelos de domínio (imutáveis, tipados)
│   ├── repositories/            # Contratos (interfaces/abstrações) de dados
│   └── enums/                   # Enumerações do domínio (opcional)
│
├── data/                        # IMPLEMENTAÇÃO DE DADOS
│   └── repositories/            # Implementações concretas (HTTP calls, cache, local DB)
│
├── presentation/                # CAMADA VISUAL (equivalente a routes/ no backend)
│   ├── pages/                   # Telas/páginas completas
│   ├── widgets/                 # Componentes visuais específicos da feature
│   └── controllers/             # State management (estados reativos, ações, side effects)
│
├── services/                    # LÓGICA DE NEGÓCIO / ORQUESTRAÇÃO
│   └── {feature}_service        # Coordena repositórios, transformações, regras
│
├── payloads/                    # DTOs DE ENVIO (dados tipados para a API)
│
├── validators/                  # VALIDAÇÃO DE FORMULÁRIOS
│
├── errors/                      # TRATAMENTO DE ERRO ESPECÍFICO (opcional)
└── utils/                       # UTILITÁRIOS ESPECÍFICOS (opcional)
```

**Regra de pastas opcionais:** `enums/`, `errors/`, `utils/` — só criar quando a feature efetivamente precisar.

### 2. Correspondência Backend ↔ Frontend

| Backend | Frontend | Propósito |
|---------|----------|-----------|
| `routes/` | `presentation/pages/` | Ponto de entrada da feature |
| `routes/controllers/` | `presentation/controllers/` | Orquestração de fluxo |
| `routes/payloads/` | `payloads/` | DTOs de entrada/saída |
| `routes/validators/` | `validators/` | Validação de dados |
| `routes/errors/` | `errors/` | Códigos de erro da feature |
| `services/` | `services/` | Lógica de negócio |
| `domain/entities/` | `domain/entities/` | Modelos de domínio |
| `domain/repositories/` | `domain/repositories/` | Contratos de dados |
| `data/repositories/` | `data/repositories/` | Implementação de dados |
| `shared/middlewares/` | `shared/guards/` | Proteção de rotas |
| `shared/messages/` | `shared/messages/` | Respostas padronizadas |
| — | `presentation/widgets/` | Componentes visuais (exclusivo frontend) |
| — | `shared/theme/` | Tema visual (exclusivo frontend) |

### 3. Fluxo de Execução (Interação do Usuário → Atualização de UI)

```
Ação do Usuário (click, submit, navigate)
  │
  ▼
Route Guard                    → verifica autenticação/permissão antes de acessar a página
  │
  ▼
Page/Screen
  ├── Renderiza widgets
  ├── Conecta ao Controller (state management)
  │
  ▼
Controller
  ├── Recebe ação do usuário
  ├── Valida input             → chama Validators
  ├── Se inválido → mostra erro no formulário
  │
  ▼
Service
  ├── Monta Payload/DTO
  ├── Chama Repository
  ├── Processa resposta
  └── Retorna Either<Failure, Success>
  │
  ▼
Repository (data/)
  ├── Faz chamada HTTP via API Client
  ├── Parseia ApiResponse (RouteMessages format)
  ├── Mapeia para Entity de domínio
  └── Retorna Either<Failure, Entity>
  │
  ▼
Controller (continuação)
  ├── fold(failure → estado de erro, success → estado de sucesso)
  ├── Atualiza estado reativo
  └── UI reage automaticamente
  │
  ▼
UI Atualizada
```

---

## RouteMessages - Padrão Obrigatório de Resposta (Frontend Parser)

**Toda resposta da API segue o formato RouteMessages. O frontend DEVE parsear este formato.**

### Estrutura da Resposta da API

```json
{
  "responseType": "OK | BAD_REQUEST | UNAUTHORIZED | FORBIDDEN | INTERNAL_SERVER_ERROR",
  "message": "Mensagem descritiva para o usuário",
  "title": "Título curto da resposta",
  "status": 200,
  "data": { },
  "extendedResultCode": "#CODIGO_ESPECIFICO",
  "date": "2026-03-17T12:00:00.000Z"
}
```

### Modelo ApiResponse (Frontend)

O frontend deve ter uma classe/tipo `ApiResponse` que parseia toda resposta da API:

```
ApiResponse<T>
├── responseType: string       # Tipo da resposta (enum)
├── message: string            # Mensagem amigável para exibir ao usuário
├── title: string              # Título curto para toasts/snackbars
├── status: integer            # Código HTTP
├── data: T?                   # Payload tipado (genérico, parseado para a Entity correta)
├── extendedResultCode: string # Código de rastreio (para logs, debug, suporte)
├── date: DateTime             # Timestamp da resposta
│
├── isSuccess → status == 200
├── isBadRequest → status == 400
├── isUnauthorized → status == 401
├── isForbidden → status == 403
├── isServerError → status == 500
```

### Regras de Tratamento no Frontend

1. **`OK`** → operação bem-sucedida, extrair `data` e mapear para Entity
2. **`BAD_REQUEST`** → mostrar `message` no formulário ou toast de erro
3. **`UNAUTHORIZED`** → redirecionar para login, limpar tokens
4. **`FORBIDDEN`** → mostrar `message`, não redirecionar (usuário autenticado mas sem permissão)
5. **`INTERNAL_SERVER_ERROR`** → mostrar mensagem genérica, logar `extendedResultCode`
6. **`extendedResultCode`** → usar para lógica condicional de erros específicos
7. **`message`** → sempre seguro para exibir ao usuário final
8. **`title`** → usar como título de toast/snackbar/dialog

---

## Padrões de Camada

### Domain Layer (Regras Puras)

- **Entities**: modelos imutáveis com `fromMap()`/`toMap()` para serialização. Campos tipados
- **Repositories (contratos)**: interfaces abstratas definindo operações de dados. Retornam `Either<Failure, T>` ou equivalente
- **Enums**: enumerações do domínio

### Data Layer (Comunicação com API)

- Implementações concretas dos contratos do domain
- Usam `ApiClient` para chamadas HTTP
- Parseiam `ApiResponse` (formato RouteMessages)
- Mapeiam `data` da resposta para Entities de domínio
- Retornam `Either<Failure, T>`
- Podem incluir cache local (in-memory ou persistido)

### Presentation Layer (UI)

- **Pages**: telas completas que compõem widgets e se conectam ao controller
- **Widgets**: componentes visuais reutilizáveis dentro da feature
- **Controllers**: gerenciamento de estado — estados reativos, ações do usuário, side effects. Chamam Services e atualizam o estado da UI

### Service Layer (Orquestração)

- Coordena chamadas a repositórios
- Aplica regras de negócio no frontend (validações antes de enviar, transformações)
- Monta Payloads/DTOs
- Gerencia fluxos multi-step

### Shared Layer

- **Widgets**: componentes de UI reutilizáveis entre features
- **Guards**: proteção de rotas — equivalente aos middlewares do backend
- **Messages**: parser de RouteMessages + componentes de feedback (toast, snackbar, dialog)
- **Theme**: sistema de design (cores, tipografia, espaçamento, breakpoints)
- **Utils**: formatters, helpers, constantes

### Core (Infraestrutura)

- **Config**: base URLs, env vars, feature flags
- **Constants**: paths de API, keys de storage, limites
- **Error**: classe base `Failure` com subclasses tipadas
- **Network**: verificação de conectividade, política de retry
- **Service Locator**: DI — registro de dependências como lazy singletons, separado por feature
- **Extensions**: extensões de tipos base

---

## API Client

```
API Client
├── Base URL (do config/env)
├── Headers padrão (Content-Type: application/json)
├── Interceptors:
│   ├── Auth Interceptor       → injeta token de autenticação no header
│   ├── Error Interceptor      → parseia RouteMessages em erros tipados
│   └── Retry Interceptor      → retry automático em falhas de rede
├── Timeout configurável
└── Todas as respostas parseadas como ApiResponse<T>
```

---

## Dependency Injection

**Padrão:** Service Locator com lazy singletons.

**O que registrar:**
- Configuração da aplicação
- API Client (cliente HTTP)
- Storage (local e seguro)
- Repositories de cada feature
- Services de cada feature
- Controllers (quando singleton)
- Serviços compartilhados (WebSocket, etc.)

**Organização:** um locator global + locators específicos por feature/grupo.
