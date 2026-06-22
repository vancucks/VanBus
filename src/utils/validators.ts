export const isRequired = (value: string) => value.trim().length > 0;

export const isEmail = (value: string) => /\S+@\S+\.\S+/.test(value.trim());

export const hasNumber = (value: string) => /\d/.test(value);

export const hasUppercase = (value: string) => /[A-Z]/.test(value);

export const validateRegistration = (name: string, email: string, password: string, confirmPassword?: string) => {
  if (!isRequired(name)) {
    return 'Nome obrigatorio.';
  }

  if (!isRequired(email) || !isEmail(email)) {
    return !isRequired(email) ? 'E-mail obrigatorio.' : 'E-mail invalido.';
  }

  if (!isRequired(password)) {
    return 'Senha obrigatoria.';
  }

  if (!hasNumber(password)) {
    return 'Senha deve conter pelo menos 1 numero.';
  }

  if (!hasUppercase(password)) {
    return 'Senha deve conter pelo menos 1 letra maiuscula.';
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    return 'Confirmar senha deve ser igual a senha.';
  }

  return null;
};

export const validateBus = (busNumber: string, lineNumber: string, status?: string | null) => {
  if (!isRequired(busNumber)) {
    return 'Numero do onibus obrigatorio.';
  }

  if (!isRequired(lineNumber)) {
    return 'Numero da linha obrigatorio.';
  }

  if (!status) {
    return 'Status obrigatorio.';
  }

  return null;
};
