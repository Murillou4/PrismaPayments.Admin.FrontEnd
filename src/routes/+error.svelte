<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
</script>

<div
  style="
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-background, #070707);
    padding: 32px;
  "
>
  <div
    style="
      width: 100%;
      max-width: 448px;
      background: var(--color-surface, #0F0F18);
      border: 1px solid var(--color-border, rgba(255,255,255,0.08));
      border-radius: var(--radius-2xl, 24px);
      box-shadow: var(--shadow-lg, 0 16px 48px rgba(0,0,0,0.60));
      padding: 32px;
    "
  >
    <!-- Código do erro -->
    <p
      style="
        font-family: var(--font-display);
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--color-danger, #FF3B5C);
        margin: 0 0 8px;
        font-variant-numeric: tabular-nums;
        text-wrap: balance;
      "
    >
      {$page.status}
    </p>

    <!-- Título -->
    <h1
      style="
        font-family: var(--font-display);
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--color-foreground, #F6F6FF);
        margin: 0 0 12px;
        text-wrap: balance;
      "
    >
      Algo deu errado
    </h1>

    <!-- Mensagem -->
    <p
      style="
        font-size: 0.875rem;
        color: var(--color-foreground-secondary, #9090A8);
        margin: 0 0 24px;
        line-height: 1.55;
        text-wrap: pretty;
      "
    >
      {$page.error?.message ?? 'Ocorreu um erro inesperado. Volte para a página anterior.'}
    </p>

    <!-- CTA Voltar -->
    <button
      onclick={() => history.length > 1 ? history.back() : goto('/dashboard')}
      style="
        background: transparent;
        border: 1px solid var(--color-border, rgba(255,255,255,0.08));
        border-radius: var(--radius-md, 12px);
        padding: 12px 24px;
        color: var(--color-foreground-secondary, #9090A8);
        font-size: 1rem;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.15s, border-color 0.15s, scale 0.1s;
        min-height: 44px;
      "
      onmousedown={(e) => (e.currentTarget.style.scale = '0.96')}
      onmouseup={(e) => (e.currentTarget.style.scale = '1')}
    >
      Voltar
    </button>
  </div>
</div>
