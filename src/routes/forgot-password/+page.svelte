<script lang="ts">
  import { enhance } from '$app/forms';
  import { Mail } from 'lucide-svelte';

  interface Props {
    form?: {
      success?: boolean;
      error?: string;
      message?: string;
      email?: string;
    } | null;
  }

  let { form }: Props = $props();
  let loading = $state(false);
</script>

<main class="auth-screen">
  <section class="auth-card">
    <img src="/Logo_White@2x.png" alt="PRISMA Pay" />
    <div class="hero-icon"><Mail size={22} strokeWidth={1.8} /></div>
    <h1>Reset de senha</h1>
    <p>Informe o e-mail do admin. Se houver cadastro, o backend envia as instrucoes de redefinicao.</p>

    <form
      method="POST"
      action="?/requestReset"
      use:enhance={() => {
        loading = true;
        return async ({ update }) => {
          loading = false;
          await update();
        };
      }}
    >
      <label>
        <span>E-mail</span>
        <input name="email" type="email" autocomplete="email" value={form?.email ?? ''} />
      </label>

      {#if form?.error}
        <p class="error">{form.error}</p>
      {:else if form?.success}
        <p class="success">{form.message}</p>
      {/if}

      <button type="submit" disabled={loading}>{loading ? 'Enviando...' : 'Enviar instrucoes'}</button>
      <a href="/reset-password">Ja tenho um token</a>
      <a href="/login">Voltar ao login</a>
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
    width: min(100%, 430px);
    padding: 34px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    background: #0f0f18;
  }

  img {
    display: block;
    width: 148px;
    margin: 0 auto 12px;
  }

  .hero-icon {
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    margin: 0 auto 12px;
    border: 1px solid rgba(1, 250, 251, 0.22);
    border-radius: 14px;
    color: var(--color-brand-cyan);
    background: rgba(1, 250, 251, 0.07);
  }

  h1,
  p {
    text-align: center;
  }

  h1 {
    margin: 0;
    font-size: 1.7rem;
  }

  p {
    margin: 8px 0 24px;
    color: var(--color-foreground-secondary);
    line-height: 1.5;
  }

  form,
  label {
    display: grid;
    gap: 10px;
  }

  form {
    gap: 14px;
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
    min-height: 44px;
    padding: 0 13px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    background: #0a0a0f;
    color: var(--color-foreground);
    outline: none;
  }

  input:focus {
    border-color: rgba(1, 250, 251, 0.42);
    box-shadow: 0 0 0 3px rgba(1, 250, 251, 0.08);
  }

  .error,
  .success {
    margin: 0;
    padding: 10px 12px;
    border-radius: 12px;
    text-align: left;
    font-size: 0.84rem;
  }

  .error {
    border: 1px solid rgba(255, 59, 92, 0.2);
    color: var(--color-danger);
    background: rgba(255, 59, 92, 0.08);
  }

  .success {
    border: 1px solid rgba(0, 230, 118, 0.2);
    color: var(--color-success);
    background: rgba(0, 230, 118, 0.08);
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
  }

  a {
    color: var(--color-brand-cyan);
    text-align: center;
    text-decoration: none;
    font-size: 0.84rem;
  }
</style>
