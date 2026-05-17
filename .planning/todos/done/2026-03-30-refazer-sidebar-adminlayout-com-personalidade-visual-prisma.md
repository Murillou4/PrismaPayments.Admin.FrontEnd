---
created: 2026-03-30T23:42:29.645Z
title: Refazer sidebar AdminLayout com personalidade visual PRISMA
area: ui
files:
  - src/app/shared/widgets/AdminLayout.svelte
  - src/app.css
---

## Problem

A sidebar atual (`AdminLayout.svelte`) está visualmente apagada e não reflete a identidade da marca PRISMA. Os problemas específicos:

- Usa 100% inline styles, ignorando as classes utilitárias do Tailwind 4 e os design tokens do `app.css`
- Indicador de item ativo é apenas um `border-left` simples — sem glow, sem profundidade
- Hover states quase imperceptíveis (só `background 0.15s, color 0.15s`)
- Área do logo é muito enxuta, sem nenhum acento visual
- Sem separação visual entre grupos de navegação (ex: operacional vs. configuração)
- Não exibe informação do usuário logado — o rodapé só tem o botão de logout sem contexto
- Não aproveita os gradientes magenta/cyan, box-shadows glow, nem as fontes de display (Space Grotesk, Syne) que já existem no sistema

## Solution

Reescrever o `AdminLayout.svelte` com:

1. **Logo area** — adicionar um sutil gradiente ou linha de accent abaixo da logo, talvez um glow magenta suave
2. **Nav items com glow ativo** — item ativo com `box-shadow: var(--shadow-glow-magenta)` e fundo `surface-elevated`, usando `border-left` com cor `brand-magenta`; ícone ativo com cor magenta
3. **Hover expressivo** — background `surface` com transição suave + ícone muda de cor para `brand-cyan` no hover
4. **Agrupamento visual** — separar itens em grupos (ex: seção principal / configurações) com um label de categoria sutil em `font-mono` uppercase
5. **Rodapé com usuário** — exibir avatar placeholder + nome/email do admin logado acima do botão de logout; usar role badge (`SUPER_ADMIN` com cor magenta, outros em cyan)
6. **Substituir inline styles** — usar classes Tailwind + CSS variables, com `<style>` block para casos específicos
7. **Micro-interações** — icon scale sutil no hover (transform scale 1.1), transição `all 0.2s` mais completa
8. **Largura opcional** — considerar aumentar para 256px para dar mais respiro
