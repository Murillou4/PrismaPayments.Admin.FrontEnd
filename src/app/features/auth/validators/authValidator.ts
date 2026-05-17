export interface AuthValidationErrors {
  email?: string;
  password?: string;
}

export function validateLogin(email: string, password: string): AuthValidationErrors {
  const errors: AuthValidationErrors = {};

  if (!email || !email.trim()) {
    errors.email = 'E-mail é obrigatório.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'E-mail inválido.';
  }

  if (!password || password.length < 6) {
    errors.password = 'Senha deve ter pelo menos 6 caracteres.';
  }

  return errors;
}

export function hasErrors(errors: AuthValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}
