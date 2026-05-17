# Credenciais

[prisma.studio76@gmail.com](mailto:prisma.studio76@gmail.com)

# Designer — Style Guide

A ideia é sempre usar um gradiente nas bordas e o preto, basicamente não tentar usar uma cor sólida. Se pa é isso, qualquer dúvida manda print no grupo eu adiciono aqui.
* * *
## Paleta de Cores

*   **Primary** — gradiente linear-gradient(135deg, `#0A0A0F` 0%, `#18111A` 100%) com border 1px solid `#FF00FF`. Foreground: `#F6F6FF`
*   **Secondary** — `#722283`Hover: `#8B2A9E`. Foreground: `#F6F6FF`
*   **Accent** — `#01FAFB` (ciano). Hover: `#33FBFC`. Foreground: `#070707`
*   **Destructive / Danger** — Background de alerta: rgba(255, 59, 92, 0.10)
*   **Success** — `#00E676`. Background: rgba(0, 230, 118, 0.10)
*   **Warning** — `#FFB300`. Background: rgba(255, 179, 0, 0.10)
*   **Info** — `#01FAFB`. Background: rgba(1, 250, 251, 0.10)
*   **Neutrals**
    *   **Dark Mode**
        *   **Background** — `#070707` (fundo da página) / `#0A0A0F` (fundo sutil alternativo)
        *   **Surface** — `#0F0F18` (cards e modais) / `#141420` (surface elevada, hover de menu) / `#1A1A28` (overlays e dropdowns)
        *   **Border** — rgba(255, 255, 255, 0.08) padrão / rgba(255, 255, 255, 0.14) em hover e destaque
        *   **Text** — `#F6F6FF` (principal) / `#9090A8` (secundário) / `#3A3A50` (desabilitado) / `#070707` (inverso, sobre fundo claro)
    *   **Light Mode**
        *   Background — `#F6F6FF` (fundo da página) / `#EEEEF8` (fundo sutil)
        *   Surface — `#FFFFFF` (cards e modais) / `#F0F0FA` (surface elevada) / `#E8E8F4` (overlays)
        *   Border — rgba(0, 0, 0, 0.08) padrão / rgba(0, 0, 0, 0.14) em hover e destaque
        *   Text — `#0A0A0F` (principal) / `#505068` (secundário) / `#AEAEC0` (desabilitado)
* * *
## Tipografia

*   **Font family display** — Space Grotesk. Usada em títulos, headings, CTAs, wordmark e qualquer texto de impacto
*   **Font family body** — Outfit. Usada em textos corridos, UI, labels, dados e texto de suporte
*   **Font family mono** — Outfit (definido como monospace). Usada em código, valores técnicos e inputs de dados
*   Escala de tamanhos — do menor ao maior:
    *   caption / xs — 12px / 0.75rem — weight 500 — line-height 1.50
    *   body-sm — 14px / 0.875rem — weight 400 — line-height 1.55
    *   body — 16px / 1rem — weight 400 — line-height 1.60
    *   body-lg — 18px / 1.125rem — weight 400 — line-height 1.65
    *   h5 — 20px / 1.25rem — weight 600 — line-height 1.40
    *   h4 — 24px / 1.5rem — weight 600 — line-height 1.30
    *   h3 — 30px / 1.875rem — weight 700 — line-height 1.20
    *   h2 — 48px / 3rem — weight 700 — line-height 1.10
    *   h1 — 72px / 4.5rem — weight 800 — line-height 1.05
    
*   **Pesos** — 300 Light (subtítulos leves) / 400 Regular (body padrão) / 500 Medium (labels e badges) / 600 Semibold (h4, h5, botões) / 700 Bold (h2, h3) / 800 Extrabold (h1, hero)
*   **Line-height** — definido por tamanho conforme escala acima. Regra geral: quanto maior o texto, menor o line-height. Display começa em 1.05, body vai até 1.65
* * *
## Espaçamentos

*   **Spacing scale** — base 4px: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80 / 96px
*   **Uso recomendado:**
    *   4px — padding interno mínimo, gap inline entre elementos
    *   8px — gap entre ícone e label, padding de badge
    *   12px — padding vertical de badge, gap compacto de lista
    *   16px — padding de input, gap de lista padrão, padding de botão sm
    *   20px — gap interno de card pequeno
    *   24px — padding de card padrão, padding de botão md
    *   32px — gap entre cards, padding de botão lg
    *   40px — margin entre blocos de componentes
    *   48px — padding de seção pequena
    *   64px — padding de seção padrão
    *   80px — espaço entre seções de página
    *   96px — hero padding, seções XL
    
* * *
## Border Radius
*   **Spacing scale**
    *   sm — 6px
    *   md — 12px
    *   lg — 16px
    *   xl — 20px
    *   2xl — 24px
    *   full — 9999px
    
*   **Uso recomendado:**
    *   sm (6px) — badges, tags, chips, tooltips
    *   md (12px) — inputs, botões, selects, dropdowns
    *   lg (16px) — cards padrão, menus contextuais
    *   xl (20px) — cards hero, painéis de conteúdo
    *   2xl (24px) — modais, bottom sheets, drawers
    *   full (9999px) — pills, avatares, progress bars
    

**Nunca usar 0px em componentes de UI**

* * *
## Sombras / Elevation

*   **Níveis**:
    *   sm (sutil) — inputs e elementos inline
    *   md (card elevado) — cards padrão
    *   lg (modal/dropdown) — modais, overlays e dropdowns
    *   glow-magenta — CTAs e botão primary em foco
    *   glow-cyan — accent, info e notificações
    
*   **Valores**
    *   sm — 0 1px 3px rgba(0,0,0,0.40), 0 1px 2px rgba(0,0,0,0.30)
    *   md — 0 4px 16px rgba(0,0,0,0.50), 0 2px 6px rgba(0,0,0,0.40)
    *   lg — 0 16px 48px rgba(0,0,0,0.60), 0 6px 18px rgba(0,0,0,0.50)
    *   glow-magenta — 0 0 24px rgba(255, 0, 255, 0.25)
    *   glow-cyan — 0 0 24px rgba(1, 250, 251, 0.20)
    
* * *
## Estados Interativos

*   **Hover** — translateY(-1px) + overlay rgba(255, 255, 255, 0.05) sobre o fundo. Botões sobem 1px e a superfície clareia levemente
*   **Active/Pressed** — translateY(0) retorna à posição base + overlay rgba(255, 255, 255, 0.10). Nenhuma sombra extra
*   **Focus** — box-shadow: 0 0 0 2px `#FF00FF`. Nunca remover o outline de foco por razões estéticas
*   **Disabled** — opacity: 0.38 + cursor: not-allowed. Nunca esconder o elemento, apenas reduzir a visibilidade
* * *
## Ícones

*   **Biblioteca** — Lucide Icons. npm install lucide-react (React) ou lucide (vanilla JS)
*   **Tamanhos padrão** — sm (16px), md (20px), lg (24px)
*   **Stroke width** — 1.5 (padrão da biblioteca). Não alterar para manter consistência visual
*   **Cor Padrão** — currentColor. Herda a cor do contexto. Em estado normal usa text-secondary, em hover usa text-primary ou brand-magenta dependendo do contexto
*   **Gap com texto** — sempre 8px (space-2), alinhamento vertical centralizado
* * *
## Direção Estética Geral

*   **Vibe / referências visuais** — dark mode first, retro-futurista técnica. Synthwave controlado, não caótico. Sofisticado e confiável, sem ornamentos.

**Referências diretas: Linear (**[**linear.app**](http://linear.app)**), Vercel (**[**vercel.com**](http://vercel.com)**), Resend (**[**resend.com**](http://resend.com)**)**

Eu faria um site bem parecido com esse **Resend,** bem cleanzinho mas com alguns bglh daora.
E claro com nossa estética serviços e portfólio, mas a base seria essa estrutura.

*   **Cantos** — arredondados. Mínimo 12px em todos os componentes de UI. Cantos retos (0px) são proibidos em componentes. Apenas elementos decorativos geométricos como o símbolo do prisma podem ser angulares
*   **Densidade** — Média. Nem compacta nem espaçada demais. Padding mínimo de 24px em cards, 80px entre seções de página, largura máxima de conteúdo de 1080px
*   **Regras Adicionais**
    *   Nunca usar branco puro — `#F6F6FF` no light mode
    *   Gradientes de marca apenas em elementos-chave (botão primary, hero section)
    *   Glow somente em CTAs e destaques reais, nunca decorativo
    *   Máximo 3 cores de destaque por tela
    *   Labels e captions sempre em uppercase com letter-spacing
    
## **Showcase**

[PrismaStudio\_StyleGuides.html](https://t9011716029.p.clickup-attachments.com/t9011716029/be47cea3-17a3-4bc6-84db-831ff054d383/PrismaStudio_StyleGuides.html)

# Prisma Studio



# Sistema Interno

Painel pra visualizar os briefing realizados, categorizar e organizar. E visualizar também os pedidos de contração/analise.

Não vai ter login, só um código que cada um dos 3 sócios vão ter pra acessar a plataforma, junto do código vai ter também 2FA OTP.

# Frontend

**\# PRD: Sistema de Gerenciamento Interno — Frontend**

**\*\*Prisma Studio\*\***
**\*\*Data:\*\*** 2026-03-07
**\*\*Stack:\*\*** Svelte 5 + Vite + TypeScript
**\*\*Backend:\*\*** [https://prisma-internal-backend.onrender.com](https://prisma-internal-backend.onrender.com)
\---

**\## 1. Introdução / Visão Geral**

O Sistema de Gerenciamento Interno é um painel web privado utilizado exclusivamente pelos 3 sócios do Prisma Studio (Murillo, Matheus e Pedro) para visualizar, categorizar e gerenciar os briefings recebidos via Product Builder e os pedidos de contratação/análise.

O acesso é protegido por dois fatores: um código de acesso único por sócio + OTP via aplicativo autenticador (TOTP). Não existe cadastro, recuperação de senha nem fluxo público — o sistema é totalmente fechado e interno.

O objetivo do painel é centralizar a operação de leads em um único lugar, dando visibilidade ao pipeline de projetos antes do diagnóstico.

\---

**\## 2. Objetivos**

\- Autenticar sócios de forma segura via código único + TOTP (sem senha tradicional)
\- Exibir todos os briefings recebidos em uma listagem clara e filtrável
\- Permitir visualização detalhada de cada briefing com classificação automática e anotações internas
\- Exibir pedidos de contratação/análise separados dos briefings em aberto
\- Identificar qual sócio está logado (apenas para registro interno — todos veem o mesmo conteúdo)
\- Funcionar de forma confiável como SPA leve, sem SSR necessário

\---

**\## 3. User Stories**

**\### US-001: Tela de autenticação — formulário de acesso (código + OTP)**
**\*\*Descrição:\*\*** Como sócio, quero inserir meu código de acesso e o OTP do autenticador em um único formulário para acessar o painel interno.

**\*\*Acceptance Criteria:\*\***
\- \[ \] Exibe dois campos no mesmo formulário: "Código de acesso" (tipo \`password\`) e "Código OTP" (tipo \`text\`, numérico, 6 dígitos)
\- \[ \] Layout visual similar a um formulário de usuário + senha convencional
\- \[ \] Campo OTP aceita apenas dígitos numéricos e limita a 6 caracteres
\- \[ \] Botão "Entrar" submete ambos os campos simultaneamente ao backend em uma única requisição
\- \[ \] Durante o envio, botão exibe estado de loading e campos ficam desabilitados
\- \[ \] Se as credenciais forem inválidas (código errado, OTP expirado ou incorreto), exibe mensagem de erro genérica sem revelar qual campo falhou (ex: "Código ou OTP inválido")
\- \[ \] Se a autenticação for bem-sucedida, armazena o token de sessão em \`localStorage\` e redireciona para \`/briefings\`
\- \[ \] Não revela quantos sócios existem nem a quem pertence cada código
\- \[ \] Typecheck/lint passa
\- \[ \] Verificar no browser

\---

**\### US-003: Proteção de rotas autenticadas**
**\*\*Descrição:\*\*** Como sistema, quero garantir que somente sócios autenticados acessem o painel interno.

**\*\*Acceptance Criteria:\*\***
\- \[ \] Qualquer rota interna redireciona para \`/login\` se não houver sessão válida
\- \[ \] O token de sessão é verificado antes de renderizar qualquer página protegida
\- \[ \] Ao expirar a sessão, o usuário é redirecionado para \`/login\` com mensagem "Sessão expirada"
\- \[ \] Typecheck/lint passa

\---

**\### US-004: Logout**
**\*\*Descrição:\*\*** Como sócio, quero encerrar minha sessão com segurança.

**\*\*Acceptance Criteria:\*\***
\- \[ \] Botão de logout acessível em todas as páginas internas (ex: header ou sidebar)
\- \[ \] Ao clicar em logout, o token de sessão é removido do armazenamento local
\- \[ \] Redireciona para \`/login\` após logout
\- \[ \] Typecheck/lint passa
\- \[ \] Verificar no browser

\---

**\### US-005: Listagem de briefings**
**\*\*Descrição:\*\*** Como sócio, quero ver todos os briefings recebidos em uma lista organizada para ter visão geral do pipeline.

**\*\*Acceptance Criteria:\*\***
\- \[ \] Página \`/briefings\` exibe lista de briefings em formato de cards ou tabela
\- \[ \] Cada item exibe: nome/tipo do negócio, data de envio, categoria de serviço, nível de complexidade (Baixa/Média/Alta) e temperatura do lead (Quente/Morno/Frio)
\- \[ \] Lista é ordenada por data de envio (mais recente primeiro) por padrão
\- \[ \] Exibe estado vazio quando não há briefings
\- \[ \] Dados são carregados do backend via fetch com loading state visível
\- \[ \] Erros de carregamento exibem mensagem de erro com opção de retry
\- \[ \] Typecheck/lint passa
\- \[ \] Verificar no browser

\---

**\### US-006: Filtros na listagem de briefings**
**\*\*Descrição:\*\*** Como sócio, quero filtrar briefings por categoria e complexidade para encontrar rapidamente o que preciso.

**\*\*Acceptance Criteria:\*\***
\- \[ \] Filtro por categoria de serviço: Presença Digital / Construção de Produto / Automação & Scripts / Evolução Digital / Design & Identidade Visual / Todos
\- \[ \] Filtro por complexidade: Baixa / Média / Alta / Todas
\- \[ \] Filtro por temperatura do lead: Quente / Morno / Frio / Todas
\- \[ \] Filtros combinam (AND) quando múltiplos estão ativos
\- \[ \] Estado dos filtros é refletido na URL como query params (ex: \`?categoria=produto&complexidade=alta\`)
\- \[ \] Ao limpar filtros, URL retorna ao estado base
\- \[ \] Typecheck/lint passa
\- \[ \] Verificar no browser

\---

**\### US-007: Busca de briefings**
**\*\*Descrição:\*\*** Como sócio, quero buscar briefings por texto para localizar um lead específico rapidamente.

**\*\*Acceptance Criteria:\*\***
\- \[ \] Campo de busca na listagem filtra briefings por nome do negócio ou descrição da ideia
\- \[ \] Busca é feita client-side se a lista for pequena, ou via query param no backend se necessário
\- \[ \] Resultados atualizam enquanto o usuário digita (debounce de 300ms)
\- \[ \] Typecheck/lint passa
\- \[ \] Verificar no browser

\---

**\### US-008: Detalhe de um briefing**
**\*\*Descrição:\*\*** Como sócio, quero ver todas as informações de um briefing específico para entender o lead antes do diagnóstico.

**\*\*Acceptance Criteria:\*\***
\- \[ \] Rota \`/briefings/:id\` exibe página de detalhe
\- \[ \] Exibe: todas as respostas do Product Builder, classificação automática (categoria, complexidade, temperatura), data de envio, contato do lead (se capturado)
\- \[ \] Seção de "Anotações Internas" exibe o histórico de comentários dos sócios em ordem cronológica
\- \[ \] Cada anotação exibe: texto, autor (identificado pelo código de acesso) e timestamp
\- \[ \] Typecheck/lint passa
\- \[ \] Verificar no browser

\---

**\### US-009: Adicionar anotação interna em um briefing**
**\*\*Descrição:\*\*** Como sócio, quero adicionar anotações internas a um briefing para registrar decisões e observações da equipe.

**\*\*Acceptance Criteria:\*\***
\- \[ \] Campo de texto na página de detalhe para nova anotação
\- \[ \] Botão "Adicionar Anotação" submete a anotação ao backend
\- \[ \] Nova anotação aparece imediatamente na lista após envio com sucesso
\- \[ \] Autor da anotação é identificado automaticamente pela sessão atual
\- \[ \] Campo limpa após envio bem-sucedido
\- \[ \] Exibe erro se o envio falhar
\- \[ \] Typecheck/lint passa
\- \[ \] Verificar no browser

\---

**\### US-010: Listagem de pedidos de contratação/análise**
**\*\*Descrição:\*\*** Como sócio, quero ver os pedidos de contratação e análise separados dos briefings para gerenciar o pipeline comercial.

**\*\*Acceptance Criteria:\*\***
\- \[ \] Página \`/contratos\` exibe lista de pedidos de contratação/análise
\- \[ \] Cada item exibe: nome do lead, tipo de pedido (contratação/análise), data, status atual
\- \[ \] Lista é ordenada por data (mais recente primeiro)
\- \[ \] Filtro por status: Pendente / Em Análise / Aprovado / Recusado / Todos
\- \[ \] Exibe estado vazio quando não há pedidos
\- \[ \] Typecheck/lint passa
\- \[ \] Verificar no browser

\---

**\### US-011: Detalhe de pedido de contratação/análise**
**\*\*Descrição:\*\*** Como sócio, quero ver os detalhes de um pedido específico para decidir os próximos passos.

**\*\*Acceptance Criteria:\*\***
\- \[ \] Rota \`/contratos/:id\` exibe página de detalhe do pedido
\- \[ \] Exibe todas as informações do pedido: dados do lead, tipo, descrição, data, status atual
\- \[ \] Seção de anotações internas (mesmo padrão do briefing — US-008/US-009)
\- \[ \] Typecheck/lint passa
\- \[ \] Verificar no browser

\---

**\### US-012: Navegação e layout geral**
**\*\*Descrição:\*\*** Como sócio, quero uma navegação clara entre as seções do painel para operar com eficiência.

**\*\*Acceptance Criteria:\*\***
\- \[ \] Layout com sidebar ou header de navegação persistente em todas as páginas internas
\- \[ \] Links para: Briefings, Contratos/Análises
\- \[ \] Indicação visual da página ativa no menu
\- \[ \] Exibe o nome/identificação do sócio logado (baseado no código de acesso)
\- \[ \] Design limpo, profissional e de fácil leitura — sem exageros visuais
\- \[ \] Responsivo para desktop (foco principal) e tablet
\- \[ \] Typecheck/lint passa
\- \[ \] Verificar no browser

\---

**\## 4. Requisitos Funcionais**

\- **\*\*FR-1:\*\*** O sistema deve exigir dois fatores para autenticação enviados em uma única requisição: código de acesso único por sócio + OTP TOTP de 6 dígitos, em um formulário estilo usuário/senha.
\- **\*\*FR-2:\*\*** O sistema deve suportar 3 códigos de acesso distintos (um por sócio: Murillo, Matheus, Pedro), gerenciados pelo backend.
\- **\*\*FR-3:\*\*** Todos os sócios autenticados devem ver o mesmo conteúdo — o código apenas identifica quem está logado.
\- **\*\*FR-4:\*\*** A sessão autenticada deve ser mantida via token armazenado localmente (localStorage ou sessionStorage), validado pelo backend.
\- **\*\*FR-5:\*\*** Rotas internas devem ser inacessíveis sem sessão válida — redirecionar para \`/login\` automaticamente.
\- **\*\*FR-6:\*\*** A listagem de briefings deve exibir os campos de classificação automática gerados pelo backend: categoria de serviço, complexidade (Baixa/Média/Alta) e temperatura do lead (Quente/Morno/Frio).
\- **\*\*FR-7:\*\*** A página de detalhe de briefing deve exibir todas as respostas do Product Builder e o histórico de anotações internas.
\- **\*\*FR-8:\*\*** Sócios devem poder adicionar anotações internas em qualquer briefing ou pedido, com registro automático de autor e timestamp.
\- **\*\*FR-9:\*\*** Pedidos de contratação/análise devem ser listados separadamente dos briefings, com filtro por status.
\- **\*\*FR-10:\*\*** Filtros ativos na listagem devem ser refletidos na URL como query params para permitir compartilhamento de link e uso do botão voltar.
\- **\*\*FR-11:\*\*** Todas as requisições ao backend devem tratar os campos da resposta padronizada: \`responseType\`, \`message\`, \`status\`, \`data\`, \`extendedResultCode\`, \`date\`.
\- **\*\*FR-12:\*\*** Erros de rede ou respostas com \`responseType\` diferente de \`OK\` devem exibir mensagem de erro amigável ao usuário.

\---

**\## 5. Não-Escopo (Fora desta versão)**

\- Cadastro, criação ou gerenciamento de contas/códigos de acesso pelo frontend
\- Recuperação de código de acesso perdido
\- Notificações em tempo real (websockets, push notifications)
\- Dashboard com métricas e gráficos de conversão
\- Alteração de status de briefings ou pedidos (apenas visualização e anotações)
\- Suporte a dispositivos mobile (smartphone) — foco em desktop e tablet
\- Modo escuro ou temas customizáveis
\- Exportação de dados (PDF, CSV)
\- Integração com ClickUp ou outras ferramentas externas

\---

**\## 6. Considerações de Design**

\- Estética: profissional, limpa, técnica — alinhada com a identidade do Prisma Studio
\- Paleta sugerida: tons escuros com acentos em cor primária da marca
\- Tipografia legível para leitura de dados e textos longos de briefing
\- Cards de briefing devem usar badge colorido para temperatura do lead (ex: vermelho=quente, amarelo=morno, azul=frio) e para complexidade
\- Sidebar lateral fixa no desktop; colapsável ou ocultável conforme espaço
\- Sem animações desnecessárias — priorizar velocidade de leitura e operação

\---

**\## 7. Considerações Técnicas**

\- **\*\*Framework:\*\*** SvelteKit em modo SPA (\`adapter-static\` com \`fallback: '404.html'\`) + Svelte 5 com runes (\`$state\`, \`$derived\`, \`$effect\`)
\- **\*\*Linguagem:\*\*** TypeScript estrito
\- **\*\*CSS:\*\*** Tailwind CSS v4
\- **\*\*Roteamento:\*\*** file-based routing do SvelteKit — rotas protegidas via \`+layout.svelte\` com guard de sessão; login em rota pública \`/login\`
\- **\*\*Autenticação:\*\*** formulário único com dois campos (código + OTP) enviados em uma única requisição; token retornado pelo backend armazenado em \`localStorage\`; incluído como header \`Authorization: Bearer <token>\` em todas as requisições protegidas
\- **\*\*Backend:\*\*** \`https://prisma-internal-backend.onrender.com\` — toda comunicação via fetch nativo com wrapper central
\- **\*\*Resposta padronizada do backend:\*\*** toda requisição retorna \`{ responseType, message, status, data, extendedResultCode, date }\` — criar utilitário central (\`src/lib/api.ts\`) para tratar esse formato e lançar erros tipados
\- **\*\*TOTP:\*\*** validação feita 100% pelo backend; o frontend apenas captura e envia o código de 6 dígitos junto com o código de acesso
\- **\*\*Estado global:\*\*** mínimo necessário — sessão do usuário logado via Svelte store ou rune de contexto; demais estados gerenciados localmente por página

\---

**\## 8. Métricas de Sucesso**

\- Tempo de carregamento da listagem de briefings < 2 segundos em conexão normal
\- Fluxo de autenticação (código + OTP) concluído em menos de 30 segundos
\- Zero rotas internas acessíveis sem autenticação válida
\- Sócios conseguem localizar e anotar um briefing específico em menos de 1 minuto

\---

**\## 9. Questões em Aberto**

\- **\*\*Backend endpoints:\*\*** Quais são os endpoints exatos para: listar briefings, detalhar briefing, listar contratos, detalhar contrato, adicionar anotação, autenticação (código + TOTP)? A documentação da API precisa ser fornecida antes da implementação das US-005 em diante.
\- **\*\*Roteamento:\*\*** Usar \`svelte-routing\` (SPA pura hospedada em CDN) ou SvelteKit em modo SPA? Isso impacta a estrutura do projeto desde o início.
\- **\*\*CSS:\*\*** Tailwind CSS ou CSS nativo com variáveis? Definir antes de começar qualquer componente visual.
\- **\*\*Token de sessão:\*\*** Qual a duração do token retornado pelo backend? Isso define se precisamos de refresh token ou reautenticação completa.
\- **\*\*Identificação do sócio:\*\*** O backend retorna o nome/identificador do sócio junto com o token de sessão, ou apenas valida o acesso?
\- **\*\*Anotações:\*\*** As anotações internas já existem no backend como endpoint, ou precisam ser desenvolvidas junto com o frontend?

# SKILL.md

\---
name: prisma-brand
description: "Applies PRISMA Studio's visual identity and design system to any artifact — components, screens, documents, code. Use when the user wants something styled in the PRISMA brand, asks to follow the design system, or needs a new UI screen/component consistent with the existing product. Triggers on: prisma brand, brand guide, design system, estilo prisma, aplica o estilo, segue o brandguide."
user-invocable: true
\---

**\# PRISMA Studio — Brand Application**

Apply the PRISMA Studio design system to whatever the user requests. The goal is always **\*\*retro-futurismo austero\*\***: a control panel that has existed for decades, built to last forever. Alien / 2001 / Tron. No decorations that don't serve a function.

**\---**

**\## Concept to keep in mind at every decision**

\- **\*\*Serious, not cold.\*\*** The interface has weight and intention.
\- **\*\*Functional, not minimal for aesthetics.\*\*** Every element earns its place.
\- **\*\*Atmospheric, not decorated.\*\*** Effects create world, not style.
\- **\*\*Precise, not perfect.\*\*** VHS has wear. That's part of it.

**\---**

**\## Colors**

**\### Backgrounds**
\`\`\`
Root/page:    #070609   (near-black, very slightly purple)
Card/panel:   #0a0910   (slightly lighter)
Input:        rgba(0, 0, 0, 0.45)
Input focus:  rgba(0, 0, 0, 0.60)
\`\`\`

**\### Text — VHS warm off-white palette**
All text derives from \`#dad4c4\` (warm cream, like old VHS tape) at varying opacities:
\`\`\`
Primary:      rgba(218, 212, 196, 0.90)   ← inputs, main content
Secondary:    rgba(218, 212, 196, 0.55)   ← supporting text
Label:        rgba(218, 212, 196, 0.35)   ← field labels
Muted:        rgba(218, 212, 196, 0.22)   ← decorative, subtitles
HUD overlay:  rgba(218, 212, 196, 0.28)   ← VHS HUD elements
\`\`\`

**\### Borders**
\`\`\`
Default:  rgba(255, 255, 255, 0.07–0.08)
Hover:    rgba(255, 255, 255, 0.13)
Focus:    rgba(255, 255, 255, 0.22–0.25)
Filled:   rgba(255, 255, 255, 0.16)
\`\`\`

**\### Status / Alert**
\`\`\`
REC indicator:  #c43030
Error text:     rgba(200, 100, 100, 0.85)
Error border:   rgba(180, 60, 60, 0.50)
\`\`\`

**\### The Prism Gradient — brand's only color**
\`\`\`css
\--prism: linear-gradient(
  90deg,
  #c026d3 0%,
  #7c3aed 22%,
  #4f46e5 44%,
  #0891b2 70%,
  #06b6d4 86%,
  #c026d3 100%
);
\`\`\`
The prism is **\*\*never static\*\***. Always animated:
\`\`\`css
background-size: 200% 100%;
animation: prism-shift 8s linear infinite;

@keyframes prism-shift {
  from { background-position: 0%   0%; }
  to   { background-position: 200% 0%; }
}
\`\`\`

**\*\*Prism is used ONLY on:\*\***
\- Logo mark (triangle)
\- "PRISMA" wordmark text
\- Card accent line (top border)

**\*\*Never on:\*\*** buttons, labels, backgrounds, icons, body text.

**\---**

**\## Typography**

\`\`\`
Display / UI:    Syne           (Google Fonts)
Code / Labels:   JetBrains Mono (Google Fonts)
\`\`\`

| Role | Font | Weight | Size | Letter-spacing |
|---|---|---|---|---|
| Brand "PRISMA" | Syne | 800 | 26px | 0.24em |
| Screen titles | Syne | 700 | 20–24px | 0.08em |
| Body text | Syne | 400 | 14–15px | 0 |
| Field labels | JetBrains Mono | 400 | 10px | 0.18em |
| Inputs / data | JetBrains Mono | 400 | 17–20px | 0.10em |
| HUD overlay | JetBrains Mono | 400 | 10px | 0.12em |
| "STUDIO" | JetBrains Mono | 400 | 11px | 0.52em |
| Metadata, footers | JetBrains Mono | 400 | 9–10px | 0.12–0.20em |

Rules:
\- Field labels: always \`uppercase\`, JetBrains Mono, generous letter-spacing
\- Inputs: always JetBrains Mono — never Syne in data entry fields
\- Syne = narrative and titles; Mono = system and data
\- \`font-weight\` above 700 only for "PRISMA" wordmark

**\---**

**\## Logo & Brand Mark**

\`\`\`css
/\* Triangle — prism cross-section \*/
.logo-icon {
  width: 32px; height: 28px;
  background: var(--prism);
  background-size: 200% 100%;
  clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
  animation: prism-shift 8s linear infinite;
  filter:
    drop-shadow(-2px 0 rgba(255, 0, 100, 0.25))
    drop-shadow( 2px 0 rgba(0, 180, 255, 0.25))
    drop-shadow(0 4px 12px rgba(109, 40, 217, 0.35));
}

/\* "PRISMA" wordmark \*/
.brand-prisma {
  font-family: 'Syne', sans-serif;
  font-size: 26px; font-weight: 800;
  letter-spacing: 0.24em;
  background: var(--prism);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: prism-shift 8s linear infinite;
  filter:
    drop-shadow(-1px 0 rgba(255, 0, 80, 0.18))
    drop-shadow( 1px 0 rgba(0, 160, 255, 0.18));
}

/\* "STUDIO" lockup — always below PRISMA \*/
.brand-studio {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; font-weight: 400;
  letter-spacing: 0.52em;
  color: rgba(218, 212, 196, 0.22);
  text-transform: uppercase;
}
\`\`\`

The chromatic aberration (\`drop-shadow\` R/B offset) is **\*\*mandatory\*\*** on the logo mark and PRISMA text. Without it, the brand loses its VHS identity.

**\---**

**\## VHS Atmosphere (required on all main screens)**

Four layers, always stacked in this order:

**\### 1 — Grain (z-index: 100)**
\`\`\`css
.grain {
  position: fixed; inset: -50%; width: 200%; height: 200%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity: 0.038;
  animation: grain-drift 0.35s steps(1) infinite;
  pointer-events: none; z-index: 100;
}
@keyframes grain-drift {
  0%  { transform: translate(0, 0); }
  25% { transform: translate(-4%, -4%); }
  50% { transform: translate(-8%, 4%); }
  75% { transform: translate(4%, -8%); }
}
\`\`\`

**\### 2 — Scanlines (z-index: 50)**
\`\`\`css
.scanlines {
  position: fixed; inset: 0; pointer-events: none; z-index: 50;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0px, transparent 2px,
    rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px
  );
}
\`\`\`

**\### 3 — Vignette (z-index: 2)**
\`\`\`css
.vignette {
  position: fixed; inset: 0; pointer-events: none; z-index: 2;
  background: radial-gradient(
    ellipse at center,
    transparent 38%, rgba(0,0,0,0.45) 68%, rgba(0,0,0,0.88) 100%
  );
}
\`\`\`

**\### 4 — Tracking Glitch (z-index: 10)**
\`\`\`css
.glitch {
  position: fixed; left: 0; right: 0; height: 2px;
  background: rgba(255,255,255,0.06);
  pointer-events: none; z-index: 10;
  animation: glitch-sweep 22s linear infinite;
}
@keyframes glitch-sweep {
  0%     { top: -2px; opacity: 0; }
  4%     { top: 25vh; opacity: 1; }
  4.08%  { top: 27vh; opacity: 0.4; }
  4.16%  { top: 25vh; opacity: 1; }
  4.24%  { opacity: 0; }
  50%    { opacity: 0; top: 60vh; }
  51%    { opacity: 0.5; top: 62vh; }
  51.1%  { opacity: 0; }
  100%   { opacity: 0; }
}
\`\`\`

**\---**

**\## VHS HUD (required on all main screens)**

Metadata "burned into the tape" — overlaid on everything at z-index: 5. Represents the system recording in real time.

\`\`\`html
<div class="hud" aria-hidden="true">
  <div class="hud-rec"><span class="rec-dot"></span><span>REC</span></div>
  <div class="hud-time">{clock}</div>
  <div class="hud-status">SISTEMA PRONTO</div>
  <div class="hud-ch">CH·01</div>
</div>
\`\`\`

\`\`\`css
.hud {
  position: fixed; inset: 20px; pointer-events: none; z-index: 5;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase;
  color: rgba(218, 212, 196, 0.28);
}
.hud-rec    { position: absolute; top: 0; left: 0;
              display: flex; align-items: center; gap: 5px;
              color: rgba(196, 48, 48, 0.65); }
.hud-time   { position: absolute; top: 0; right: 0; }
.hud-status { position: absolute; bottom: 0; left: 0; }
.hud-ch     { position: absolute; bottom: 0; right: 0; }

.rec-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #c43030;
  box-shadow: 0 0 6px rgba(196, 48, 48, 0.8);
  animation: rec-blink 1.2s step-end infinite;
}
@keyframes rec-blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}
\`\`\`

Svelte timestamp (adapt to any framework):
\`\`\`typescript
let _clock_ **\=** $state('00:00:00')
$effect(() => {
  const tick **\=** () => { _clock_ **\=** new Date().toTimeString().slice(0, 8) }
  tick()
  const id **\=** setInterval(_tick_, 1000)
  return () => clearInterval(_id_)
})
\`\`\`

HUD status by screen context:
\`\`\`
Login:      SISTEMA PRONTO    CH·01
Dashboard:  SESSÃO ATIVA      CH·02
Briefings:  MODO LEITURA      CH·03
Error:      FALHA DETECTADA   CH·01
\`\`\`

**\---**

**\## Surfaces**

**\### Card / Panel**
\`\`\`css
.card {
  background: #0a0910;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 6px;
  overflow: hidden;
  box-shadow:
    inset 0 0 80px rgba(0,0,0,0.5),
    0 30px 70px rgba(0,0,0,0.75);
}
\`\`\`
\- No \`backdrop-filter\` — surfaces are solid, not glass
\- Max border-radius: 8px. Prefer 4–6px
\- Prism accent line on top is required for primary cards

**\### Prism Accent Line (top of primary cards)**
\`\`\`css
.card-prism {
  position: absolute; top: 0; left: 0; right: 0;
  height: 2px;
  background: var(--prism); background-size: 200% 100%;
  animation: prism-shift 8s linear infinite;
}
.card-prism::after {
  content: '';
  position: absolute; left: 0; right: 0; top: 0; height: 16px;
  background: inherit; background-size: inherit; animation: inherit;
  filter: blur(10px); opacity: 0.4;
}
\`\`\`

**\---**

**\## UI Components**

**\### Field Label**
\`\`\`css
.field-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px; letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(218, 212, 196, 0.35);
}
\`\`\`
No icons, no prefixes, no decorations. Text only.

**\### Text Input**
\`\`\`css
.field-input {
  height: 52px; padding: 0 18px;
  background: rgba(0,0,0,0.45);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 17px;
  color: rgba(218, 212, 196, 0.9);
  text-align: center; letter-spacing: 0.1em;
  caret-color: rgba(218, 212, 196, 0.7);
  outline: none;
  transition: border-color 0.18s ease, background 0.18s ease;
}
.field-input:focus {
  border-color: rgba(255,255,255,0.22);
  background: rgba(0,0,0,0.6);
}
\`\`\`

**\### Button (Primary)**
No accent colors. Enabled state is only more opaque than disabled.
\`\`\`css
.btn {
  height: 48px; padding: 0 24px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 4px;
  color: rgba(218, 212, 196, 0.40);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px; letter-spacing: 0.22em; text-transform: uppercase;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}
.btn:not(:disabled) {
  border-color: rgba(255,255,255,0.20);
  color: rgba(218, 212, 196, 0.85);
}
.btn:hover:not(:disabled) {
  background: rgba(255,255,255,0.04);
  border-color: rgba(255,255,255,0.32);
  color: rgba(218, 212, 196, 1);
}
.btn:disabled { opacity: 0.20; cursor: not-allowed; }
\`\`\`

**\### Error Message**
\`\`\`css
.error {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: rgba(200, 100, 100, 0.85);
  padding: 10px 13px;
  border-left: 2px solid rgba(180, 60, 60, 0.5);
  background: rgba(180, 60, 60, 0.05);
  border-radius: 0 3px 3px 0;
  line-height: 1.6; letter-spacing: 0.04em;
}
\`\`\`
Error messages: short and direct. Max one sentence. No emoji, no icons.

**\---**

**\## Motion**

| Element | Duration | Easing |
|---|---|---|
| Prism gradient | 8s linear infinite | — |
| Screen/card enter | 0.55s | \`cubic-bezier(0.22, 1, 0.36, 1)\` |
| UI state transitions | 0.18–0.20s ease | — |
| Glitch sweep | 22s linear infinite | — |
| REC blink | 1.2s step-end infinite | — |
| Grain drift | 0.35s steps(1) infinite | — |

\`\`\`css
/\* Screen entry — always translateY, never fade alone \*/
@keyframes enter {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.screen { animation: enter 0.55s cubic-bezier(0.22, 1, 0.36, 1) both; }
\`\`\`

Motion rules:
\- Entries: bottom-to-top translate + fade. Never fade alone.
\- Exits: simple fade, no slide
\- Nothing pulses, floats, or "breathes" — except prism gradient and REC dot
\- Max UI transition duration: 0.25s

**\---**

**\## Base Screen Template**

Copy this for every new screen:

\`\`\`html
<div class="root">
  <!-- VHS atmosphere -->
  <div class="grain"     aria-hidden="true"></div>
  <div class="scanlines" aria-hidden="true"></div>
  <div class="vignette"  aria-hidden="true"></div>
  <div class="glitch"    aria-hidden="true"></div>

  <!-- HUD burned into tape -->
  <div class="hud" aria-hidden="true">
    <div class="hud-rec"><span class="rec-dot"></span><span>REC</span></div>
    <div class="hud-time">{clock}</div>
    <div class="hud-status">SISTEMA PRONTO</div>
    <div class="hud-ch">CH·01</div>
  </div>

  <!-- Screen content -->
  <main class="screen">
    <!-- primary card gets a .card-prism on top -->
    <div class="card-prism" aria-hidden="true"></div>
    <!-- ... -->
  </main>
</div>
\`\`\`

\`\`\`css
.root {
  min-height: 100dvh;
  background: #070609;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.screen {
  animation: enter 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}
\`\`\`

**\---**

**\## Hard Rules (never break these)**

1\. Prism gradient only on: logo mark, "PRISMA" text, card accent line
2\. No \`backdrop-filter\` anywhere — surfaces are solid
3\. No pure white (\`#ffffff\`) in any text
4\. No color accents on interactive elements (buttons, focus rings, etc.)
5\. No border-radius above 8px
6\. No decorative icons or illustrations
7\. No long label text — 3 words maximum
8\. The 4 VHS layers are required on every full-screen view
9\. The HUD is required on every full-screen view
10\. Chromatic aberration is required on the logo mark

**\---**

**\## How to apply this skill**

When the user asks to style something in the PRISMA brand:

1\. Identify what type of artifact it is (screen, component, document, etc.)
2\. Apply the base template if it's a full screen
3\. Use only colors and typography from this guide — no improvisation
4\. Every interactive element gets the neutral off-white palette, not accent colors
5\. Add the VHS atmosphere layers if it's a full screen
6\. Add the HUD with appropriate \`hud-status\` and \`hud-ch\` for the context
7\. The prism gradient appears only on brand elements
8\. When in doubt: less is more. Remove, don't add.

# Backend

URL BASE: [https://prisma-internal-backend.onrender.com](https://prisma-internal-backend.onrender.com)

## **Documentação:**

**Backend · Estrutura de Resposta Padronizada**
O backend utiliza um formato padronizado para todas as respostas da API. Toda resposta sempre contém os seguintes campos:
**Campos da resposta**
*   **responseType** — Tipo da resposta retornada pela API.
*   Valores possíveis:
*   `UNAUTHORIZED`, `FORBIDDEN`, `BAD_REQUEST`, `TOO_MANY_REQUESTS`, `INTERNAL_SERVER_ERROR`, `OK`
*   **message** — Mensagem descritiva da resposta.
*   **status** — Código de status da operação.
*   **data** — Dados retornados pela operação.
*   **extendedResultCode** — Código adicional para detalhamento do resultado.
*   **date** — Data e hora em que a resposta foi gerada.

##

# Auth

## Módulo: Auth

### Objetivo
Autenticar usuário interno com **PIN** + **OTP** e retornar um **JWT** para acesso às rotas protegidas.
* * *

### **Endpoint**
**POST** `/auth/login`
* * *

### **Payload - Request**

```json
{
  "pin": "123456",
  "otp": 123456
}
```

#### **Regras do Payload**
*   **pin**: string, obrigatório.
*   **otp**: int, obrigatório.
    *   Deve conter exatamente 6 dígitos.
#### **Enums usados no request**
*   Não há enums neste módulo usados no request.
* * *

### **Resposta de Sucesso**
**Status:** 200 OK

```json
{
  "responseType": "OK",
  "message": "Login realizado com sucesso.",
  "status": 200,
  "data": {
    "jwt": "SEU_TOKEN_JWT"
  },
  "extendedResultCode": "#SUCCESS",
  "date": "2026-03-07T12:00:00.000Z"
}
```

* * *

### **Extended Codes do Módulo Auth**
*   **#AUTH\_001**

**Significado:** Credenciais inválidas no login.

**Quando acontece:** PIN não encontrado ou OTP inválido.

*   **#AUTH\_002**

**Significado:** JWT expirado.

**Quando acontece:** Acesso a rota protegida com token vencido.

*   **#AUTH\_003**

**Significado:** JWT inválido.

**Quando acontece:** Token malformado, assinado incorretamente ou inválido.

*   **#AUTH\_004**

**Significado:** JWT ausente.

**Quando acontece:** Rota protegida chamada sem header **Authorization**.

* * *

### **Observações**
*   O **JWT** retornado identifica o usuário autenticado.
*   O módulo utiliza **RouteMessage** como padrão de resposta.
*   As rotas protegidas esperam o header:

**Authorization: Bearer SEU\_TOKEN\_JWT**

# Lead

# Módulo Lead
Módulo responsável pelo gerenciamento de **leads (oportunidades comerciais)**.
Utiliza **soft delete**, ou seja, registros não são removidos fisicamente do banco. Em vez disso, o campo `deletedAt` é preenchido.
Leads removidos **não aparecem em listagens**.
* * *
# Extended Result Codes

| Código | Significado |
| ---| --- |
| `#LEAD_001` | O ID do lead informado é inválido (formato incorreto, não é um ObjectId de 24 caracteres hex). |
| `#LEAD_002` | O lead solicitado não existe ou foi removido (soft delete). |
| `#LEAD_003` | Algum filtro ou parâmetro de ordenação da listagem é inválido. |
| `#LEAD_004` | Uma lista de relacionamentos (briefings, diagnoses, etc) contém IDs inválidos. |

* * *
# Enums
## LeadStatus
Estágio comercial atual do lead.
Envie sempre o **valor wire (string)** nas requisições.

| Valor wire | Descrição |
| ---| --- |
| `new_lead` | Lead recém captado, sem interação. (default no create) |
| `briefing_completed` | Briefing concluído no Product Builder; ainda pode não existir lead comercial vinculado. |
| `mvp_generated` | MVP conceitual gerado a partir do briefing; ainda pode não existir lead comercial vinculado. |
| `interested` | Solicitante demonstrou interesse após ver o MVP e entrou no pipeline comercial. |
| `diagnosis_scheduled` | Reunião de diagnóstico marcada. |
| `proposal_sent` | Proposta comercial enviada. |
| `closed_won` | Cliente fechou o projeto. |
| `closed_lost` | Oportunidade perdida. |

* * *
## LeadSource
Origem de aquisição do lead.
Campo **opcional**, pode ser `null`.

| Valor wire | Descrição |
| ---| --- |
| `instagram` | Instagram |
| `google_ads` | Google Ads |
| `direct` | Direto |
| `referral` | Indicação |
| `website` | Site |
| `other` | Outro |

* * *
## LeadTemperature
Classificação térmica do lead.

| Valor wire | Descrição |
| ---| --- |
| `cold` | Frio (default no create) |
| `warm` | Morno |
| `hot` | Quente |

* * *
## Owner (assignedTo)
Responsável pelo lead.
Campo **obrigatório no create**.

| Valor wire |
| --- |
| `murillo` |
| `pedro` |
| `matheus` |

* * *
# Endpoints
* * *
# POST /leads
Cria um novo lead.
## Request — Payload

| Campo | Tipo | Obrigatório | Default | Descrição |
| ---| ---| ---| ---| --- |
| `assignedTo` | `string` | Sim | — | Responsável pelo lead. Enum `Owner`. |
| `name` | `string` | Não | `null` | Nome do lead. |
| `email` | `string` | Não | `null` | Email do lead. |
| `phone` | `string` | Não | `null` | Telefone do lead. |
| `company` | `string` | Não | `null` | Empresa do lead. |
| `source` | `string` | Não | `null` | Origem de aquisição. Enum `LeadSource`. |
| `notes` | `string` | Não | `null` | Notas internas. |
| `status` | `string` | Não | `"new_lead"` | Estágio comercial. Enum `LeadStatus`. |
| `temperature` | `string` | Não | `"cold"` | Classificação térmica. Enum `LeadTemperature`. |
| `contacted` | `boolean` | Não | `false` | Indica se já houve contato. |
| `lastContactAt` | `string | null` | Não | `null` | Data do último contato (ISO-8601). |
| `briefings` | `string[]` | Não | `[]` | IDs de briefings vinculados ao lead após qualificação comercial. |
| `diagnoses` | `string[]` | Não | `[]` | IDs de diagnósticos relacionados. |
| `proposals` | `string[]` | Não | `[]` | IDs de propostas relacionadas. |
| `projects` | `string[]` | Não | `[]` | IDs de projetos relacionados. |
| `activities` | `string[]` | Não | `[]` | IDs de atividades relacionadas. |

### Exemplo de request

```perl
{
  "assignedTo": "murillo",
  "name": "Joao Silva",
  "email": "joao@empresa.com",
  "phone": "11999999999",
  "company": "Empresa X",
  "source": "instagram",
  "notes": "Interessado em app de delivery",
  "status": "new_lead",
  "temperature": "warm"
}
```

* * *
## Resposta de sucesso (201)

```json
{
  "responseType": "OK",
  "message": "Lead criado com sucesso.",
  "status": 201,
  "data": {
    "lead": {
      "id": "6601a2b3e4b0c1d2e3f4a5b6",
      "name": "Joao Silva",
      "email": "joao@empresa.com",
      "phone": "11999999999",
      "company": "Empresa X",
      "source": "instagram",
      "notes": "Interessado em app de delivery",
      "status": "new_lead",
      "temperature": "warm",
      "assignedTo": "murillo",
      "contacted": false,
      "lastContactAt": null,
      "createdAt": "2026-03-07T11:00:00.000Z",
      "updatedAt": "2026-03-07T11:00:00.000Z",
      "briefings": [],
      "diagnoses": [],
      "proposals": [],
      "projects": [],
      "activities": []
    }
  },
  "extendedResultCode": "#SUCCESS",
  "date": "2026-03-07T11:00:00.000Z"
}
```

* * *
# GET /leads
Lista leads com **filtros e paginação**.
Leads removidos via **soft delete não aparecem**.
## Query Parameters

| Parâmetro | Tipo | Default | Descrição |
| ---| ---| ---| --- |
| `status` | `string` | — | Filtra por status (`LeadStatus`). |
| `source` | `string` | — | Filtra por origem (`LeadSource`). |
| `temperature` | `string` | — | Filtra por temperatura (`LeadTemperature`). |
| `assignedTo` | `string` | — | Filtra por responsável (`Owner`). |
| `contacted` | `string` | — | Filtra por contato (`"true"` ou `"false"`). |
| `createdFrom` | `string` | — | Data mínima de criação (ISO-8601). |
| `createdTo` | `string` | — | Data máxima de criação (ISO-8601). |
| `page` | `int` | `1` | Página atual. |
| `limit` | `int` | `20` | Itens por página (máximo 100). |
| `sortBy` | `string` | `createdAt` | Campo de ordenação. |
| `sortOrder` | `string` | `desc` | Direção (`asc` ou `desc`). |

Campos permitidos em `sortBy`:

```bash
createdAt
updatedAt
lastContactAt
name
status
temperature
assignedTo
email
company
source
contacted
```

* * *
## Resposta de sucesso (200)

```json
{
  "responseType": "OK",
  "message": "Leads listados com sucesso.",
  "status": 200,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalItems": 1,
      "totalPages": 1,
      "sortBy": "createdAt",
      "sortOrder": "desc"
    }
  },
  "extendedResultCode": "#SUCCESS",
  "date": "2026-03-07T11:00:00.000Z"
}
```

* * *
# GET /leads/:id
Retorna o detalhe de um lead.
## Resposta de sucesso (200)

```json
{
  "responseType": "OK",
  "message": "Lead encontrado com sucesso.",
  "status": 200,
  "data": {
    "lead": {}
  },
  "extendedResultCode": "#SUCCESS",
  "date": "2026-03-07T11:00:00.000Z"
}
```

* * *
# PATCH /leads/:id
Atualiza campos de um lead.
Campos **não enviados no payload permanecem inalterados**.
Pelo menos **um campo deve ser enviado**.
## Payload

| Campo | Tipo | Descrição |
| ---| ---| --- |
| `name` | `string | null` | Nome do lead. |
| `email` | `string | null` | Email. |
| `phone` | `string | null` | Telefone. |
| `company` | `string | null` | Empresa. |
| `source` | `string | null` | Origem (`LeadSource`). |
| `notes` | `string | null` | Notas internas. |
| `status` | `string` | Estágio comercial (`LeadStatus`). |
| `temperature` | `string` | Temperatura (`LeadTemperature`). |
| `assignedTo` | `string` | Responsável (`Owner`). |
| `contacted` | `boolean` | Se houve contato. |
| `lastContactAt` | `string | null` | Data do último contato. |
| `briefings` | `string[]` | Substitui lista inteira. |
| `diagnoses` | `string[]` | Substitui lista inteira. |
| `proposals` | `string[]` | Substitui lista inteira. |
| `projects` | `string[]` | Substitui lista inteira. |
| `activities` | `string[]` | Substitui lista inteira. |

* * *
# DELETE /leads/:id
Remove o lead via **soft delete**.
O campo `deletedAt` é preenchido e o lead **não aparece mais nas listagens**.
## Resposta de sucesso (200)

```json
{
  "responseType": "OK",
  "message": "Lead removido com sucesso.",
  "status": 200,
  "data": {
    "id": "6601a2b3e4b0c1d2e3f4a5b6"
  },
  "extendedResultCode": "#SUCCESS",
  "date": "2026-03-07T12:00:00.000Z"
}
```

* * *

# Briefing

# Módulo Briefing
Módulo responsável pelo gerenciamento de **briefings coletados no Product Builder**.
Um briefing **pode existir sem lead** e ser vinculado posteriormente durante a **qualificação comercial**.
* * *
# Extended Result Codes

| Código | Significado |
| ---| --- |
| `#BRIEFING_001` | O ID do briefing informado é inválido (formato incorreto, não é um ObjectId de 24 caracteres hex). |
| `#BRIEFING_002` | O briefing solicitado não foi encontrado no banco de dados. |
| `#BRIEFING_003` | Algum filtro ou parâmetro de ordenação da listagem é inválido. |
| `#BRIEFING_004` | O `leadId` referenciado no briefing é inválido (formato incorreto). |

* * *
# Enums
## Complexity (complexityEstimate)
Estimativa de complexidade do projeto descrito no briefing.
Envie sempre o **valor wire (string)** nas requisições.

| Valor wire | Descrição |
| ---| --- |
| `low` | Baixa complexidade |
| `medium` | Média complexidade (default no create) |
| `high` | Alta complexidade |

* * *
# Endpoints
* * *
# POST /briefings
Cria um novo briefing originado no **Product Builder**.
O campo `leadId` é **opcional no create**.
* * *
## Request — Payload

| Campo | Tipo | Obrigatório | Default | Descrição |
| ---| ---| ---| ---| --- |
| `requesterName` | `string` | Sim | — | Nome da pessoa que solicitou o briefing. |
| `requesterEmail` | `string` | Sim | — | Email de contato do solicitante. |
| `requesterPhone` | `string` | Não | `null` | Telefone ou WhatsApp do solicitante. |
| `requesterCompany` | `string` | Não | `null` | Empresa informada pelo solicitante. |
| `leadId` | `string | null` | Não | `null` | ObjectId do lead quando a solicitação virar oportunidade comercial. |
| `productIdea` | `string` | Sim | — | Descrição da ideia do produto. |
| `businessType` | `string` | Sim | — | Tipo de negócio (ex: Marketplace, SaaS, B2B). |
| `targetAudience` | `string` | Sim | — | Público-alvo do produto. |
| `mainProblem` | `string` | Sim | — | Problema principal que o produto resolve. |
| `desiredOutcome` | `string` | Sim | — | Resultado desejado pelo cliente. |
| `coreFeatures` | `string[]` | Sim | — | Funcionalidades principais. Não pode ser vazio. |
| `currentSolution` | `string` | Não | `null` | Solução atual utilizada pelo cliente. |
| `inspiration` | `string` | Não | `null` | Referências ou inspirações. |
| `complexityEstimate` | `string` | Não | `"medium"` | Estimativa de complexidade (`Complexity`). |
| `extraNotes` | `string` | Não | `null` | Observações adicionais. |

* * *
## Exemplo de request

```json
{
  "requesterName": "Joao Silva",
  "requesterEmail": "joao@empresa.com",
  "requesterPhone": "+55 11 99999-0000",
  "requesterCompany": "Empresa X",
  "productIdea": "App de delivery para restaurantes",
  "businessType": "Marketplace",
  "targetAudience": "Restaurantes locais",
  "mainProblem": "Falta de visibilidade online",
  "desiredOutcome": "Aumentar faturamento em 30%",
  "coreFeatures": ["Cardapio digital", "Pedidos em tempo real"],
  "currentSolution": "WhatsApp",
  "inspiration": "iFood",
  "complexityEstimate": "high",
  "extraNotes": "Cliente quer lancar em 2 meses"
}
```

* * *
## Resposta de sucesso (201)

```json
{
  "responseType": "OK",
  "message": "Briefing criado com sucesso.",
  "status": 201,
  "data": {
    "briefing": {
      "id": "6601b3a4e4b0c1d2e3f4a5c7",
      "requesterName": "Joao Silva",
      "requesterEmail": "joao@empresa.com",
      "requesterPhone": "+55 11 99999-0000",
      "requesterCompany": "Empresa X",
      "leadId": null,
      "productIdea": "App de delivery para restaurantes",
      "businessType": "Marketplace",
      "targetAudience": "Restaurantes locais",
      "mainProblem": "Falta de visibilidade online",
      "currentSolution": "WhatsApp",
      "desiredOutcome": "Aumentar faturamento em 30%",
      "coreFeatures": ["Cardapio digital", "Pedidos em tempo real"],
      "inspiration": "iFood",
      "complexityEstimate": "high",
      "extraNotes": "Cliente quer lancar em 2 meses",
      "createdAt": "2026-03-07T11:00:00.000Z",
      "updatedAt": "2026-03-07T11:00:00.000Z"
    }
  },
  "extendedResultCode": "#SUCCESS",
  "date": "2026-03-07T11:00:00.000Z"
}
```

* * *
# GET /briefings
Lista briefings com **filtros e paginação**.
* * *
## Query Parameters

| Parâmetro | Tipo | Default | Descrição |
| ---| ---| ---| --- |
| `leadId` | `string` | — | Filtra por lead (ObjectId). |
| `complexity` | `string` | — | Filtra por complexidade (`Complexity`). |
| `createdFrom` | `string` | — | Data mínima de criação (ISO-8601). |
| `createdTo` | `string` | — | Data máxima de criação (ISO-8601). |
| `page` | `int` | `1` | Página atual. |
| `limit` | `int` | `20` | Itens por página (máx. 100). |
| `sortBy` | `string` | `createdAt` | Campo de ordenação. |
| `sortOrder` | `string` | `desc` | Direção (`asc` ou `desc`). |

Campos permitidos em `sortBy`:

```plain
createdAt
updatedAt
complexityEstimate
productIdea
businessType
```

* * *
## Resposta de sucesso (200)

```json
{
  "responseType": "OK",
  "message": "Briefings listados com sucesso.",
  "status": 200,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalItems": 1,
      "totalPages": 1,
      "sortBy": "createdAt",
      "sortOrder": "desc"
    }
  },
  "extendedResultCode": "#SUCCESS",
  "date": "2026-03-07T11:00:00.000Z"
}
```

* * *
# GET /briefings/:id
Retorna o **detalhe de um briefing**.
* * *
## Resposta de sucesso (200)

```json
{
  "responseType": "OK",
  "message": "Briefing encontrado com sucesso.",
  "status": 200,
  "data": {
    "briefing": {}
  },
  "extendedResultCode": "#SUCCESS",
  "date": "2026-03-07T11:00:00.000Z"
}
```

* * *
# PATCH /briefings/:id
Atualiza campos do briefing.
Campos **não enviados no body permanecem inalterados**.
É necessário enviar **pelo menos um campo**.
* * *
## Payload

| Campo | Tipo | Descrição |
| ---| ---| --- |
| `requesterName` | `string` | Nome do solicitante. |
| `requesterEmail` | `string` | Email do solicitante. |
| `requesterPhone` | `string | null` | Telefone ou WhatsApp. Envie `null` para limpar. |
| `requesterCompany` | `string | null` | Empresa. Envie `null` para limpar. |
| `leadId` | `string | null` | Lead vinculado. Envie `null` para remover o vínculo. |
| `productIdea` | `string` | Ideia do produto. |
| `businessType` | `string` | Tipo de negócio. |
| `targetAudience` | `string` | Público-alvo. |
| `mainProblem` | `string` | Problema principal. |
| `desiredOutcome` | `string` | Resultado desejado. |
| `coreFeatures` | `string[]` | Funcionalidades principais. Substitui a lista inteira. Não pode ser vazio. |
| `currentSolution` | `string | null` | Solução atual. Envie `null` para limpar. |
| `inspiration` | `string | null` | Inspirações. Envie `null` para limpar. |
| `complexityEstimate` | `string` | Complexidade (`Complexity`). |
| `extraNotes` | `string | null` | Notas adicionais. Envie `null` para limpar. |

* * *
## Resposta de sucesso (200)

```json
{
  "responseType": "OK",
  "message": "Briefing atualizado com sucesso.",
  "status": 200,
  "data": {
    "briefing": {
      "id": "6601b3a4e4b0c1d2e3f4a5c7",
      "requesterName": "Joao Silva",
      "requesterEmail": "joao@empresa.com",
      "requesterPhone": null,
      "requesterCompany": "Empresa X",
      "leadId": "6601a2b3e4b0c1d2e3f4a5b6",
      "productIdea": "App de delivery atualizado",
      "businessType": "Marketplace",
      "targetAudience": "Restaurantes locais",
      "mainProblem": "Falta de visibilidade online",
      "currentSolution": null,
      "desiredOutcome": "Aumentar faturamento em 50%",
      "coreFeatures": ["Feature atualizada"],
      "inspiration": null,
      "complexityEstimate": "low",
      "extraNotes": null,
      "createdAt": "2026-03-07T11:00:00.000Z",
      "updatedAt": "2026-03-07T15:00:00.000Z"
    }
  },
  "extendedResultCode": "#SUCCESS",
  "date": "2026-03-07T15:00:00.000Z"
}
```

* * *
# DELETE /briefings/:id
Remove um briefing.
Este endpoint utiliza **hard delete** (não utiliza soft delete).
* * *
## Resposta de sucesso (200)

```json
{
  "responseType": "OK",
  "message": "Briefing removido com sucesso.",
  "status": 200,
  "data": {
    "id": "6601b3a4e4b0c1d2e3f4a5c7"
  },
  "extendedResultCode": "#SUCCESS",
  "date": "2026-03-07T12:00:00.000Z"
}
```

# Diagnosis

# Módulo Diagnosis
Módulo responsável pelo gerenciamento de **diagnósticos comerciais vinculados a um lead**.
O diagnóstico utiliza **hard delete** e mantém a **referência reversa sincronizada no backend** no campo `Lead.diagnoses`.
* * *
# Extended Result Codes

| Código | Significado |
| ---| --- |
| `#DIAGNOSIS_001` | O ID do diagnóstico informado é inválido (formato incorreto, não é um ObjectId de 24 caracteres hex). |
| `#DIAGNOSIS_002` | O diagnóstico solicitado não foi encontrado no banco de dados. |
| `#DIAGNOSIS_003` | Algum filtro ou parâmetro de ordenação da listagem é inválido. |
| `#DIAGNOSIS_004` | O `leadId` referenciado no diagnóstico é inválido (formato incorreto). |
| `#DIAGNOSIS_005` | O lead referenciado não existe ou foi removido (soft delete no módulo de leads). |

* * *
# Enums
## DiagnosisComplexity (complexity)
Complexidade estimada após o diagnóstico.
Envie sempre o **valor wire (string)** nas requisições.

| Valor wire | Descrição |
| ---| --- |
| `low` | Baixa complexidade |
| `medium` | Média complexidade (default no create) |
| `high` | Alta complexidade |

* * *
## DiagnosisServiceCategory (category)
Categoria de serviço recomendada no diagnóstico.
Envie sempre o **valor wire (string)** nas requisições.

| Valor wire | Descrição |
| ---| --- |
| `landing_page` | Landing page |
| `institutional_site` | Site institucional |
| `web_system` | Sistema web personalizado |
| `mvp` | MVP |
| `dashboard` | Dashboard |
| `automation` | Automação de processos |
| `integration` | Integração entre sistemas/APIs |
| `design` | Design e identidade visual |

* * *
## DiagnosisLeadTemperature (leadTemperature)
Temperatura percebida do lead após a reunião.
Envie sempre o **valor wire (string)** nas requisições.

| Valor wire | Descrição |
| ---| --- |
| `cold` | Lead frio |
| `warm` | Lead morno (default no create) |
| `hot` | Lead quente |

* * *
## DiagnosisOwner (conductedBy)
Sócios que conduziram o diagnóstico.
Envie **uma lista de valores wire (string)**.

| Valor wire | Descrição |
| ---| --- |
| `murillo` | Responsável técnico |
| `pedro` | Responsável de produto |
| `matheus` | Responsável comercial e desenvolvimento |

* * *
# Endpoints
* * *
# POST /diagnoses
Cria um novo **diagnóstico comercial**.
O campo `leadId` é **obrigatório** e precisa apontar para um **lead ativo**.
* * *
## Request — Payload

| Campo | Tipo | Obrigatório | Default | Descrição |
| ---| ---| ---| ---| --- |
| `leadId` | `string` | Sim | — | ObjectId do lead associado ao diagnóstico |
| `businessContext` | `string` | Sim | — | Contexto atual do negócio do lead |
| `realProblem` | `string` | Sim | — | Problema real identificado na reunião |
| `currentOperation` | `string` | Sim | — | Como o lead opera atualmente |
| `desiredTransformation` | `string` | Sim | — | Transformação esperada após o projeto |
| `priorities` | `string[]` | Sim | — | Lista de prioridades do diagnóstico. Não pode ser vazia |
| `complexity` | `string` | Não | `"medium"` | Complexidade estimada (`DiagnosisComplexity`) |
| `category` | `string` | Sim | — | Categoria de serviço recomendada (`DiagnosisServiceCategory`) |
| `estimatedBudget` | `number | null` | Não | `null` | Orçamento estimado para o projeto |
| `leadTemperature` | `string` | Não | `"warm"` | Temperatura do lead (`DiagnosisLeadTemperature`) |
| `conductedBy` | `string[]` | Sim | — | Sócios que conduziram o diagnóstico (`DiagnosisOwner`). Não pode ser vazio |
| `summary` | `string` | Sim | — | Resumo executivo do diagnóstico |

* * *
## Exemplo de request

```json
{
  "leadId": "6601a2b3e4b0c1d2e3f4a5b6",
  "businessContext": "Empresa vende cursos online para times comerciais.",
  "realProblem": "O time perde follow-up por falta de processo e ferramenta.",
  "currentOperation": "Atendimento por WhatsApp e planilhas separadas.",
  "desiredTransformation": "Centralizar pipeline, automacoes e historico do lead.",
  "priorities": ["Pipeline", "Automacao", "Dashboard"],
  "complexity": "high",
  "category": "web_system",
  "estimatedBudget": 8500,
  "leadTemperature": "hot",
  "conductedBy": ["pedro", "matheus"],
  "summary": "Lead com dor clara, urgencia comercial e aderencia a sistema web."
}
```

* * *
## Resposta de sucesso (201)

```json
{
  "responseType": "OK",
  "message": "Diagnostico criado com sucesso.",
  "status": 201,
  "data": {
    "diagnosis": {
      "id": "6601d5a4e4b0c1d2e3f4a5d8",
      "leadId": "6601a2b3e4b0c1d2e3f4a5b6",
      "businessContext": "Empresa vende cursos online para times comerciais.",
      "realProblem": "O time perde follow-up por falta de processo e ferramenta.",
      "currentOperation": "Atendimento por WhatsApp e planilhas separadas.",
      "desiredTransformation": "Centralizar pipeline, automacoes e historico do lead.",
      "priorities": ["Pipeline", "Automacao", "Dashboard"],
      "complexity": "high",
      "category": "web_system",
      "estimatedBudget": 8500,
      "leadTemperature": "hot",
      "conductedBy": ["pedro", "matheus"],
      "summary": "Lead com dor clara, urgencia comercial e aderencia a sistema web.",
      "createdAt": "2026-03-07T11:00:00.000Z",
      "updatedAt": "2026-03-07T11:00:00.000Z"
    }
  },
  "extendedResultCode": "#SUCCESS",
  "date": "2026-03-07T11:00:00.000Z"
}
```

* * *
# GET /diagnoses
Lista diagnósticos com **filtros e paginação**.
* * *
## Query Parameters

| Parâmetro | Tipo | Default | Descrição |
| ---| ---| ---| --- |
| `leadId` | `string` | — | Filtra por lead (ObjectId) |
| `complexity` | `string` | — | Filtra por complexidade (`DiagnosisComplexity`) |
| `category` | `string` | — | Filtra por categoria (`DiagnosisServiceCategory`) |
| `leadTemperature` | `string` | — | Filtra por temperatura do lead (`DiagnosisLeadTemperature`) |
| `conductedBy` | `string` | — | Filtra por sócio participante (`DiagnosisOwner`) |
| `createdFrom` | `string` | — | Data mínima de criação (ISO-8601) |
| `createdTo` | `string` | — | Data máxima de criação (ISO-8601) |
| `page` | `int` | `1` | Página atual |
| `limit` | `int` | `20` | Itens por página (máx. 100) |
| `sortBy` | `string` | `createdAt` | Campo de ordenação |
| `sortOrder` | `string` | `desc` | Direção (`asc` ou `desc`) |

Campos permitidos em `sortBy`:

```plain
createdAt
updatedAt
businessContext
complexity
category
leadTemperature
estimatedBudget
```

* * *
## Resposta de sucesso (200)

```json
{
  "responseType": "OK",
  "message": "Diagnosticos listados com sucesso.",
  "status": 200,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalItems": 1,
      "totalPages": 1,
      "sortBy": "createdAt",
      "sortOrder": "desc"
    }
  },
  "extendedResultCode": "#SUCCESS",
  "date": "2026-03-07T11:00:00.000Z"
}
```

* * *
# GET /diagnoses/:id
Retorna o **detalhe de um diagnóstico**.
* * *
## Resposta de sucesso (200)

```json
{
  "responseType": "OK",
  "message": "Diagnostico encontrado com sucesso.",
  "status": 200,
  "data": {
    "diagnosis": {}
  },
  "extendedResultCode": "#SUCCESS",
  "date": "2026-03-07T11:00:00.000Z"
}
```

* * *
# PATCH /diagnoses/:id
Atualiza campos do diagnóstico.
Campos **não enviados permanecem inalterados**.
É necessário enviar **pelo menos um campo**.
* * *
## Payload

| Campo | Tipo | Descrição |
| ---| ---| --- |
| `leadId` | `string` | Novo lead associado ao diagnóstico (precisa ser ativo) |
| `businessContext` | `string` | Contexto atual do negócio |
| `realProblem` | `string` | Problema real identificado |
| `currentOperation` | `string` | Operação atual do lead |
| `desiredTransformation` | `string` | Transformação desejada |
| `priorities` | `string[]` | Prioridades do diagnóstico. Substitui a lista inteira e não pode ser vazia |
| `complexity` | `string` | Complexidade (`DiagnosisComplexity`) |
| `category` | `string` | Categoria de serviço (`DiagnosisServiceCategory`) |
| `estimatedBudget` | `number | null` | Orçamento estimado. Envie `null` para limpar |
| `leadTemperature` | `string` | Temperatura do lead (`DiagnosisLeadTemperature`) |
| `conductedBy` | `string[]` | Sócios participantes (`DiagnosisOwner`). Substitui a lista inteira |
| `summary` | `string` | Resumo executivo do diagnóstico |

* * *
## Resposta de sucesso (200)

```json
{
  "responseType": "OK",
  "message": "Diagnostico atualizado com sucesso.",
  "status": 200,
  "data": {
    "diagnosis": {
      "id": "6601d5a4e4b0c1d2e3f4a5d8",
      "leadId": "6601a2b3e4b0c1d2e3f4a5b6",
      "businessContext": "Empresa agora tem SDR e CRM parcial.",
      "realProblem": "O time perde follow-up por falta de processo e ferramenta.",
      "currentOperation": "Atendimento por WhatsApp, CRM parcial e planilhas.",
      "desiredTransformation": "Centralizar pipeline, automacoes e historico do lead.",
      "priorities": ["Pipeline", "Automacao"],
      "complexity": "medium",
      "category": "automation",
      "estimatedBudget": null,
      "leadTemperature": "warm",
      "conductedBy": ["pedro"],
      "summary": "Escopo ajustado apos segunda reuniao.",
      "createdAt": "2026-03-07T11:00:00.000Z",
      "updatedAt": "2026-03-07T15:00:00.000Z"
    }
  },
  "extendedResultCode": "#SUCCESS",
  "date": "2026-03-07T15:00:00.000Z"
}
```

* * *
# DELETE /diagnoses/:id
Remove um diagnóstico.
Este endpoint utiliza **hard delete**.
* * *
## Resposta de sucesso (200)

```json
{
  "responseType": "OK",
  "message": "Diagnostico removido com sucesso.",
  "status": 200,
  "data": {
    "id": "6601d5a4e4b0c1d2e3f4a5d8"
  },
  "extendedResultCode": "#SUCCESS",
  "date": "2026-03-07T12:00:00.000Z"
}
```

# Mvp Preview & Files

# Módulo MVP Preview
Módulo responsável pelo gerenciamento de **MVP Previews** e seus **arquivos (filesystem virtual)**.
Um MVP Preview é gerado a partir de um **Briefing** e representa o **projeto conceitual entregue ao cliente**, mesmo quando o briefing **ainda não possui lead vinculado**.
* * *
# Extended Result Codes

| Código | Significado |
| ---| --- |
| `#MVP_PREVIEW_001` | O ID do MVP preview informado é inválido (formato incorreto, não é um ObjectId de 24 caracteres hex). |
| `#MVP_PREVIEW_002` | O MVP preview solicitado não foi encontrado no banco de dados. |
| `#MVP_PREVIEW_003` | Algum filtro ou parâmetro de ordenação da listagem é inválido. |
| `#MVP_PREVIEW_004` | O `briefingId` referenciado é inválido (formato incorreto ou ausente). |
| `#MVP_PREVIEW_005` | O ID do arquivo (`MvpFile`) informado é inválido. |
| `#MVP_PREVIEW_006` | O arquivo solicitado não foi encontrado no banco de dados. |

* * *
# Endpoints
* * *
# POST /mvp-previews
Cria um novo **MVP Preview**.
Aceita arquivos **inline** no campo `files`.
* * *
## Request — Payload

| Campo | Tipo | Obrigatório | Default | Descrição |
| ---| ---| ---| ---| --- |
| `briefingId` | `string` | Sim | — | ObjectId do briefing que originou o MVP. Deve ser único (relação 1:1). |
| `productName` | `string` | Sim | — | Nome do produto conceitual. |
| `framework` | `string` | Não | `"nextjs"` | Framework usado para gerar o preview (`nextjs`, `react`, `svelte`, `html`). |
| `conceptSummary` | `string` | Sim | — | Resumo do que o produto faz. |
| `valueProposition` | `string` | Sim | — | Proposta de valor principal. |
| `mainFeatures` | `string[]` | Sim | — | Funcionalidades principais do MVP. Não pode ser vazio. |
| `screens` | `string[]` | Sim | — | Lista de telas do MVP. Não pode ser vazio. |
| `userFlow` | `string[]` | Não | `[]` | Sequência de ações do usuário. |
| `notes` | `string` | Não | `null` | Notas internas sobre o MVP. |
| `files` | `object[]` | Não | `[]` | Arquivos do projeto enviados inline. |

* * *
## Estrutura de cada item em `files`

| Campo | Tipo | Obrigatório | Descrição |
| ---| ---| ---| --- |
| `path` | `string` | Sim | Caminho relativo do arquivo (ex: `app/page.tsx`). |
| `content` | `string` | Sim | Conteúdo completo do arquivo. |
| `language` | `string` | Sim | Linguagem/extensão (`tsx`, `js`, `css`, `json`). |

* * *
## Exemplo de request

```swift
{
  "briefingId": "6601b3a4e4b0c1d2e3f4a5c7",
  "productName": "DeliveryPro",
  "framework": "nextjs",
  "conceptSummary": "Plataforma de gestao de pedidos para restaurantes",
  "valueProposition": "Reduza em 80% o tempo de gerenciamento de pedidos",
  "mainFeatures": ["Cadastro de pedidos", "Dashboard de vendas"],
  "screens": ["Login", "Dashboard", "Pedidos"],
  "userFlow": ["Login", "Criar pedido", "Processar pagamento"],
  "notes": "Cliente pediu foco em mobile",
  "files": [
    {
      "path": "package.json",
      "content": "{\"name\":\"delivery-pro\",\"version\":\"0.1.0\"}",
      "language": "json"
    },
    {
      "path": "app/page.tsx",
      "content": "export default function Page(){ return <h1>Dashboard</h1> }",
      "language": "tsx"
    }
  ]
}
```

* * *
## Resposta de sucesso (201)

```json
{
  "responseType": "OK",
  "message": "MVP preview criado com sucesso.",
  "status": 201,
  "data": {
    "mvpPreview": {
      "id": "6601c4b5e4b0c1d2e3f4a5d8",
      "briefingId": "6601b3a4e4b0c1d2e3f4a5c7",
      "productName": "DeliveryPro",
      "framework": "nextjs",
      "conceptSummary": "Plataforma de gestao de pedidos para restaurantes",
      "valueProposition": "Reduza em 80% o tempo de gerenciamento de pedidos",
      "mainFeatures": ["Cadastro de pedidos", "Dashboard de vendas"],
      "screens": ["Login", "Dashboard", "Pedidos"],
      "userFlow": ["Login", "Criar pedido", "Processar pagamento"],
      "delivered": false,
      "notes": "Cliente pediu foco em mobile",
      "createdAt": "2026-03-07T11:00:00.000Z",
      "deliveredAt": null
    }
  },
  "extendedResultCode": "#SUCCESS",
  "date": "2026-03-07T11:00:00.000Z"
}
```

* * *
# GET /mvp-previews
Lista MVP previews com **filtros e paginação**.
Arquivos **não são incluídos na listagem**.
* * *
## Query Parameters

| Parâmetro | Tipo | Default | Descrição |
| ---| ---| ---| --- |
| `briefingId` | `string` | — | Filtra por briefing. |
| `delivered` | `string` | — | Filtra por status de entrega (`"true"` ou `"false"`). |
| `framework` | `string` | — | Filtra por framework (`nextjs`, `react`). |
| `createdFrom` | `string` | — | Data mínima de criação (ISO-8601). |
| `createdTo` | `string` | — | Data máxima de criação (ISO-8601). |
| `page` | `int` | `1` | Página atual. |
| `limit` | `int` | `20` | Itens por página (máx. 100). |
| `sortBy` | `string` | `createdAt` | Campo de ordenação. |
| `sortOrder` | `string` | `desc` | Direção (`asc` ou `desc`). |

Campos permitidos em `sortBy`:

```plain
createdAt
productName
framework
delivered
```

* * *
## Resposta de sucesso (200)

```json
{
  "responseType": "OK",
  "message": "MVP previews listados com sucesso.",
  "status": 200,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalItems": 1,
      "totalPages": 1,
      "sortBy": "createdAt",
      "sortOrder": "desc"
    }
  },
  "extendedResultCode": "#SUCCESS",
  "date": "2026-03-07T11:00:00.000Z"
}
```

* * *
# GET /mvp-previews/:id
Retorna o **detalhe de um MVP Preview**, incluindo **todos os arquivos do projeto**.
* * *
## Resposta de sucesso (200)

```json
{
  "responseType": "OK",
  "message": "MVP preview encontrado com sucesso.",
  "status": 200,
  "data": {
    "mvpPreview": {},
    "files": []
  },
  "extendedResultCode": "#SUCCESS",
  "date": "2026-03-07T11:00:00.000Z"
}
```

* * *
# PATCH /mvp-previews/:id
Atualiza campos do MVP Preview.
Campos **não enviados permanecem inalterados**.
Arquivos **não são alterados neste endpoint**.
* * *
## Payload

| Campo | Tipo | Descrição |
| ---| ---| --- |
| `productName` | `string` | Nome do produto |
| `framework` | `string` | Framework do preview |
| `conceptSummary` | `string` | Resumo conceitual |
| `valueProposition` | `string` | Proposta de valor |
| `mainFeatures` | `string[]` | Substitui lista inteira |
| `screens` | `string[]` | Substitui lista inteira |
| `userFlow` | `string[]` | Substitui lista inteira |
| `delivered` | `boolean` | Indica se foi entregue ao cliente |
| `deliveredAt` | `string | null` | Data de entrega |
| `notes` | `string | null` | Notas internas |

* * *
# DELETE /mvp-previews/:id
Remove o MVP Preview e **todos os seus arquivos (cascade)**.
Utiliza **hard delete**.
* * *
## Resposta de sucesso (200)

```json
{
  "responseType": "OK",
  "message": "MVP preview removido com sucesso.",
  "status": 200,
  "data": {
    "id": "6601c4b5e4b0c1d2e3f4a5d8"
  },
  "extendedResultCode": "#SUCCESS",
  "date": "2026-03-07T12:00:00.000Z"
}
```

* * *
# Arquivos do MVP Preview
* * *
# POST /mvp-previews/:id/files
Adiciona **novos arquivos** a um MVP Preview existente.
* * *
## Request — Payload

| Campo | Tipo | Obrigatório | Descrição |
| ---| ---| ---| --- |
| `files` | `object[]` | Sim | Lista de arquivos a adicionar. Deve conter ao menos um item. |

* * *
## Exemplo de request

```json
{
  "files": [
    {
      "path": "app/components/Header.tsx",
      "content": "export function Header(){ return <header>Header</header> }",
      "language": "tsx"
    }
  ]
}
```

* * *
## Resposta de sucesso (201)

```json
{
  "responseType": "OK",
  "message": "Arquivos adicionados com sucesso.",
  "status": 201,
  "data": {
    "files": []
  },
  "extendedResultCode": "#SUCCESS",
  "date": "2026-03-07T11:10:00.000Z"
}
```

* * *
# GET /mvp-previews/:id/files
Lista **todos os arquivos** de um MVP Preview.
* * *
## Resposta de sucesso (200)

```json
{
  "responseType": "OK",
  "message": "Arquivos listados com sucesso.",
  "status": 200,
  "data": {
    "files": []
  },
  "extendedResultCode": "#SUCCESS",
  "date": "2026-03-07T11:05:00.000Z"
}
```

* * *
# DELETE /mvp-previews/:id/files/:fileId
Remove um **arquivo individual** de um MVP Preview.
* * *
## Resposta de sucesso (200)

```json
{
  "responseType": "OK",
  "message": "Arquivo removido com sucesso.",
  "status": 200,
  "data": {
    "id": "6601d5c6e4b0c1d2e3f4a5e9"
  },
  "extendedResultCode": "#SUCCESS",
  "date": "2026-03-07T12:00:00.000Z"
}
```

* * *
# Como subir um projeto Next.js inteiro
O backend funciona como **storage de um filesystem virtual**.
Fluxo típico:
### 1 — Upload do projeto
O frontend monta o array `files` com todos os arquivos do projeto e envia para:

```plain
POST /mvp-previews
```

Cada arquivo vira um item com:
*   `path`
*   `content`
*   `language`
Exemplo:

```json
{
  "files": [
    { "path": "package.json", "content": "...", "language": "json" },
    { "path": "next.config.js", "content": "...", "language": "js" },
    { "path": "app/page.tsx", "content": "...", "language": "tsx" },
    { "path": "app/layout.tsx", "content": "...", "language": "tsx" },
    { "path": "app/globals.css", "content": "...", "language": "css" }
  ]
}
```

* * *
### 2 — Leitura para renderização
O site de preview chama:

```elixir
GET /mvp-previews/:id
```

Recebe:
*   `mvpPreview`
*   `files`
Com o array `files` o frontend **reconstrói a árvore virtual** do projeto e renderiza o preview.
* * *
### 3 — Adicionar novos arquivos
Use:

```elixir
POST /mvp-previews/:id/files
```

para adicionar arquivos extras a um preview já existente.

# Brainstorm 1.0.0

## O que nós somos?
**Somos um estúdio de engenharia digital.**
Projetamos, construímos e evoluímos soluções digitais completas.
Trabalhamos na interseção entre tecnologia, produto e experiência. Isso significa que não pensamos só na aparência de um projeto, mas em como ele funciona, escala e gera resultado real para quem usa.
Um estúdio de engenharia digital atua como parceiro técnico estratégico. Recebemos ideias em estágio inicial, processos desorganizados ou necessidades específicas de negócio e transformamos tudo isso em produtos digitais funcionais — desde landing pages e plataformas web até sistemas personalizados e automações complexas.
Nosso trabalho começa antes do código e continua depois da entrega. Organizamos o problema, definimos a melhor abordagem, construímos a solução e acompanhamos sua evolução ao longo do tempo.
Não seguimos modelos prontos nem soluções genéricas. Cada projeto é tratado como um produto em construção, pensado para resolver problemas reais e crescer junto com o cliente.
Mais do que fornecedores, atuamos como extensão técnica das empresas com quem trabalhamos — combinando engenharia, design e estratégia para transformar ideias em experiências digitais concretas.
# Porque no fim, tecnologia só importa quando funciona de verdade.
#   

**Lema de impacto:**
*   **"We Build Anything."**
*   **"Ideas Don’t Scare Us."**
*   **"Whatever It Takes, We Build."**
*   **"Built for Anything."**

# **Sub Titulo:**
*   **_"From idea to working product."_**
*   **_"Websites, systems and automation."_**
*   **_"Digital solutions built end-to-end."_**

## 1\. O que vocês realmente estão criando (não é um site)

Vocês NÃO estão criando um site. Vocês estão criando um **serviço de solução digital sob demanda**. O site é apenas o ponto de entrada.
Na prática, a proposta de vocês é:
> "Você tem uma ideia ou necessidade digital → nós transformamos em algo funcionando."

Isso muda completamente o posicionamento. Vocês não vendem páginas. Vocês vendem **resultado digital**.
* * *

## 2\. O problema que vocês resolvem

Toda empresa pequena/média vive uma destas dores:
*   "Preciso de um site, mas não sei por onde começar."
*   "Meu sobrinho fez meu site e ficou horrível."
*   "Tenho trabalho manual demais em planilhas."
*   "Preciso automatizar meus processos."
*   "Quero validar uma ideia de aplicativo rápido."
*   "Preciso parecer mais profissional na internet."

O cliente não quer saber qual linguagem de código vocês usam. Ele compra: **credibilidade, conversão, automação, presença digital e validação de ideia**.
* * *

## 3\. O que vocês oferecem (Pacotes Mentais Simples)

### Presença Digital
Para quem precisa existir online. Venda rápida, direta e ticket menor.
*   Landing pages
*   Sites institucionais
*   Portfólios
*   Sites de demonstração

### Construção de Produto
Para quem tem uma ideia de negócio. Ticket médio a alto.
*   MVPs (Produto Mínimo Viável)
*   Dashboards
*   Sistemas web
*   Integração de Backend + Frontend

### Automação & Scripts
Onde mora muito dinheiro. O cliente economiza tempo, logo o valor percebido é gigante.
*   Automação de processos operacionais
*   Integrações de APIs
*   Criação de bots
*   Scripts para redução de trabalho manual

### Evolução Digital (Recorrência)
O segredo da sobrevivência do negócio. Gera renda mensal previsível.
*   Manutenção de sistemas
*   Melhorias contínuas
*   Análise de dados (Analytics)
*   Otimização de usabilidade (UX) e novas funcionalidades

#AFTER
### Design & Identidade Visual
Para quem precisa parecer profissional antes mesmo de crescer. Posicionamento, percepção de valor e autoridade visual.
*   **Identidade visual**: criação de logo, paleta de cores e tipografia.
*   **Design de marca e posicionamento visual**: construção de uma imagem que comunica valor e credibilidade.
*   **Materiais institucionais**: apresentações, PDFs e conteúdos corporativos.
*   **Design para redes sociais**: criação de posts, stories e outros formatos visuais.
*   **Criação de layouts e peças gráficas**: banners, flyers, cartões e outros materiais.
*   **Redesign visual**: atualização de marcas existentes para um visual mais moderno e profissional.

* * *

## 4\. O Lema: "We Build Your Dream"

Funciona emocionalmente, mas é amplo demais. A emoção atrai, mas a clareza converte. Vocês precisam de um subtítulo racional. Exemplos:
*   _"From idea to working product."_
*   _"Websites, systems and automation."_
*   _"Digital solutions built end-to-end."_
* * *

## 5\. O diferencial real (O que decide o jogo)

Se vocês disserem apenas "fazemos sites bonitos", o mercado os engolirá. O diferencial precisa ser um destes caminhos:
*   **Velocidade**: "Seu projeto pronto e no ar em 7 dias."
*   **Especialização**: "Sistemas para clínicas médicas" ou "MVPs para startups".
*   **Engenharia**: "Não fazemos apenas sites. Construímos sistemas robustos."
*   **Parceiro Técnico**: Vocês atuam como o CTO terceirizado do cliente (este é o posicionamento mais forte e rentável).
* * *

## 6\. O modelo mental correto

Este é o fluxo de valor que vocês entregam. Isso não é ser um freelancer, é atuar como um **Digital Studio / Tech Partner**:
1. O cliente tem o caos digital.
2. Vocês organizam.
3. Vocês constroem.
4. Vocês mantêm.
5. Vocês evoluem.
* * *

## 7\. O erro clássico (Evitem a todo custo)

Não percam semanas tentando ter a logo perfeita, o nome perfeito ou o site próprio perfeito.
Primeiro vocês precisam de: **1 cliente real, 1 entrega real, 1 case real**. Todo o resto vem depois. No mercado B2B, nada vende mais do que mostrar um problema real que vocês já resolveram.
* * *

## 8\. A Proposta de Valor em Uma Frase

Se alguém perguntar o que vocês fazem no elevador:
> "Transformamos ideias em produtos digitais funcionais — de landing pages a sistemas completos e automações."
* * *

## 9\. A visão de longo prazo

Se executarem bem a base, o caminho natural da empresa será evoluir para:
*   Uma agência tech premium.
*   Uma Software House completa.
*   Um estúdio especializado em MVPs para startups.
*   Uma fábrica de produtos próprios (SaaS).
*   Consultoria tecnológica de alto nível.
* * *

Como a gente vai conseguir fazer o cara preencher o briefing de forma 100% orgânica (dopamina ativada):

O Pedro quis testar o claude porque ele pode visualizar o resultado que ele esperado com qualidade.

Qual a ideia do nosso negócio: convencer o usuário por meio de trafego pago e rede social a entrar no site e preencher o briefing e ter o MVP (MUITO BÁSICO) pronto em um dia e ter uma aba de visualização do seu produto no nosso site.

Se o lilo como programador, conseguiu

# Brainstorm 1.0.1 (Precificação)



# Manual de Diagnóstico

## Prisma Studio
* * *
# 1\. Objetivo do Diagnóstico
O Diagnóstico é uma reunião estratégica conduzida pelo Prisma Studio para transformar a ideia inicial do cliente em um problema claro, solucionável e estruturado.
O diagnóstico **não é uma reunião de venda**.
É uma etapa de entendimento profundo que:
*   valida o problema real
*   organiza o caos inicial do cliente
*   define direção técnica
*   estabelece autoridade do Prisma Studio
*   prepara a proposta correta
Resultado esperado:
> o cliente entende melhor o próprio problema após conversar com o Prisma Studio.
* * *
# 2\. Princípio Central
O cliente chega com uma ideia.
O Prisma Studio entrega clareza.
Regra fundamental:
> nunca discutir solução antes de entender o problema.
* * *
# 3\. Quando o Diagnóstico Acontece
O diagnóstico ocorre após:

```plain
Product Builder → MVP Preview → Interesse confirmado


```

Pré-condição:
*   cliente já viu valor antes da reunião.
Isso transforma a conversa de convencimento em colaboração.
* * *
# 4\. Objetivo Interno (o que realmente buscamos)
Durante o diagnóstico, o time deve descobrir:
1. Qual problema REAL está sendo resolvido
2. Qual impacto financeiro ou operacional existe
3. Qual nível de maturidade digital do cliente
4. Qual escopo mínimo viável
5. Se o cliente é adequado para o Prisma Studio
Sim — o diagnóstico também qualifica o cliente.
Nem todo projeto deve ser aceito.
* * *
# 5\. Estrutura da Reunião
Duração ideal:
**30 a 45 minutos**
Estrutura fixa:

```markdown
1. Contexto
2. Problema
3. Operação Atual
4. Objetivo Real
5. Prioridades
6. Direção Técnica Inicial
7. Próximos Passos


```

* * *
# 6\. Roteiro Oficial
## 1\. Contexto (5 min)
Objetivo: entender o negócio.
Perguntas:
*   O que sua empresa faz hoje?
*   Como vocês ganham dinheiro?
*   Quem é seu cliente principal?
Regra:
Não interromper. Apenas entender.
* * *
## 2\. Problema (10 min)
Aqui mora o ouro.
Perguntas-chave:
*   O que está travando hoje?
*   O que fez você buscar essa solução agora?
*   O que acontece se nada mudar?
Buscar dor real, não feature.
Evitar perguntas técnicas.
* * *
## 3\. Operação Atual (5–10 min)
Mapear como o cliente resolve hoje.
Exemplos:
*   planilhas?
*   WhatsApp?
*   processos manuais?
*   sistemas improvisados?
Objetivo:
descobrir ineficiências.
* * *
## 4\. Objetivo Real (5 min)
Pergunta crítica:
> “Se esse projeto funcionar perfeitamente, o que muda no seu negócio?”
Aqui surgem métricas reais:
*   mais vendas
*   menos trabalho manual
*   escala
*   profissionalização
* * *
## 5\. Prioridades (5 min)
Definir:
*   o que é essencial
*   o que pode esperar
*   o que NÃO é necessário agora
Começa a nascer o MVP real.
* * *
## 6\. Direção Técnica Inicial (5 min)
Somente agora o Prisma Studio fala de solução.
Nunca detalhar demais.
Formato:
*   explicar abordagem
*   mostrar entendimento
*   reduzir ansiedade
Exemplo:
> “Pelo que você descreveu, começamos com um MVP focado em X, depois evoluímos para Y.”
Objetivo: gerar confiança, não especificação técnica.
* * *
## 7\. Próximos Passos (2–3 min)
Encerrar com clareza absoluta:
*   proposta será enviada
*   prazo estimado
*   próximos contatos
Nunca terminar reunião sem próximo passo definido.
* * *
# 7\. Postura do Prisma Studio
Durante o diagnóstico:
*   agir como parceiro estratégico
*   fazer mais perguntas que afirmações
*   evitar linguagem excessivamente técnica
*   não prometer prazos ou valores definitivos
Regra de ouro:
> especialistas fazem perguntas melhores.
* * *
# 8\. Sinais de Alerta (Red Flags)
Projetos devem ser reavaliados quando:
*   cliente quer “algo igual ao concorrente”
*   foco apenas em preço
*   objetivo indefinido
*   urgência irreal
*   resistência a processo
Aceitar cliente errado gera prejuízo futuro.
* * *
# 9\. Resultado Interno Obrigatório
Após cada diagnóstico deve existir:
*   resumo do problema
*   objetivo principal
*   escopo MVP sugerido
*   nível de complexidade (baixo/médio/alto)
*   categoria de serviço
*   percepção do cliente (quente/morno/frio)
Registrar no ClickUp imediatamente.
* * *
# 10\. O Que NÃO Fazer
Nunca:
*   abrir editor de código
*   discutir stack tecnológica detalhada
*   estimar horas
*   negociar preço
*   transformar reunião em suporte gratuito
Diagnóstico não é execução.
* * *
# 11\. Métricas de Diagnóstico
O Prisma Studio acompanha:
*   diagnósticos realizados
*   taxa diagnóstico → proposta
*   taxa proposta → fechamento
*   tempo médio até fechamento
Se diagnóstico é bom, vendas se tornam previsíveis.
* * *
# 12\. Filosofia do Diagnóstico
Clientes não compram software.
Clientes compram clareza.
O diagnóstico é o momento em que o Prisma Studio prova que entende o problema melhor do que o próprio cliente.
Quando isso acontece, a venda deixa de ser convencimento e vira consequência.

# Playbook do Product Builder

## Prisma Studio
* * *
# 1\. Propósito do Product Builder
O **Product Builder** é a experiência interativa do Prisma Studio que permite ao visitante transformar uma ideia em um MVP conceitual visualizável antes de contratar qualquer serviço.
Ele não é um formulário.
Ele é uma simulação de criação de produto.
Seu objetivo principal é:
*   gerar encantamento
*   posicionar o Prisma Studio como parceiro técnico avançado
*   transformar curiosidade em intenção real de contratação
*   coletar briefing de forma orgânica
*   qualificar leads automaticamente
O Product Builder funciona como a primeira etapa prática da relação entre cliente e Prisma Studio.
* * *
# 2\. Princípio Central
O usuário não deve sentir que está preenchendo informações.
Ele deve sentir que está **construindo algo junto com um engenheiro**.
Regra absoluta:
> interação deve gerar sensação de progresso.
* * *
# 3\. Resultado Esperado da Experiência
Ao finalizar o Product Builder, o usuário deve sentir:
*   que sua ideia ganhou forma
*   que o Prisma entende seu problema
*   que o projeto já começou parcialmente
*   que continuar com o Prisma é o próximo passo natural
Emoção final desejada:
**“Preciso contratar eles.”**
* * *
# 4\. Estrutura Geral da Experiência
Tempo ideal da experiência:
**5 a 7 minutos (imersiva)**
Fluxo macro:

```powershell
Entrada
↓
Exploração da Ideia
↓
Construção Guiada
↓
Definição de Contexto
↓
Conclusão do Briefing
↓
Processamento (24h)
↓
Entrega do MVP Conceitual


```

* * *
# 5\. Estilo da Experiência
O Product Builder combina três modelos:
*   Conversa estilo IA
*   Passos visuais guiados
*   Escolhas rápidas interativas
O design final é proprietário do Prisma Studio e deve priorizar:
*   estética premium
*   UX fluida
*   sensação de produto moderno
*   feedback visual constante
* * *
# 6\. Personalidade do Sistema
O Product Builder fala como:
## Engenheiro parceiro
Tom:
*   colaborativo
*   confiante
*   técnico acessível
*   orientado à construção
Exemplo de abordagem:
> “Legal. Vamos estruturar isso juntos.”
Nunca:
*   linguagem robótica
*   tom corporativo frio
*   excesso de termos técnicos
O sistema representa o próprio Prisma Studio.
* * *
# 7\. Nível de Liberdade do Usuário
Entrada totalmente aberta.
O usuário pode descrever sua ideia livremente desde o início.
Após entrada livre, o sistema guia suavemente através de decisões estruturadas.
Modelo:

```plain
Liberdade → Organização → Clareza


```

* * *
# 8\. Dados Coletados (Briefing Orgânico)
Informações obrigatórias:
*   tipo de negócio
*   problema principal
*   público alvo
Essas informações devem ser obtidas naturalmente durante a experiência, nunca como formulário direto.
* * *
# 9\. MVP Preview (Entrega Principal)
Após finalizar o Builder:
O usuário aguarda até **24 horas**.
Ao retornar ao site, encontra um MVP conceitual básico do seu produto.
* * *
## O MVP deve conter:
*   nome do produto
*   proposta resumida
*   funcionalidades principais
*   estrutura de telas
*   wireframe visual simples
*   conceito de fluxo do usuário
* * *
## Regras Técnicas do MVP
*   estética e UX devem parecer reais
*   nenhuma integração real necessária
*   fluxos simulados
*   sem chamadas externas de API
*   foco total em percepção visual e clareza
O objetivo é validação emocional, não funcional.
* * *
# 10\. Captura de Contato
Contato solicitado:
*   após conclusão do briefing
*   opcionalmente disponível durante toda experiência
Motivação apresentada:
> “Receba acesso ao seu MVP quando estiver pronto.”
Contato nunca deve bloquear a experiência.
* * *
# 11\. Qualificação Automática Interna
O sistema deve gerar internamente:
*   estimativa de complexidade do projeto
*   classificação inicial do lead
*   categoria de serviço provável
Complexidade sugerida:
*   Baixa
*   Média
*   Alta
Essa informação é interna ao Prisma Studio.
* * *
# 12\. Objetivo Estratégico Oculto
O Product Builder existe para:
*   diferenciar o Prisma Studio do mercado tradicional
*   criar percepção de inovação
*   aumentar autoridade antes do contato humano
*   reduzir fricção comercial
Ele é simultaneamente:
*   ferramenta de marketing
*   sistema de qualificação
*   experiência de produto
*   laboratório de ideias de mercado
* * *
# 13\. Regras de Experiência (Não Negociáveis)
*   nunca parecer formulário
*   sempre mostrar progresso
*   sempre responder rapidamente
*   sempre reforçar construção conjunta
*   nunca pedir esforço sem retorno visual
* * *
# 14\. Métricas de Sucesso
O Product Builder será avaliado por:
*   taxa de conclusão
*   tempo médio na experiência
*   taxa de retorno após 24h
*   conversão para diagnóstico
*   conversão para proposta
Não medir apenas leads.
Medir engajamento.
* * *
# 15\. Evolução Futura
O Product Builder poderá evoluir para:
*   sistema semi-automatizado de geração de MVPs
*   plataforma própria do Prisma Studio
*   base de dados de oportunidades de SaaS
*   produto independente no futuro
* * *
# 16\. Filosofia do Product Builder
O Prisma Studio não pede briefing.
O Prisma Studio ajuda pessoas a enxergarem seus próprios produtos.
O Product Builder é o primeiro passo dessa construção.

# Manual Operacional

## Prisma Studio
* * *
# 1\. Identidade da Empresa
## Quem Somos
O **Prisma Studio** é um estúdio de engenharia digital.
Projetamos, construímos e evoluímos soluções digitais completas. Atuamos na interseção entre tecnologia, produto e experiência, transformando ideias, processos desorganizados e necessidades de negócio em produtos digitais funcionais.
Não desenvolvemos apenas interfaces. Construímos sistemas que funcionam, escalam e geram resultado real.
Nosso trabalho começa antes do código — organizando problemas, estruturando soluções e definindo estratégias — e continua após a entrega, acompanhando evolução e crescimento.
Atuamos como parceiro técnico estratégico, funcionando como uma extensão tecnológica das empresas com quem trabalhamos.
* * *
## Posicionamento
Não somos agência.
Não somos freelancers.
Somos um **Tech Partner**.
Vendemos soluções digitais completas — não páginas, tarefas isoladas ou horas de desenvolvimento.
* * *
## Proposta de Valor
Transformamos ideias em produtos digitais funcionais — de landing pages a sistemas completos, automações e plataformas digitais.
* * *
## Lema
**Whatever It Takes, We Build.**
(_O que for preciso, nós construímos. OU Custe o que custar, nós construímos._)
* * *
## Princípios Operacionais
*   Tecnologia só importa quando funciona.
*   Clareza antes de código.
*   Resolver o problema certo é mais importante que programar rápido.
*   Cada projeto é tratado como produto.
*   Entrega contínua vale mais que perfeição atrasada.
*   Progresso visível gera confiança.
* * *
# 2\. Estrutura e Governança
## Sócios
Todos os sócios são responsáveis pela evolução estratégica do Prisma Studio.
Cada área possui um responsável final para evitar decisões difusas e garantir velocidade operacional.
* * *
## Áreas da Empresa
### Técnico (Murillo)
Responsável por:
*   arquitetura de sistemas
*   desenvolvimento (Matheus e Murillo)
*   qualidade técnica
*   infraestrutura e deploy
* * *
### Produto (Pedro)
Responsável por:
*   entendimento do problema do cliente
*   definição de escopo
*   experiência do usuário
*   priorização de funcionalidades
*   coerência de produto
* * *
### Comercial (Matheus e Pedro)
Responsável por:
*   aquisição de clientes
*   relacionamento
*   propostas comerciais
*   condução do pipeline comercial
* * *
## Regra de Decisão
*   Decisões operacionais → responsável da área decide.
*   Decisões estratégicas → consenso entre sócios.
*   Empate → vence a opção com maior impacto prático e execução mais rápida.
* * *
# 3\. Modelo de Negócio
O Prisma Studio oferece **soluções digitais sob demanda**, atuando desde a concepção até a evolução contínua dos produtos.
* * *
## Categorias de Serviço
### Presença Digital
*   Landing pages
*   Sites institucionais
*   Portfólios
*   Sites demonstrativos
Objetivo: presença online rápida, profissional e orientada a conversão.
* * *
### Construção de Produto
*   MVPs
*   Sistemas web
*   Dashboards
*   Plataformas personalizadas
Objetivo: transformar ideias em produtos digitais reais.
* * *
### Automação & Scripts
*   automação de processos
*   integrações API
*   bots
*   redução de trabalho manual
Objetivo: eficiência operacional e economia de tempo.
* * *
### Evolução Digital (Recorrência)
*   manutenção contínua
*   melhorias evolutivas
*   analytics
*   otimizações de UX
Objetivo: crescimento sustentável do cliente e receita previsível.
* * *
### Design & Identidade Visual
*   identidade visual
*   branding
*   materiais institucionais
*   design para redes sociais
*   redesign de marca
Objetivo: elevar percepção de valor e autoridade profissional.
* * *
# 4\. Pipeline Comercial
O Prisma Studio utiliza um modelo híbrido de aquisição baseado em **experiência interativa de criação de produto**.
Antes da venda, o cliente vivencia a criação inicial do seu produto através do **Product Builder**, que transforma ideias em um MVP conceitual visualizável.
Esse processo reduz incerteza, educa o cliente e gera leads altamente qualificados.
* * *
## Fluxo do Cliente

```java
Visitante
↓
Product Builder (experiência interativa)
↓
MVP Preview (visualização inicial)
↓
Captura de Interesse
↓
Diagnóstico Estratégico
↓
Proposta Personalizada
↓
Fechamento
↓
Onboarding
↓
Execução
↓
Entrega
↓
Evolução Contínua
```

* * *
## Definição das Etapas
### Product Builder
Experiência interativa onde o usuário descreve sua ideia e constrói um esboço inicial do produto.
Objetivos:
*   coletar briefing naturalmente
*   educar o cliente
*   gerar investimento emocional
*   qualificar leads automaticamente
* * *
### MVP Preview
O sistema apresenta:
*   descrição do produto
*   funcionalidades iniciais
*   estrutura conceitual
*   visualização básica
Não representa produto final, mas uma validação inicial da ideia.
* * *
### Captura de Interesse
Contato solicitado apenas após entrega de valor inicial.
Objetivo: converter interesse em lead qualificado.
* * *
### Diagnóstico Estratégico
Reunião para:
*   validar problema real
*   ajustar escopo
*   definir MVP realista
*   identificar oportunidades futuras
O diagnóstico estabelece autoridade técnica.
* * *
## Regras Comerciais
*   Nunca enviar proposta sem diagnóstico.
*   Nunca aceitar projeto sem objetivo claro.
*   Sempre posicionar como parceria.
*   Priorizar potencial de continuidade (não aplicável até 15/05/2026).
* * *
# 5\. Pipeline de Projeto
## 1\. Descoberta
*   entender problema real
*   mapear necessidades
*   definir objetivo do produto
Entrega: escopo inicial validado.
* * *
## 2\. Planejamento
*   arquitetura técnica
*   backlog
*   definição do MVP
*   estimativas
Entrega: roadmap técnico.
* * *
## 3\. Execução
*   desenvolvimento incremental
*   entregas frequentes
*   validação contínua com cliente
* * *
## 4\. Entrega
*   deploy em ambiente final
*   testes funcionais
*   documentação básica
*   orientação ao cliente
* * *
## 5\. Pós-Projeto
*   coleta de feedback
*   proposta de evolução
*   possível entrada em plano recorrente
* * *
# 6\. Padrões Operacionais (SOPs)
## Novo Projeto
1. criar pasta no ClickUp
2. registrar cliente
3. definir responsável técnico
4. criar backlog inicial
5. agendar kickoff
* * *
## Deploy
*   ambiente validado
*   backup realizado
*   validação funcional
*   aprovação interna antes da publicação
* * *
## Comunicação com Cliente
*   respostas em até 24h úteis
*   decisões sempre registradas
*   mudanças de escopo documentadas
* * *
# 7\. Comunicação Interna
Ferramentas:
*   ClickUp → tarefas e decisões
*   WhatsApp / Discord → comunicação rápida
*   Documentos → fonte oficial
Regra fundamental:
> Se não está documentado, não foi decidido.
* * *
# 8\. Qualidade Técnica
Todo projeto deve:
*   possuir estrutura organizada
*   permitir manutenção futura
*   evitar soluções improvisadas
*   seguir padrões definidos pelo responsável técnico
### Definition of Done
*   funcional
*   testado
*   deployado
*   compreensível por outro desenvolvedor
* * *
# 9\. Financeiro (Base)
*   gastos acima do limite definido → aprovação conjunta
*   lucro dividido conforme acordo societário (33, 33, 33)
*   prioridade inicial: reinvestimento em crescimento
* * *
# 10\. Crescimento da Empresa
O Prisma Studio evolui através de:
*   projetos recorrentes
*   especialização progressiva
*   criação futura de produtos próprios (SaaS)
*   transformação gradual em software house
* * *
# 11\. Filosofia Operacional
O Prisma Studio não vende código.
Vendemos clareza, construção e evolução digital.
Nosso trabalho é transformar caos em sistemas funcionais.

* * *
Isso aqui agora não é só um manual — é praticamente o **sistema operacional inicial da empresa**.
O próximo salto (e esse é nível empresa que escala sem virar bagunça) é criar três documentos derivados:
1. **Playbook do Product Builder** (como a experiência funciona internamente)
2. **Manual de Diagnóstico** (como conduzir reuniões e fechar projetos)
3. **Sistema de Métricas da Empresa** (o painel que diz se vocês estão crescendo ou só trabalhando muito)

# Pages



# Prisma Payments



# O que já está pronto - Como funciona

## Glossário rápido

Antes de tudo, uns termos que vão aparecer bastante:

*   **Merchant** = o nosso cliente. A empresa ou pessoa que usa a Prisma Payments pra receber pagamentos. Cada merchant tem sua conta, seu saldo, suas configurações.
*   **Tenant** = é o "espaço isolado" de cada merchant. Pensa como se cada cliente nosso tivesse uma gaveta separada — um nunca vê o que tem na gaveta do outro. Quando a gente fala "multi-tenant", quer dizer que o sistema suporta vários clientes ao mesmo tempo, cada um no seu cantinho.
*   **Admin** = nós, a equipe da Prisma. Quem gerencia a plataforma por trás.
*   **Super-Admin** = nós 3 (os sócios). Temos acesso total a tudo — qualquer merchant, qualquer configuração.
*   **API Key** = uma "senha especial" que o merchant usa pra conectar o sistema dele no nosso. São duas chaves: uma pública (pode aparecer no código) e uma secreta (nunca pode vazar).
*   **Webhook** = uma notificação automática. Quando algo acontece (ex: pagamento confirmado), o nosso sistema avisa o sistema do merchant automaticamente, mandando uma mensagem pra um endereço que ele configurou.
*   **KYC (Know Your Customer)** = "Conheça seu Cliente". É o processo de verificar que o merchant é quem diz ser — pedimos documentos, analisamos, e aprovamos ou rejeitamos.
*   **JWT** = o "crachá digital" que prova que alguém tá logado. Expira depois de um tempo e precisa ser renovado.
*   **Ledger** = o extrato. Registro imutável de toda movimentação financeira (entrou, saiu, taxa cobrada, etc.).
*   **Sandbox / Modo de teste** = ambiente fake pra testar sem mexer com dinheiro real.
* * *

## Autenticação e Segurança

*   **Login separado** pra merchants (clientes) e admins (nós)
*   **Sessões rastreáveis** — dá pra invalidar login de qualquer lugar (se alguém for hackeado, a gente derruba a sessão)
*   **API Keys** pros merchants integrarem o sistema deles no nosso (par público + secreto)
*   **Whitelist de IP** — merchant pode dizer "só aceita requisições vindas desses IPs", mais uma camada de segurança
*   **Rate limiting** — proteção contra abuso. Se alguém tentar mandar milhares de requisições por segundo, é bloqueado
*   **Idempotência** — se o merchant mandar a mesma requisição de pagamento duas vezes (ex: internet caiu e reenviou), não duplica a cobrança
*   **Senha com hash bcrypt** — a senha nunca é armazenada em texto puro, só um "código embaralhado"
*   **Suporte a 2FA** — autenticação de dois fatores pronta na estrutura (aquele código do celular)
* * *

## Super-Admin (Painel dos Sócios)

*   **Seed automático** — no primeiro boot, as 3 contas dos sócios são criadas automaticamente como SUPER\_ADMIN
*   **Controle total** — acessamos dados de qualquer merchant
*   **Gestão de equipe** — criamos outros admins com permissões diferentes:
    *   ADMIN → pode criar merchants, configurar a plataforma
    *   SUPPORT → suporte ao dia-a-dia, alterar status de merchant, resolver disputas
    *   VIEWER → só leitura, não muda nada
*   **Provisioning de merchants** — criamos merchants direto pelo painel, já ativados e verificados (sem precisar que ele se cadastre sozinho)
*   **Geramos API keys** para qualquer merchant
*   **Configuramos settings** de qualquer merchant (limites de saque, webhooks, etc.)

### Hierarquia de Permissões

```css
SUPER_ADMIN (nós 3) → controle total de tudo
  └─ ADMIN → cria merchants, configura plataforma
      └─ SUPPORT → suporte, muda status, resolve disputas
          └─ VIEWER → só olha, não mexe em nada
```

* * *

## Processamento de Pagamentos (Core do Negócio)

É o coração do sistema. O merchant cria uma cobrança e o cliente final paga.

*   **PIX** — cria cobrança, retorna QR code e código copia-e-cola pro cliente pagar
*   **Boleto** — gera boleto com código de barras e vencimento
*   **Cartão de crédito/débito** — processamento de cartão
*   **Cancelamento** de pagamentos pendentes
*   **Listagem com filtros** — busca por status, método de pagamento, com paginação
*   **Taxas automáticas** — calcula a nossa taxa no ato, antes de creditar pro merchant
*   **Modo de teste** — merchant pode testar a integração sem movimentar dinheiro real

### Fluxo de um pagamento

CRIADO → PENDENTE → **PAGO** / FALHOU / CANCELADO / EXPIRADO / REEMBOLSADO
* * *

## Checkout (Links de Pagamento)

O jeito mais fácil pro merchant cobrar — sem precisar integrar nada no código.

*   **Links compartilháveis** — merchant cria um link, manda pro WhatsApp/email do cliente, cliente abre e paga
*   **Produtos no link** — pode adicionar vários itens com nome, preço e imagem
*   **Sessões de checkout** — cliente escolhe como quer pagar (PIX, Boleto, Cartão) e finaliza
*   **Página pública** — o cliente não precisa de conta pra acessar o link
*   **Customização visual** — cada merchant pode personalizar a aparência
*   **Redirecionamento** — após pagar, o cliente é mandado pra uma URL que o merchant escolheu
*   **Expiração automática** — se o cliente abriu e não pagou, a sessão é encerrada sozinha
* * *

## Saques (Withdrawals)

Como o merchant tira o dinheiro da plataforma pra conta bancária dele.

*   **Saque via PIX** — merchant solicita e o dinheiro vai pro banco dele
*   **Validação de saldo** — só saca se tiver saldo disponível (óbvio, mas o sistema garante)
*   **Limite diário** — configurável por merchant (a gente define ou ele define)
*   **Cálculo de taxa** automático no saque
*   **Integração com Transfeera** — provedor bancário que executa a transferência

### Fluxo de um saque

SOLICITADO → PROCESSANDO → **COMPLETO** / FALHOU / CANCELADO
* * *

## Saldo e Extrato (Ledger)

Todo merchant tem um saldo em tempo real e um extrato detalhado.

*   **Saldo dividido em 3:**
    *   **Disponível** — pode sacar agora
    *   **Pendente** — pagamento recebido mas ainda não confirmado
    *   **Retido** — preso temporariamente (ex: disputa em andamento)
*   **Extrato completo** — cada centavo que entrou ou saiu tá registrado e é imutável (ninguém edita)
*   **Liberação automática** — dinheiro retido é liberado quando a retenção expira
*   **Operações atômicas** — mesmo com várias requisições ao mesmo tempo, o saldo nunca fica errado
* * *

## Taxas e Billing

Como a gente ganha dinheiro.

*   **Regras de taxa flexíveis** — definimos taxa por tipo de transação (PIX, Boleto, Cartão, Saque)
*   **Taxa global** (padrão pra todos) e **taxa por merchant** (se quiser dar condição especial pra algum)
*   **Tipos de cálculo:**
    *   Percentual (ex: 1.99% do valor)
    *   Fixo (ex: R$ 1,00 por transação)
    *   Percentual + fixo (ex: 1.99% + R$ 0,50)
*   **Simulador de taxa** — calcula quanto vai cobrar antes de processar
*   **Resumo de faturamento diário** — todo dia o sistema gera um relatório automático de quanto entrou e quanto a gente cobrou de taxa
* * *

## Disputas (Chargebacks e Reembolsos)

Quando um cliente final reclama de uma cobrança.

*   **Tipos de disputa:**
    *   MED — mecanismo do PIX pra devolver dinheiro
    *   Chargeback — contestação de cartão de crédito
    *   Pedido de reembolso — merchant ou cliente pede devolução
*   **Retenção automática** — valor disputado fica preso no saldo do merchant até resolver
*   **Resolução pelo admin** — nós analisamos e aprovamos ou rejeitamos
*   **Listagem cross-merchant** — vemos todas as disputas de todos os merchants num lugar só

### Fluxo

ABERTA → EM REVISÃO → RESOLVIDA / REJEITADA
* * *

## Verificação KYC (Conheça seu Cliente)

Processo de verificar a identidade do merchant antes de liberar ele pra operar.

*   **Upload de documentos** — merchant envia: identidade (frente e verso), selfie, comprovante de endereço, contrato social
*   **Revisão pelo admin** — nós olhamos os documentos e aprovamos ou rejeitamos
*   **Status visível** — merchant acompanha se já foi verificado ou não
*   **Documentos no Cloudflare R2** — armazenados em storage seguro, não ficam no banco de dados

### Fluxo

NÃO VERIFICADO → PENDENTE DE REVISÃO → **VERIFICADO** / REJEITADO
* * *

## Gestão de Merchants (Onboarding)

Como um merchant entra na plataforma.

### Caminho 1: Auto-cadastro

*   Merchant se registra sozinho pelo site com dados da empresa (CNPJ/CPF, razão social, email)
*   Começa com status PENDENTE — precisa ser aprovado e verificado
*   Saldo zerado criado automaticamente

### Caminho 2: Nós criamos pelo painel

*   Entramos no admin e criamos o merchant direto, já ATIVO + VERIFICADO
*   Útil pra clientes que a gente fecha pessoalmente

### Configurações do merchant

*   Webhook URL — pra onde mandamos as notificações automáticas
*   Limite diário de saque
*   Auto-withdrawal — se ativar, o saque é feito sozinho quando o saldo bate um valor X

### Status do merchant

PENDENTE → **ATIVO** → SUSPENSO (temporário) / BLOQUEADO (permanente)
* * *

## Webhooks (Notificações Automáticas)

O sistema avisa automaticamente quando algo acontece — tanto pra gente quanto pro merchant.

### Dos provedores pra gente

*   Quando a Transfeera confirma um pagamento, ela manda uma notificação pro nosso sistema
*   O sistema atualiza o status do pagamento automaticamente

### Da gente pro merchant

*   Quando um pagamento é confirmado, falha, saque completa, etc. → avisamos o merchant no endereço que ele configurou
*   **Se falhar, tenta de novo** — até 5 vezes, esperando cada vez mais entre tentativas
*   **Assinatura de segurança** — o webhook vai "assinado" pra o merchant ter certeza que veio da gente
*   **Retry manual** — merchant pode pedir reenvio se precisar

### Eventos que disparam notificação

*   Pagamento confirmado / Pagamento falhou
*   Saque solicitado / Saque completo / Saque falhou
* * *

## Notificações em Tempo Real (WebSocket)

Além dos webhooks, o merchant pode se conectar e receber atualizações instantâneas no painel dele.

*   **Conexão em tempo real** — enquanto o painel tá aberto, as atualizações chegam na hora
*   **Canais por merchant** — cada um recebe só o que é dele
*   Pagamento confirmou? Aparece na hora. Saque completou? Atualiza na hora.
* * *

## Dashboard e Analytics

### Dashboard do Merchant (o que ele vê)

*   Saldo atual (disponível, pendente, retido)
*   Total de pagamentos (quantos, quantos pagos, quantos pendentes)
*   Total de saques (quantos, volume do dia)

### Dashboard Admin (o que nós vemos)

*   Total de merchants (ativos, pendentes, suspensos, bloqueados)
*   Total de pagamentos de toda a plataforma (com volumes em R$)
*   Total de saques de toda a plataforma
*   Estatísticas de disputas
* * *

## Provedores de Pagamento (Integrações)

Como o dinheiro realmente entra e sai.

*   **Transfeera** já integrada — é o provedor que executa os PIX, Boletos e transferências bancárias
*   **Arquitetura de plugins** — se amanhã quisermos trocar ou adicionar outro provedor, é só "plugar"
*   **Health check automático** — a cada 2 minutos verificamos se o provedor tá online
*   **Se cair, redireciona** — pode redirecionar pra outro provedor automaticamente
*   **Reconciliação automática** — a cada 6 horas conferimos se o que o provedor diz bate com o que temos no sistema
* * *

## Jobs Automáticos (Background)

Tarefas que rodam sozinhas, sem ninguém precisar apertar botão.

| Job | Frequência | O que faz |
| ---| ---| --- |
| Retry de webhooks | 1 min | Reenvia notificações que falharam |
| Liberação de retenções | 5 min | Libera saldo retido que venceu |
| Expirar pagamentos | 5 min | Marca cobranças vencidas como expiradas |
| Expirar sessões checkout | 5 min | Encerra links de pagamento abandonados |
| Health de provedores | 2 min | Verifica se Transfeera tá online |
| Reconciliação | 6 horas | Confere status com provedores |
| Faturamento diário | 1h da manhã | Gera relatório financeiro do dia |
| Limpeza de auditoria | 3h da manhã | Remove logs antigos |
| Limpeza de dados pessoais | 4h da manhã | Anonimiza dados antigos (LGPD) |
| Rebalanceamento | 10 min | Otimiza distribuição entre provedores |

* * *

## Diagnóstico e Monitoramento

Ferramentas pra gente saber se tá tudo funcionando.

*   **Log de todas as requisições** — tudo que entra e sai do sistema é gravado
*   **Dashboard de logs** — painel visual pra consultar o que aconteceu
*   **Rastreamento** — conseguimos seguir uma requisição do começo ao fim
*   **Sentry integrado** — se algo quebrar em produção, recebemos alerta
*   **Limpeza automática** — logs antigos são removidos pra não ocupar espaço
* * *

## Multi-tenancy e Isolamento

A segurança de que nenhum merchant vê dados de outro.

*   **Isolamento total** — merchant A **nunca** vê dados do merchant B
*   **Tudo filtrado automaticamente** — toda requisição de merchant já filtra pelos dados dele, não tem como "escapar"
*   **Modo de teste separado** — o sandbox do merchant não mistura com a produção
*   **Só nós (super-admins) vemos tudo** — a visão cross-merchant é exclusiva do painel admin
* * *

## Stack Técnico (pra quem quiser saber)

*   **Linguagem:** C# (.NET 10)
*   **Banco de dados:** MongoDB
*   **Cache:** Redis
*   **Jobs automáticos:** Hangfire
*   **Tempo real:** SignalR (WebSocket)
*   **Storage de documentos:** Cloudflare R2
*   **Email:** Mailjet
*   **Monitoramento:** Sentry
*   **Provedor de pagamento:** Transfeera