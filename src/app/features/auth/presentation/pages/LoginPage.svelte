<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';

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
</script>

<style>
  .login-btn:active:not(:disabled) {
    transform: scale(0.96);
  }
</style>

<div style="
  min-height: 100svh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #070707;
  position: relative;
  overflow: hidden;
  font-family: var(--font-body);
">
  <!-- Ambient glows -->
  <div style="
    position: absolute;
    width: 900px; height: 900px;
    top: -480px; left: -420px;
    background: radial-gradient(circle, rgba(255,0,255,0.09) 0%, transparent 65%);
    pointer-events: none;
  "></div>
  <div style="
    position: absolute;
    width: 800px; height: 800px;
    bottom: -440px; right: -380px;
    background: radial-gradient(circle, rgba(1,250,251,0.07) 0%, transparent 65%);
    pointer-events: none;
  "></div>

  <!-- Card -->
  <div style="
    position: relative;
    width: 100%;
    max-width: 460px;
    margin: 24px;
    padding: 48px;
    background: #0F0F18;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 24px;
    box-shadow: none;
  ">
    <!-- Top accent line -->
    <div style="
      position: absolute;
      top: 0; left: 40px; right: 40px;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,0,255,0.4), rgba(1,250,251,0.4), transparent);
      border-radius: 9999px;
    "></div>

    <!-- Logo area -->
    <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 12px;">
      <img src="/Logo_White@2x.png" alt="PRISMA Pay" style="height: 120px; width: auto; display: block;" />
    </div>

    <!-- Form -->
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
      style="display: flex; flex-direction: column; gap: 16px;"
    >
      <!-- Email -->
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <label for="email" style="
          font-size: 0.6875rem;
          font-weight: 600;
          color: #9090A8;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        ">E-mail</label>
        <input
          id="email"
          type="email"
          name="email"
          autocomplete="email"
          placeholder="admin@prisma.com"
          onfocus={() => emailFocused = true}
          onblur={() => emailFocused = false}
          style="
            background: #0A0A0F;
            border: 1px solid {emailFocused ? 'rgba(255,0,255,0.35)' : 'rgba(255,255,255,0.07)'};
            border-radius: 12px;
            padding: 13px 16px;
            color: #F6F6FF;
            font-size: 0.9375rem;
            font-family: var(--font-body);
            outline: none;
            width: 100%;
            box-sizing: border-box;
            transition: border-color 0.15s;
            box-shadow: {emailFocused ? '0 0 0 3px rgba(255,0,255,0.08)' : 'none'};
          "
        />
      </div>

      <!-- Password -->
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <label for="password" style="
          font-size: 0.6875rem;
          font-weight: 600;
          color: #9090A8;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        ">Senha</label>
        <input
          id="password"
          type="password"
          name="password"
          autocomplete="current-password"
          placeholder="••••••••"
          onfocus={() => passwordFocused = true}
          onblur={() => passwordFocused = false}
          style="
            background: #0A0A0F;
            border: 1px solid {passwordFocused ? 'rgba(255,0,255,0.35)' : 'rgba(255,255,255,0.07)'};
            border-radius: 12px;
            padding: 13px 16px;
            color: #F6F6FF;
            font-size: 0.9375rem;
            font-family: var(--font-body);
            outline: none;
            width: 100%;
            box-sizing: border-box;
            transition: border-color 0.15s;
            box-shadow: {passwordFocused ? '0 0 0 3px rgba(255,0,255,0.08)' : 'none'};
          "
        />
      </div>

      {#if form?.error}
        <div style="
          display: flex;
          align-items: center;
          gap: 8px;
          color: #FF3B5C;
          font-size: 0.8125rem;
          background: rgba(255,59,92,0.08);
          border: 1px solid rgba(255,59,92,0.18);
          padding: 10px 14px;
          border-radius: 10px;
        ">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6.5" stroke="#FF3B5C"/>
            <line x1="7" y1="4" x2="7" y2="8" stroke="#FF3B5C" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="7" cy="10" r="0.75" fill="#FF3B5C"/>
          </svg>
          {form.error}
        </div>
      {/if}

      <!-- Submit -->
      <button
        type="submit"
        disabled={loading}
        class="login-btn"
        style="
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #220030 0%, #001E20 100%);
          border: 1px solid rgba(255,0,255,0.45);
          border-radius: 12px;
          padding: 14px;
          color: #F6F6FF;
          font-size: 0.9375rem;
          font-weight: 600;
          font-family: var(--font-body);
          cursor: {loading ? 'not-allowed' : 'pointer'};
          margin-top: 8px;
          opacity: {loading ? '0.5' : '1'};
          width: 100%;
          letter-spacing: 0.01em;
          transition: opacity 0.15s, box-shadow 0.15s, transform 0.12s;
          box-shadow: 0 0 20px rgba(255,0,255,0.12);
        "
        onmouseenter={(e) => { if (!loading) e.currentTarget.style.boxShadow = '0 0 28px rgba(255,0,255,0.22)'; }}
        onmouseleave={(e) => { e.currentTarget.style.boxShadow = '0 0 20px rgba(255,0,255,0.12)'; }}
      >
        {loading ? 'Autenticando...' : 'Entrar'}
      </button>

      <a
        href="/forgot-password"
        style="
          display: inline-flex;
          justify-content: center;
          color: #01FAFB;
          font-size: 0.8125rem;
          text-decoration: none;
          margin-top: 2px;
        "
      >
        Esqueci minha senha
      </a>
    </form>
  </div>
</div>
