<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { ShieldCheck } from 'lucide-svelte';

  interface Props {
    data: {
      email: string;
      hasPendingChallenge: boolean;
    };
    form?: {
      success?: boolean;
      error?: string;
      email?: string;
    } | null;
  }

  let { data, form }: Props = $props();
  let loading = $state(false);
  const emailValue = $derived(form?.email ?? data.email);
</script>

<main class="auth-screen">
  <section class="auth-card">
    <div class="brand">
      <img src="/Logo_White@2x.png" alt="PRISMA Pay" />
    </div>

    <div class="hero-icon"><ShieldCheck size={22} strokeWidth={1.8} /></div>
    <h1>Validacao 2FA</h1>
    <p>Digite o codigo de 6 digitos do app autenticador para concluir o acesso.</p>

    <form
      method="POST"
      action="?/verify"
      use:enhance={() => {
        loading = true;
        return async ({ result, update }) => {
          loading = false;
          if (result.type === 'success' && result.data?.success) {
            await goto('/dashboard');
            return;
          }
          await update();
        };
      }}
    >
      <label>
        <span>E-mail</span>
        <input name="email" type="email" autocomplete="email" value={emailValue} readonly={data.hasPendingChallenge} />
      </label>

      {#if !data.hasPendingChallenge}
        <label>
          <span>Senha</span>
          <input name="password" type="password" autocomplete="current-password" />
        </label>
      {/if}

      <label>
        <span>Codigo</span>
        <input name="code" inputmode="numeric" maxlength="6" pattern="[0-9]{6}" autocomplete="one-time-code" />
      </label>

      {#if form?.error}
        <p class="error">{form.error}</p>
      {/if}

      <button type="submit" disabled={loading}>{loading ? 'Validando...' : 'Entrar com 2FA'}</button>
      <a href="/login">Voltar para login</a>
    </form>
  </section>
</main>

<style>
  .auth-screen {
    min-height: 100svh;
    display: grid;
    place-items: center;
    padding: 24px;
    background:
      radial-gradient(circle at 18% 12%, rgba(255, 0, 255, 0.1), transparent 34%),
      radial-gradient(circle at 82% 88%, rgba(1, 250, 251, 0.08), transparent 36%),
      #070707;
  }

  .auth-card {
    width: min(100%, 440px);
    padding: 34px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.01)), #0f0f18;
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.42);
  }

  .brand {
    display: flex;
    justify-content: center;
    margin-bottom: 8px;
  }

  .brand img {
    width: 148px;
    height: auto;
  }

  .hero-icon {
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    margin: 14px auto 12px;
    border: 1px solid rgba(1, 250, 251, 0.22);
    border-radius: 14px;
    color: var(--color-brand-cyan);
    background: rgba(1, 250, 251, 0.07);
  }

  h1 {
    margin: 0;
    text-align: center;
    font-size: 1.7rem;
  }

  p {
    margin: 8px auto 24px;
    max-width: 330px;
    text-align: center;
    color: var(--color-foreground-secondary);
    line-height: 1.5;
  }

  form,
  label {
    display: grid;
    gap: 10px;
  }

  form {
    gap: 15px;
  }

  label span {
    color: var(--color-foreground-secondary);
    font-family: var(--font-mono);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  input {
    width: 100%;
    min-height: 44px;
    padding: 0 13px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    background: #0a0a0f;
    color: var(--color-foreground);
    outline: none;
    box-sizing: border-box;
  }

  input:focus {
    border-color: rgba(1, 250, 251, 0.42);
    box-shadow: 0 0 0 3px rgba(1, 250, 251, 0.08);
  }

  .error {
    margin: 0;
    max-width: none;
    padding: 10px 12px;
    border: 1px solid rgba(255, 59, 92, 0.2);
    border-radius: 12px;
    color: var(--color-danger);
    background: rgba(255, 59, 92, 0.08);
    text-align: left;
    font-size: 0.84rem;
  }

  button {
    min-height: 46px;
    border: 1px solid rgba(255, 0, 255, 0.38);
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(255, 0, 255, 0.2), rgba(1, 250, 251, 0.1));
    color: var(--color-foreground);
    font-weight: 750;
    cursor: pointer;
  }

  button:disabled {
    opacity: 0.58;
    cursor: wait;
  }

  a {
    color: var(--color-brand-cyan);
    text-align: center;
    text-decoration: none;
    font-size: 0.84rem;
  }
</style>
