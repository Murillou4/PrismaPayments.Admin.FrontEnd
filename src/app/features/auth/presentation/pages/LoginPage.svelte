<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { Activity, ArrowRight, CheckCircle2, LockKeyhole, ShieldCheck } from 'lucide-svelte';

  interface Props {
    form?: {
      success?: boolean;
      error?: string;
      twoFactorRequired?: boolean;
      email?: string;
    } | null;
  }

  let { form }: Props = $props();
  let loading = $state(false);
  let emailFocused = $state(false);
  let passwordFocused = $state(false);

  const metrics = [
    { label: 'Aprovacao', value: '94.8%', tone: 'magenta' },
    { label: 'Latencia pix', value: '184ms', tone: 'cyan' },
    { label: 'Risco ativo', value: 'Baixo', tone: 'neutral' }
  ];

  const timeline = [
    { title: 'Sessao segura', detail: 'JWT e refresh protegidos por cookie HttpOnly.' },
    { title: 'Tenant isolado', detail: 'Contexto admin validado antes do dashboard.' },
    { title: 'Monitoramento', detail: 'Eventos criticos seguem para auditoria.' }
  ];
</script>

<main class="login-shell">
  <section class="login-panel" aria-label="Acesso administrativo Prisma Pay">
    <div class="brand-row">
      <img src="/Prisma_Pay_White.svg" alt="PRISMA Pay" class="brand-logo" />
      <span class="brand-pill"><ShieldCheck size={14} strokeWidth={1.8} /> Admin</span>
    </div>

    <div class="login-copy">
      <span class="eyebrow">Console Prisma</span>
      <h1>Entre para gerenciar a operacao.</h1>
      <p>Use suas credenciais administrativas para acessar pagamentos, merchants, webhooks e auditoria.</p>
    </div>

    <form
      method="POST"
      action="?/login"
      use:enhance={() => {
        loading = true;
        return async ({ result, update }) => {
          loading = false;
          if (result.type === 'success' && result.data?.twoFactorRequired) {
            await goto(`/login/2fa?email=${encodeURIComponent(String(result.data.email ?? ''))}`);
            return;
          }
          if (result.type === 'success' && result.data?.success) {
            await goto('/dashboard');
            return;
          }
          await update();
        };
      }}
      class="login-form"
    >
      <label class:focused={emailFocused}>
        <span>E-mail</span>
        <input
          type="email"
          name="email"
          autocomplete="email"
          placeholder="superadmin@prisma.local"
          onfocus={() => emailFocused = true}
          onblur={() => emailFocused = false}
        />
      </label>

      <label class:focused={passwordFocused}>
        <span>Senha</span>
        <input
          type="password"
          name="password"
          autocomplete="current-password"
          placeholder="Digite sua senha"
          onfocus={() => passwordFocused = true}
          onblur={() => passwordFocused = false}
        />
      </label>

      {#if form?.error}
        <div class="error-box" role="alert">
          <LockKeyhole size={16} strokeWidth={1.8} />
          <span>{form.error}</span>
        </div>
      {/if}

      <button type="submit" disabled={loading} class="login-btn">
        <span>{loading ? 'Autenticando...' : 'Entrar'}</span>
        <ArrowRight size={18} strokeWidth={1.8} />
      </button>

      <a href="/forgot-password" class="forgot-link">Esqueci minha senha</a>
    </form>
  </section>

  <aside class="flowbit-preview" aria-label="Resumo visual da operacao">
    <div class="preview-grid">
      <div class="hero-card">
        <div class="hero-card__top">
          <span><Activity size={14} strokeWidth={1.8} /> Live payments</span>
          <strong>R$ 482.760</strong>
        </div>
        <div class="chart-bars" aria-hidden="true">
          <i style="--h: 34%; --delay: -0.2s"></i>
          <i style="--h: 58%; --delay: -0.8s"></i>
          <i style="--h: 42%; --delay: -0.4s"></i>
          <i style="--h: 76%; --delay: -1.1s"></i>
          <i style="--h: 53%; --delay: -0.6s"></i>
          <i style="--h: 88%; --delay: -1.4s"></i>
          <i style="--h: 64%; --delay: -0.9s"></i>
        </div>
      </div>

      <div class="metric-strip">
        {#each metrics as metric, index}
          <div class={`metric metric--${metric.tone}`} style={`--index: ${index}`}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </div>
        {/each}
      </div>

      <div class="workflow-card">
        <div class="workflow-card__header">
          <span>Checklist de acesso</span>
          <CheckCircle2 size={18} strokeWidth={1.8} />
        </div>
        <div class="timeline">
          {#each timeline as item, index}
            <article style={`--index: ${index}`}>
              <span></span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </div>
            </article>
          {/each}
        </div>
      </div>
    </div>
  </aside>
</main>

<style>
  .login-shell {
    position: relative;
    isolation: isolate;
    min-height: 100dvh;
    display: grid;
    grid-template-columns: minmax(340px, 0.82fr) minmax(460px, 1.18fr);
    background:
      linear-gradient(180deg, rgba(255, 0, 255, 0.08), transparent 34%),
      radial-gradient(circle at 18% 18%, rgba(1, 250, 251, 0.18), transparent 26rem),
      radial-gradient(circle at 76% 12%, rgba(255, 0, 255, 0.24), transparent 31rem),
      linear-gradient(135deg, #050506 0%, #0a0a10 48%, #050507 100%);
    color: var(--color-foreground);
    font-family: var(--font-onest);
    overflow-x: hidden;
  }

  .login-shell,
  .login-shell :global(*) {
    box-sizing: border-box;
  }

  .login-shell::before,
  .login-shell::after {
    content: '';
    position: absolute;
    pointer-events: none;
  }

  .login-shell::before {
    z-index: 0;
    inset: -24% -15% auto;
    height: 68%;
    background:
      radial-gradient(circle at 14% 48%, rgba(1, 250, 251, 0.62), transparent 25%),
      radial-gradient(circle at 58% 30%, rgba(255, 0, 255, 0.58), transparent 29%),
      radial-gradient(circle at 86% 20%, rgba(114, 34, 131, 0.54), transparent 26%),
      conic-gradient(from 170deg at 48% 42%, rgba(1, 250, 251, 0.46), rgba(255, 0, 255, 0.58), rgba(114, 34, 131, 0.5), rgba(1, 250, 251, 0.46));
    filter: blur(54px) saturate(130%);
    opacity: 0.72;
    transform: translate3d(0, 0, 0) scale(1.05);
    animation: auroraDrift 16s ease-in-out infinite alternate;
  }

  .login-shell::after {
    z-index: 0;
    inset: 0;
    background:
      linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.028) 1px, transparent 1px),
      linear-gradient(180deg, transparent 0%, rgba(5, 5, 7, 0.44) 46%, #050507 100%);
    background-size: 44px 44px, 44px 44px, 100% 100%;
    mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.42) 52%, rgba(0, 0, 0, 0.94));
    opacity: 0.62;
  }

  .login-panel {
    position: relative;
    z-index: 1;
    display: flex;
    width: 100%;
    box-sizing: border-box;
    flex-direction: column;
    justify-content: center;
    min-width: 0;
    padding: clamp(28px, 5vw, 72px);
    border-right: 1px solid var(--color-border);
    background:
      linear-gradient(180deg, rgba(15, 15, 24, 0.78), rgba(7, 7, 11, 0.82)),
      radial-gradient(circle at 100% 0%, rgba(255, 0, 255, 0.08), transparent 24rem);
    backdrop-filter: blur(28px);
    box-shadow: inset -1px 0 0 rgba(255, 255, 255, 0.035);
  }

  .brand-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: clamp(42px, 8vh, 92px);
  }

  .brand-logo {
    width: 158px;
    max-width: 48vw;
    height: auto;
  }

  .brand-pill {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    height: 32px;
    padding: 0 12px;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.055);
    color: var(--color-foreground);
    font-size: 0.78rem;
    font-weight: 700;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      0 14px 32px rgba(0, 0, 0, 0.22);
  }

  .login-copy {
    max-width: 440px;
  }

  .eyebrow {
    display: inline-flex;
    margin-bottom: 14px;
    color: var(--color-brand-cyan);
    font-family: var(--font-onest);
    font-size: 0.72rem;
    font-weight: 760;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  h1 {
    margin: 0;
    color: var(--color-foreground);
    font-family: var(--font-onest);
    font-size: clamp(2.35rem, 4.8vw, 4.65rem);
    font-weight: 820;
    line-height: 0.98;
    letter-spacing: 0;
  }

  p {
    margin: 16px 0 0;
    color: var(--color-foreground-secondary);
    font-size: 1rem;
    line-height: 1.65;
  }

  .login-form {
    width: min(100%, calc(100vw - 72px), 440px);
    max-width: 440px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-top: 34px;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  label span {
    color: var(--color-foreground);
    font-size: 0.82rem;
    font-weight: 760;
  }

  input {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid var(--color-border);
    border-radius: 14px;
    background: rgba(10, 10, 15, 0.72);
    color: var(--color-foreground);
    font: inherit;
    font-size: 0.96rem;
    outline: none;
    padding: 15px 16px;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.055),
      0 16px 34px rgba(0, 0, 0, 0.1);
    transition:
      border-color 180ms cubic-bezier(0.16, 1, 0.3, 1),
      box-shadow 180ms cubic-bezier(0.16, 1, 0.3, 1),
      background 180ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  input::placeholder {
    color: var(--color-foreground-secondary);
  }

  label.focused input {
    border-color: rgba(1, 250, 251, 0.54);
    background: var(--color-surface);
    box-shadow:
      0 0 0 4px rgba(1, 250, 251, 0.09),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }

  .error-box {
    display: flex;
    align-items: center;
    gap: 10px;
    border: 1px solid rgba(255, 59, 92, 0.26);
    border-radius: 14px;
    background: rgba(255, 59, 92, 0.08);
    color: var(--color-danger);
    padding: 12px 14px;
    font-size: 0.86rem;
    line-height: 1.45;
  }

  .error-box :global(svg) {
    flex: 0 0 auto;
  }

  .login-btn {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    border: 0;
    border-radius: 14px;
    background:
      linear-gradient(135deg, rgba(255, 255, 255, 0.14), transparent 34%),
      linear-gradient(135deg, var(--color-brand-magenta), var(--color-secondary) 56%, #31103a);
    color: var(--color-foreground);
    cursor: pointer;
    font: inherit;
    font-size: 0.96rem;
    font-weight: 760;
    margin-top: 4px;
    min-height: 52px;
    padding: 0 18px 0 20px;
    box-shadow:
      0 22px 46px rgba(255, 0, 255, 0.18),
      inset 0 1px 0 rgba(255, 255, 255, 0.16);
    transition:
      transform 170ms cubic-bezier(0.16, 1, 0.3, 1),
      box-shadow 170ms cubic-bezier(0.16, 1, 0.3, 1),
      opacity 170ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .login-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 26px 54px rgba(255, 0, 255, 0.2);
  }

  .login-btn:active:not(:disabled) {
    transform: translateY(1px) scale(0.99);
  }

  .login-btn:disabled {
    cursor: not-allowed;
    opacity: 0.64;
  }

  .forgot-link {
    align-self: flex-start;
    color: var(--color-brand-cyan);
    font-size: 0.88rem;
    font-weight: 720;
    text-decoration: none;
    transition: color 160ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .forgot-link:hover {
    color: var(--color-foreground);
  }

  .flowbit-preview {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
    overflow: hidden;
    padding: clamp(28px, 6vw, 84px);
  }

  .flowbit-preview::before {
    content: '';
    position: absolute;
    inset: 9% 7%;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 34px;
    background:
      linear-gradient(rgba(255, 255, 255, 0.045) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.045) 1px, transparent 1px);
    background-size: 42px 42px;
    mask-image: linear-gradient(to bottom, transparent, black 14%, black 86%, transparent);
  }

  .flowbit-preview::after {
    content: '';
    position: absolute;
    width: min(72vw, 780px);
    aspect-ratio: 1.45;
    border-radius: 999px;
    background:
      linear-gradient(90deg, rgba(1, 250, 251, 0.18), rgba(255, 0, 255, 0.2), rgba(114, 34, 131, 0.12));
    filter: blur(58px);
    opacity: 0.62;
    transform: translate3d(9%, -8%, 0) rotate(-10deg);
    animation: previewGlow 12s ease-in-out infinite alternate;
  }

  .preview-grid {
    position: relative;
    z-index: 1;
    width: min(100%, 760px);
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(196px, 0.52fr);
    gap: 12px;
    animation: previewIn 620ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .hero-card,
  .workflow-card,
  .metric {
    position: relative;
    overflow: hidden;
    border: 1px solid var(--color-border);
    background: rgba(15, 15, 24, 0.66);
    backdrop-filter: blur(24px) saturate(130%);
    box-shadow:
      0 24px 60px rgba(0, 0, 0, 0.34),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }

  .hero-card {
    min-height: 382px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    grid-row: span 2;
    border-radius: 26px;
    padding: 28px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.02)),
      rgba(15, 15, 24, 0.66);
  }

  .hero-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(115deg, transparent 0%, rgba(1, 250, 251, 0.08) 35%, rgba(255, 0, 255, 0.12) 48%, transparent 64%);
    transform: translate3d(-110%, 0, 0);
    animation: cardSweep 4.2s ease-in-out infinite;
  }

  .hero-card > * {
    position: relative;
    z-index: 1;
  }

  .hero-card__top {
    display: flex;
    justify-content: space-between;
    gap: 20px;
  }

  .hero-card__top span,
  .workflow-card__header span {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--color-foreground-secondary);
    font-size: 0.82rem;
    font-weight: 760;
  }

  .hero-card__top strong {
    color: var(--color-foreground);
    font-family: var(--font-onest);
    font-size: clamp(1.45rem, 3vw, 2.25rem);
    letter-spacing: 0;
  }

  .chart-bars {
    position: relative;
    overflow: hidden;
    height: 250px;
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    align-items: end;
    gap: 12px;
    border-radius: 24px;
    background:
      linear-gradient(to top, rgba(255, 255, 255, 0.06) 1px, transparent 1px),
      radial-gradient(circle at 50% 0%, rgba(255, 0, 255, 0.14), transparent 34%),
      linear-gradient(180deg, rgba(26, 26, 40, 0.82), rgba(10, 10, 15, 0.78));
    background-size: 100% 25%, auto, auto;
    padding: 20px;
  }

  .chart-bars i {
    position: relative;
    z-index: 1;
    display: block;
    height: var(--h);
    min-height: 34px;
    border-radius: 999px 999px 10px 10px;
    background: linear-gradient(180deg, var(--color-brand-magenta), var(--color-brand-cyan));
    background-size: 100% 170%;
    box-shadow:
      0 14px 32px rgba(1, 250, 251, 0.12),
      0 -8px 24px rgba(255, 0, 255, 0.16),
      inset 0 1px 0 rgba(255, 255, 255, 0.22);
    transform-origin: bottom;
    will-change: transform, background-position;
    animation:
      barPulse 2.4s ease-in-out infinite,
      barGradient 3.8s ease-in-out infinite;
    animation-delay: var(--delay), var(--delay);
  }

  .metric-strip {
    display: grid;
    grid-template-rows: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .metric {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 10px;
    border-radius: 20px;
    padding: 20px;
    animation: metricFloat 4.8s ease-in-out infinite;
    animation-delay: calc(var(--index) * -900ms);
  }

  .metric::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(112deg, transparent 0%, rgba(255, 255, 255, 0.11) 44%, transparent 60%);
    opacity: 0.72;
    transform: translate3d(-120%, 0, 0);
    animation: metricSweep 4.4s ease-in-out infinite;
    animation-delay: calc(var(--index) * 320ms);
  }

  .metric::after {
    content: '';
    position: absolute;
    top: 18px;
    right: 18px;
    width: 8px;
    height: 8px;
    border-radius: 999px;
    animation: metricPing 1.9s ease-in-out infinite;
    animation-delay: calc(var(--index) * 260ms);
  }

  .metric > * {
    position: relative;
    z-index: 1;
  }

  .metric span {
    color: var(--color-foreground-secondary);
    font-size: 0.78rem;
    font-weight: 720;
  }

  .metric strong {
    color: var(--color-foreground);
    font-family: var(--font-onest);
    font-size: 1.38rem;
  }

  .metric--magenta {
    background:
      radial-gradient(circle at 100% 0%, rgba(255, 0, 255, 0.16), transparent 68%),
      rgba(15, 15, 24, 0.78);
  }

  .metric--magenta::after {
    background: var(--color-brand-magenta);
    box-shadow: 0 0 0 6px rgba(255, 0, 255, 0.08), 0 0 18px rgba(255, 0, 255, 0.42);
  }

  .metric--cyan {
    background:
      radial-gradient(circle at 100% 0%, rgba(1, 250, 251, 0.14), transparent 68%),
      rgba(15, 15, 24, 0.78);
  }

  .metric--cyan::after {
    background: var(--color-brand-cyan);
    box-shadow: 0 0 0 6px rgba(1, 250, 251, 0.08), 0 0 18px rgba(1, 250, 251, 0.4);
  }

  .metric--neutral {
    background:
      radial-gradient(circle at 100% 0%, rgba(114, 34, 131, 0.18), transparent 68%),
      rgba(15, 15, 24, 0.78);
  }

  .metric--neutral::after {
    background: var(--color-secondary-hover);
    box-shadow: 0 0 0 6px rgba(114, 34, 131, 0.1), 0 0 18px rgba(255, 0, 255, 0.24);
  }

  .workflow-card {
    border-radius: 24px;
    grid-column: 1 / -1;
    padding: 24px;
    background:
      radial-gradient(circle at 18% 0%, rgba(1, 250, 251, 0.09), transparent 34%),
      radial-gradient(circle at 88% 0%, rgba(255, 0, 255, 0.1), transparent 38%),
      rgba(15, 15, 24, 0.66);
  }

  .workflow-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(90deg, transparent, rgba(1, 250, 251, 0.08), rgba(255, 0, 255, 0.08), transparent);
    opacity: 0.72;
    transform: translate3d(-90%, 0, 0);
    animation: workflowSweep 5.6s ease-in-out infinite;
  }

  .workflow-card > * {
    position: relative;
    z-index: 1;
  }

  .workflow-card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
  }

  .timeline {
    position: relative;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    padding-top: 22px;
  }

  .timeline::before {
    content: '';
    position: absolute;
    pointer-events: none;
  }

  .timeline::before {
    top: 7px;
    left: 6px;
    right: 6px;
    height: 1px;
    border-radius: 999px;
    background: linear-gradient(90deg, rgba(1, 250, 251, 0.08), rgba(1, 250, 251, 0.34), rgba(255, 0, 255, 0.26), rgba(1, 250, 251, 0.08));
  }

  .timeline article {
    position: relative;
    display: block;
    opacity: 0;
    animation:
      itemIn 520ms cubic-bezier(0.16, 1, 0.3, 1) both,
      stepGlow 4.2s ease-in-out infinite;
    animation-delay: calc(var(--index) * 90ms + 180ms), calc(var(--index) * 520ms);
  }

  .timeline article > span {
    position: absolute;
    z-index: 1;
    top: -20px;
    left: 0;
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: var(--color-brand-cyan);
    box-shadow:
      0 0 0 5px rgba(1, 250, 251, 0.12),
      0 0 18px rgba(1, 250, 251, 0.38);
    animation: nodePulse 1.8s ease-in-out infinite;
    animation-delay: calc(var(--index) * 220ms);
  }

  .timeline article > span::before {
    content: '';
    position: absolute;
    inset: -7px;
    border-radius: inherit;
    border: 1px solid rgba(1, 250, 251, 0.28);
    opacity: 0;
    transform: scale(0.74);
    animation: nodeRing 1.8s ease-in-out infinite;
    animation-delay: calc(var(--index) * 220ms);
  }

  .timeline strong {
    color: var(--color-foreground);
    font-size: 0.9rem;
  }

  .timeline p {
    margin-top: 5px;
    color: var(--color-foreground-secondary);
    font-size: 0.82rem;
    line-height: 1.45;
  }

  @keyframes previewIn {
    from {
      opacity: 0;
      transform: translate3d(0, 18px, 0) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0) scale(1);
    }
  }

  @keyframes itemIn {
    from {
      opacity: 0;
      transform: translate3d(0, 10px, 0);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  @keyframes cardSweep {
    0%,
    42% {
      transform: translate3d(-115%, 0, 0);
    }
    72%,
    100% {
      transform: translate3d(115%, 0, 0);
    }
  }

  @keyframes barPulse {
    0%,
    100% {
      transform: translate3d(0, 0, 0) scaleY(0.86);
    }
    50% {
      transform: translate3d(0, -7px, 0) scaleY(1.08);
    }
  }

  @keyframes barGradient {
    0%,
    100% {
      background-position: 0 0;
    }
    50% {
      background-position: 0 100%;
    }
  }

  @keyframes metricFloat {
    0%,
    100% {
      transform: translate3d(0, 0, 0);
    }
    50% {
      transform: translate3d(0, -4px, 0);
    }
  }

  @keyframes metricSweep {
    0%,
    44% {
      transform: translate3d(-120%, 0, 0);
    }
    74%,
    100% {
      transform: translate3d(120%, 0, 0);
    }
  }

  @keyframes metricPing {
    0%,
    100% {
      opacity: 0.42;
      transform: scale(0.9);
    }
    50% {
      opacity: 1;
      transform: scale(1.2);
    }
  }

  @keyframes workflowSweep {
    0%,
    46% {
      transform: translate3d(-90%, 0, 0);
    }
    76%,
    100% {
      transform: translate3d(90%, 0, 0);
    }
  }

  @keyframes nodePulse {
    0%,
    100% {
      transform: scale(0.92);
    }
    50% {
      transform: scale(1.18);
    }
  }

  @keyframes nodeRing {
    0% {
      opacity: 0;
      transform: scale(0.7);
    }
    45% {
      opacity: 0.9;
    }
    100% {
      opacity: 0;
      transform: scale(1.5);
    }
  }

  @keyframes stepGlow {
    0%,
    100% {
      filter: brightness(1);
    }
    50% {
      filter: brightness(1.18);
    }
  }

  @keyframes auroraDrift {
    from {
      transform: translate3d(-2%, -3%, 0) scale(1.02) rotate(-2deg);
    }
    to {
      transform: translate3d(3%, 5%, 0) scale(1.1) rotate(3deg);
    }
  }

  @keyframes previewGlow {
    from {
      opacity: 0.44;
      transform: translate3d(3%, -10%, 0) rotate(-12deg) scale(0.96);
    }
    to {
      opacity: 0.7;
      transform: translate3d(11%, 3%, 0) rotate(8deg) scale(1.05);
    }
  }

  @media (max-width: 980px) {
    .login-shell {
      grid-template-columns: 1fr;
      overflow-y: auto;
    }

    .login-panel {
      min-height: auto;
      border-right: 0;
      border-bottom: 1px solid var(--color-border);
      background: linear-gradient(180deg, rgba(15, 15, 24, 0.8), rgba(7, 7, 11, 0.88));
    }

    .brand-row {
      margin-bottom: 52px;
    }

    .flowbit-preview {
      padding-top: 10px;
    }

    .preview-grid {
      grid-template-columns: 1fr;
      min-width: 0;
      width: 100%;
    }

    .hero-card {
      min-height: 310px;
      grid-row: auto;
    }

    .timeline {
      grid-template-columns: 1fr;
      gap: 16px;
      padding-top: 0;
    }

    .timeline article {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 11px;
    }

    .timeline article > span {
      position: relative;
      top: auto;
      left: auto;
      margin-top: 6px;
    }

    .timeline::before {
      top: 8px;
      bottom: 8px;
      left: 5px;
      right: auto;
      width: 1px;
      height: auto;
      background: linear-gradient(180deg, rgba(1, 250, 251, 0.1), rgba(1, 250, 251, 0.44), rgba(255, 0, 255, 0.36), rgba(1, 250, 251, 0.1));
    }
  }

  @media (max-width: 560px) {
    .login-panel {
      width: 100vw;
      max-width: 100vw;
      padding: 24px 18px 30px;
    }

    .brand-row,
    .login-copy,
    .login-form {
      width: 100%;
      max-width: 100%;
    }

    h1 {
      font-size: 2.18rem;
      line-height: 1.04;
    }

    .brand-row {
      align-items: flex-start;
      flex-direction: column;
      gap: 14px;
      margin-bottom: 34px;
    }

    .login-form {
      margin-top: 28px;
    }

    .flowbit-preview {
      padding: 16px 18px 28px;
    }

    .hero-card,
    .workflow-card {
      border-radius: 22px;
      padding: 20px;
    }

    .hero-card__top {
      align-items: flex-start;
      flex-direction: column;
      gap: 8px;
    }

    .hero-card__top strong {
      font-size: 1.65rem;
    }

    .chart-bars {
      height: 190px;
      gap: 8px;
      padding: 14px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .login-shell::before,
    .flowbit-preview::after,
    .preview-grid,
    .hero-card::before,
    .workflow-card::before,
    .metric,
    .metric::before,
    .metric::after,
    .timeline article,
    .timeline article > span,
    .timeline article > span::before,
    .chart-bars i {
      animation: none;
    }

    .preview-grid,
    .timeline article,
    .chart-bars i {
      opacity: 1;
      transform: none;
    }
  }
</style>
