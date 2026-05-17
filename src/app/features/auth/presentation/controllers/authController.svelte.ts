import { goto } from '$app/navigation';

interface AuthState {
  loading: boolean;
  error: string | null;
  email: string;
  password: string;
}

function createAuthController() {
  let state = $state<AuthState>({
    loading: false,
    error: null,
    email: '',
    password: ''
  });

  async function login(): Promise<void> {
    state.loading = true;
    state.error = null;
    await goto('/login');
    state.loading = false;
  }

  return {
    get state() { return state; },
    login,
    setEmail(v: string) { state.email = v; },
    setPassword(v: string) { state.password = v; }
  };
}

export { createAuthController };
